import { useEffect, useState, useRef } from "react"
import { 
  Search, Plus, X, Printer, Filter, ChevronDown, 
  Calendar, CreditCard, AlertCircle, CheckCircle,
  TrendingUp, DollarSign, Receipt, Users,
  RotateCcw, Zap, Shield, Star, Award, Edit2, Save,
  RefreshCw, Eye, Pencil, Trash2, Download, BarChart3,
  UserCheck, UserX, Clock, FileText, AlertTriangle, Bell,
  Settings, Power, Moon, Sun, LogOut, Home, Menu
} from "lucide-react"
import { getPaiements, genererPaiements, addPaiement, updatePaiement } from "../api/Paiements"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const niveaux = ["1ère année", "2ème année", "3ème année"]
const filieres = [
  "Ouvrage bois", "Ouvrage métallique", "Maçon polyvalent",
  "Hôtellerie", "Électrotechnique", "Bâtiment", "Mécanique automobile"
]
const filiereIds = {
  "Ouvrage bois": 1, "Ouvrage métallique": 2, "Maçon polyvalent": 3,
  "Hôtellerie": 4, "Électrotechnique": 5, "Bâtiment": 6, "Mécanique automobile": 7
}

// ✅ CORRECTION CRITIQUE : Formatage des montants SANS toLocaleString()
// toLocaleString() produit des caractères spéciaux (espaces insécables U+00A0)
// que jsPDF encode mal -> montants corrompus dans les PDF
const formatMontant = (montant) => {
  if (montant === null || montant === undefined || isNaN(montant)) return "0 Ar"
  const n = Math.round(Number(montant))
  // Formatage manuel avec espace simple ASCII
  const parts = n.toString().split('')
  const result = []
  parts.reverse().forEach((digit, i) => {
    if (i > 0 && i % 3 === 0) result.push(' ')
    result.push(digit)
  })
  return result.reverse().join('') + ' Ar'
}

// Formatage sans "Ar" pour les tableaux PDF
const formatMontantPDF = (montant) => {
  if (montant === null || montant === undefined || isNaN(montant)) return "0 Ar"
  const n = Math.round(Number(montant))
  const parts = n.toString().split('')
  const result = []
  parts.reverse().forEach((digit, i) => {
    if (i > 0 && i % 3 === 0) result.push(' ')
    result.push(digit)
  })
  return result.reverse().join('') + ' Ar'
}

const colsFixe = [
  { key: "inscription", label: "Inscription", icon: "Insc.", short: "Inscr", typeFrais: "inscription", mois: null },
  { key: "combinaison", label: "Combinaison", icon: "Comb.", short: "Comb", typeFrais: "combinaison", mois: null },
  { key: "tablier", label: "Tablier", icon: "Tabl.", short: "Tabl", typeFrais: "tablier", mois: null },
  { key: "tenue_fete", label: "Tenue Fête", icon: "Fête", short: "Fête", typeFrais: "tenue_fete", mois: null }
]

const colsMois = [
  { key: "septembre", label: "Septembre", icon: "Sep", short: "Sep", typeFrais: "ecolage", mois: "septembre", moisNum: 9, ordre: 1 },
  { key: "octobre", label: "Octobre", icon: "Oct", short: "Oct", typeFrais: "ecolage", mois: "octobre", moisNum: 10, ordre: 2 },
  { key: "novembre", label: "Novembre", icon: "Nov", short: "Nov", typeFrais: "ecolage", mois: "novembre", moisNum: 11, ordre: 3 },
  { key: "decembre", label: "Décembre", icon: "Déc", short: "Déc", typeFrais: "ecolage", mois: "decembre", moisNum: 12, ordre: 4 },
  { key: "janvier", label: "Janvier", icon: "Jan", short: "Jan", typeFrais: "ecolage", mois: "janvier", moisNum: 1, ordre: 5 },
  { key: "fevrier", label: "Février", icon: "Fév", short: "Fév", typeFrais: "ecolage", mois: "fevrier", moisNum: 2, ordre: 6 },
  { key: "mars", label: "Mars", icon: "Mar", short: "Mar", typeFrais: "ecolage", mois: "mars", moisNum: 3, ordre: 7 },
  { key: "avril", label: "Avril", icon: "Avr", short: "Avr", typeFrais: "ecolage", mois: "avril", moisNum: 4, ordre: 8 },
  { key: "mai", label: "Mai", icon: "Mai", short: "Mai", typeFrais: "ecolage", mois: "mai", moisNum: 5, ordre: 9 },
  { key: "juin", label: "Juin", icon: "Jun", short: "Jun", typeFrais: "ecolage", mois: "juin", moisNum: 6, ordre: 10 }
]

const tousLesFrais = [
  { key: "inscription", label: "Inscription", mois: null, type: "fixe", montant: 50000, icon: "Insc." },
  { key: "tablier", label: "Tablier", mois: null, type: "fixe", montant: 20000, icon: "Tabl." },
  { key: "combinaison", label: "Combinaison", mois: null, type: "fixe", montant: 30000, icon: "Comb." },
  { key: "tenue_fete", label: "Tenue fête", mois: null, type: "fixe", montant: 30000, icon: "Fête" },
  { key: "septembre", label: "Septembre", mois: "septembre", type: "mois", montant: 20000, icon: "Sep", moisNum: 9, ordre: 1 },
  { key: "octobre", label: "Octobre", mois: "octobre", type: "mois", montant: 20000, icon: "Oct", moisNum: 10, ordre: 2 },
  { key: "novembre", label: "Novembre", mois: "novembre", type: "mois", montant: 20000, icon: "Nov", moisNum: 11, ordre: 3 },
  { key: "decembre", label: "Décembre", mois: "decembre", type: "mois", montant: 20000, icon: "Déc", moisNum: 12, ordre: 4 },
  { key: "janvier", label: "Janvier", mois: "janvier", type: "mois", montant: 20000, icon: "Jan", moisNum: 1, ordre: 5 },
  { key: "fevrier", label: "Février", mois: "fevrier", type: "mois", montant: 20000, icon: "Fév", moisNum: 2, ordre: 6 },
  { key: "mars", label: "Mars", mois: "mars", type: "mois", montant: 20000, icon: "Mar", moisNum: 3, ordre: 7 },
  { key: "avril", label: "Avril", mois: "avril", type: "mois", montant: 20000, icon: "Avr", moisNum: 4, ordre: 8 },
  { key: "mai", label: "Mai", mois: "mai", type: "mois", montant: 20000, icon: "Mai", moisNum: 5, ordre: 9 },
  { key: "juin", label: "Juin", mois: "juin", type: "mois", montant: 20000, icon: "Jun", moisNum: 6, ordre: 10 }
]

const formatDate = (date) => {
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

const formatDateTime = (date) => {
  return `${formatDate(date)} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`
}

// ✅ MODALE DE SUCCÈS PDF (remplace alert())
function SuccessModal({ isOpen, onClose, title, message }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="text-white" size={36} />
          </div>
          <h3 className="text-white text-lg font-bold text-center">{title}</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-slate-600 text-sm mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

// ✅ MODALE D'ERREUR PDF
function ErrorModal({ isOpen, onClose, message }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
            <AlertCircle className="text-white" size={36} />
          </div>
          <h3 className="text-white text-lg font-bold">Erreur</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-slate-600 text-sm mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-300 hover:scale-105"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant Notification
function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle className="text-green-500" size={20}/>,
    error: <AlertCircle className="text-red-500" size={20}/>,
    warning: <AlertTriangle className="text-amber-500" size={20}/>,
    info: <Bell className="text-blue-500" size={20}/>
  }

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200"
  }

  return (
    <div className={`fixed top-20 right-4 z-[100] ${bgColors[type]} border rounded-xl shadow-lg p-4 min-w-[300px] animate-slide-in-right`}>
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-800">{message}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={16}/>
        </button>
      </div>
      <div className="mt-2 h-1 rounded-full" style={{
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6',
        width: '100%',
        animation: 'progress 5s linear forwards'
      }}></div>
    </div>
  )
}

const detecterRetards = (etudiant) => {
  const dateActuelle = new Date()
  const moisActuel = dateActuelle.getMonth() + 1
  const anneeActuelle = dateActuelle.getFullYear()
  const jourActuel = dateActuelle.getDate()
  
  const retards = []
  let totalMoisRetard = 0
  let montantTotalRetard = 0
  
  const moisScolaires = [
    { nom: "Septembre", moisNum: 9, key: "septembre", ordre: 1 },
    { nom: "Octobre", moisNum: 10, key: "octobre", ordre: 2 },
    { nom: "Novembre", moisNum: 11, key: "novembre", ordre: 3 },
    { nom: "Decembre", moisNum: 12, key: "decembre", ordre: 4 },
    { nom: "Janvier", moisNum: 1, key: "janvier", ordre: 5 },
    { nom: "Fevrier", moisNum: 2, key: "fevrier", ordre: 6 },
    { nom: "Mars", moisNum: 3, key: "mars", ordre: 7 },
    { nom: "Avril", moisNum: 4, key: "avril", ordre: 8 },
    { nom: "Mai", moisNum: 5, key: "mai", ordre: 9 },
    { nom: "Juin", moisNum: 6, key: "juin", ordre: 10 }
  ]
  
  let anneeScolaireDebut = anneeActuelle
  if (moisActuel < 9) {
    anneeScolaireDebut = anneeActuelle - 1
  }
  
  for (const mois of moisScolaires) {
    const statutPaiement = etudiant[mois.key]
    let estEnRetard = false
    let moisAEteAtteint = false
    
    if (mois.moisNum >= 9) {
      if (anneeScolaireDebut < anneeActuelle) {
        moisAEteAtteint = true
      } else if (anneeScolaireDebut === anneeActuelle) {
        if (mois.moisNum <= moisActuel) moisAEteAtteint = true
      }
    } else {
      if (anneeScolaireDebut + 1 < anneeActuelle) {
        moisAEteAtteint = true
      } else if (anneeScolaireDebut + 1 === anneeActuelle) {
        if (mois.moisNum <= moisActuel) moisAEteAtteint = true
      }
    }
    
    if (moisAEteAtteint) {
      if (statutPaiement !== 'payé') {
        const estMoisEnCours = (
          (anneeScolaireDebut === anneeActuelle && mois.moisNum >= 9 && mois.moisNum === moisActuel) ||
          (anneeScolaireDebut + 1 === anneeActuelle && mois.moisNum <= 6 && mois.moisNum === moisActuel)
        )
        
        if (!(estMoisEnCours && jourActuel <= 10)) {
          estEnRetard = true
          if (statutPaiement === 'partiel') {
            totalMoisRetard++
            montantTotalRetard += 10000
          } else if (statutPaiement === 'impayé' || !statutPaiement) {
            totalMoisRetard++
            montantTotalRetard += 20000
          }
        }
      }
      
      if (estEnRetard) {
        retards.push({
          mois: mois.nom,
          moisNum: mois.moisNum,
          statut: statutPaiement || 'impayé',
          montantDu: (statutPaiement === 'partiel') ? 10000 : 20000,
          ordre: mois.ordre
        })
      }
    }
  }
  
  retards.sort((a, b) => a.ordre - b.ordre)
  
  return {
    estEnRetard: retards.length > 0,
    retards: retards,
    totalMoisRetard: totalMoisRetard,
    montantTotalRetard: montantTotalRetard
  }
}

function ClickableBadge({ value, onClick, isEditing, editValue, onEditChange, onSave, onCancel }) {
  if (isEditing) {
    return (
      <div className="flex flex-col items-center gap-1 animate-scale-in">
        <select 
          className="text-[9px] border rounded px-1 py-0.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
          value={editValue?.statut || "impayé"}
          onChange={(e) => onEditChange({ ...editValue, statut: e.target.value })}
        >
          <option value="payé">Payé</option>
          <option value="partiel">Partiel</option>
          <option value="impayé">Impayé</option>
        </select>
        <div className="flex gap-1">
          <input 
            type="number" 
            className="w-16 text-[9px] border rounded px-1 py-0.5 text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
            value={editValue?.montant || 0}
            onChange={(e) => onEditChange({ ...editValue, montant: parseInt(e.target.value) || 0 })}
          />
          <button onClick={onSave} className="text-green-600 hover:text-green-700 hover:scale-110 transition-all duration-300"><Save size={10}/></button>
          <button onClick={onCancel} className="text-red-500 hover:text-red-600 hover:scale-110 transition-all duration-300"><X size={10}/></button>
        </div>
      </div>
    )
  }
  
  if (!value || value === "impayé")
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-0.5 hover:scale-110 transition-all duration-300 cursor-pointer group">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[8px] text-red-600 hidden md:inline group-hover:underline">Imp</span>
      </button>
    )
  if (value === "payé")
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-0.5 hover:scale-110 transition-all duration-300 cursor-pointer group">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-[8px] text-green-600 hidden md:inline group-hover:underline">Payé</span>
      </button>
    )
  if (value === "partiel")
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-0.5 hover:scale-110 transition-all duration-300 cursor-pointer group">
        <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-[8px] text-amber-600 hidden md:inline group-hover:underline">Part</span>
      </button>
    )
  return <span className="text-slate-300 text-xs">—</span>
}

function ExportPDFModal({ isOpen, onClose, onExport, data, stats }) {
  const [exportType, setExportType] = useState('all')
  const [includeStats, setIncludeStats] = useState(true)
  const [orientation, setOrientation] = useState('landscape')

  if (!isOpen) return null

  const handleExport = () => {
    onExport(exportType, includeStats, orientation)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText size={24}/>
            <h3 className="text-lg font-bold">Exporter la liste des paiements</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type d'exportation</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">Tous les étudiants</option>
              <option value="filtered">Étudiants filtrés uniquement</option>
              <option value="retard">Étudiants en retard uniquement</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Paysage</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeStats}
              onChange={(e) => setIncludeStats(e.target.checked)}
              className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">Inclure les statistiques</span>
          </label>
        </div>
        <div className="border-t p-4 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-xl text-sm hover:bg-slate-100 transition-all duration-300">Annuler</button>
          <button onClick={handleExport} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600 transition-all duration-300 flex items-center gap-2">
            <Download size={16}/>Exporter
          </button>
        </div>
      </div>
    </div>
  )
}

function Recu({ etudiant, anneeActive, onClose }) {
  const [animating, setAnimating] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [errorModal, setErrorModal] = useState(false)
  
  const handleClose = () => {
    setAnimating(true)
    setTimeout(onClose, 200)
  }
  
  const date = new Date()
  const dateFormatee = formatDate(date)
  const numero = `REC-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`
  
  const lignes = tousLesFrais.filter(f => {
    const val = f.type === "fixe" ? etudiant[f.key] : etudiant[f.mois]
    return val === "payé" || val === "partiel"
  })
  
  const total = lignes.reduce((acc, f) => {
    let montant = f.type === "fixe" ? f.montant : 20000
    if (etudiant[f.key] === "partiel" || etudiant[f.mois] === "partiel") {
      montant = montant / 2
    }
    return acc + montant
  }, 0)

  const generatePDF = () => {
    setGeneratingPDF(true)
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      const marginX = 15
      const marginY = 20
      
      doc.setDrawColor(0, 51, 102)
      doc.setLineWidth(0.5)
      doc.rect(marginX - 2, marginY - 2, pageWidth - (marginX * 2) + 4, pageHeight - (marginY * 2) + 4)
      
      doc.setFontSize(20)
      doc.setTextColor(0, 51, 102)
      doc.setFont("helvetica", "bold")
      doc.text("CENTRE DE FORMATION PROFESSIONNELLE", pageWidth / 2, marginY + 8, { align: "center" })
      doc.setFontSize(16)
      doc.text("DON BOSCO - MAHAJANGA", pageWidth / 2, marginY + 18, { align: "center" })
      
      doc.setDrawColor(0, 51, 102)
      doc.setLineWidth(0.5)
      doc.line(marginX, marginY + 22, pageWidth - marginX, marginY + 22)
      
      doc.setFontSize(18)
      doc.setTextColor(0, 0, 0)
      doc.text("RECU DE PAIEMENT", pageWidth / 2, marginY + 34, { align: "center" })
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.setFont("helvetica", "normal")
      doc.text("N: " + numero, pageWidth - marginX - 10, marginY + 8, { align: "right" })
      doc.text("Date: " + dateFormatee, pageWidth - marginX - 10, marginY + 15, { align: "right" })
      
      const infoY = marginY + 44
      doc.setFillColor(240, 248, 255)
      doc.rect(marginX, infoY, pageWidth - (marginX * 2), 45, 'F')
      
      doc.setFontSize(11)
      doc.setTextColor(0, 51, 102)
      doc.setFont("helvetica", "bold")
      doc.text("INFORMATIONS DE L'ETUDIANT", marginX + 5, infoY + 8)
      
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "normal")
      doc.text("Matricule: " + (etudiant.numero_matricule || ""), marginX + 5, infoY + 20)
      doc.text("Nom et prenoms: " + (etudiant.nom || "") + " " + (etudiant.prenom || ""), marginX + 5, infoY + 30)
      doc.text("Filiere: " + (etudiant.nom_filiere || "-"), marginX + 5, infoY + 40)
      doc.text("Niveau: " + (etudiant.niveau || "-"), pageWidth / 2 + 10, infoY + 40)
      
      // ✅ Tableau avec montants formatés correctement (ASCII pur)
      const tableData = lignes.map(f => {
        let montant = f.type === "fixe" ? f.montant : 20000
        let statut = f.type === "fixe" ? etudiant[f.key] : etudiant[f.mois]
        if (statut === "partiel") montant = montant / 2
        // Formatage ASCII pur sans caractères spéciaux
        const montantStr = montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ar"
        return [
          f.label,
          statut === "payé" ? "Paye" : "Partiel",
          montantStr
        ]
      })
      
      autoTable(doc, {
        startY: infoY + 48,
        head: [["Designation", "Statut", "Montant"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
          halign: "center",
          valign: "middle"
        },
        bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
        columnStyles: {
          0: { cellWidth: 80, halign: "left" },
          1: { cellWidth: 40, halign: "center" },
          2: { cellWidth: 55, halign: "right" }
        },
        margin: { left: marginX, right: marginX },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      })
      
      const finalY = doc.lastAutoTable.finalY + 8
      
      // ✅ Total formaté en ASCII pur
      const totalStr = total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ar"
      
      doc.setFillColor(0, 51, 102)
      doc.rect(marginX, finalY, pageWidth - (marginX * 2), 12, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.text("TOTAL A PAYER", marginX + 5, finalY + 8)
      doc.text(totalStr, pageWidth - marginX - 5, finalY + 8, { align: "right" })
      
      const footerY = pageHeight - marginY - 5
      doc.setDrawColor(200, 200, 200)
      doc.line(marginX, footerY - 5, pageWidth - marginX, footerY - 5)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.setFont("helvetica", "normal")
      doc.text("Merci de votre confiance - Ce recu fait office de justificatif de paiement", pageWidth / 2, footerY, { align: "center" })
      doc.text("CFP Don Bosco Mahajanga - Tel: 034 75 34 462", pageWidth / 2, footerY + 6, { align: "center" })
      
      doc.text("Signature de l'etudiant", marginX + 10, footerY + 15)
      doc.text("Signature du caissier", pageWidth - marginX - 40, footerY + 15)
      doc.line(marginX + 10, footerY + 17, marginX + 60, footerY + 17)
      doc.line(pageWidth - marginX - 40, footerY + 17, pageWidth - marginX, footerY + 17)
      
      doc.save("recu_" + (etudiant.numero_matricule || "etudiant") + "_" + dateFormatee.replace(/\//g, '-') + ".pdf")
      setSuccessModal(true)
    } catch (error) {
      console.error("Erreur génération PDF:", error)
      setErrorModal(true)
    } finally {
      setGeneratingPDF(false)
    }
  }

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${animating ? 'animate-fade-out' : 'animate-fade-in'}`}>
        <div className={`bg-white rounded-2xl w-full max-w-sm shadow-2xl ${animating ? 'animate-scale-out' : 'animate-scale-in'} overflow-hidden max-h-[90vh] flex flex-col`}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <Receipt size={16} />
              <span className="font-bold text-sm">Recu N° {numero.slice(-8)}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={generatePDF} disabled={generatingPDF} className="p-1 hover:bg-blue-500 rounded-lg transition-all duration-300 hover:scale-110 disabled:opacity-50" title="Télécharger PDF">
                <FileText size={14}/>
              </button>
              <button onClick={handleClose} className="p-1 hover:bg-blue-500 rounded-lg transition-all duration-300 hover:scale-110">
                <X size={14}/>
              </button>
            </div>
          </div>
          
          <div className="overflow-auto p-4">
            <div className="text-center border-b pb-3 mb-3">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h1 className="font-bold text-lg text-slate-800">DON BOSCO</h1>
              <p className="text-xs text-slate-500">Recu de paiement</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-slate-400 text-[10px]">Matricule</p>
                <p className="font-mono font-bold text-xs">{etudiant.numero_matricule}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-slate-400 text-[10px]">Date</p>
                <p className="font-semibold text-xs">{dateFormatee}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-slate-400 text-[10px]">Etudiant</p>
                <p className="font-semibold text-xs">{etudiant.nom} {etudiant.prenom}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-slate-400 text-[10px]">Filiere / Niveau</p>
                <p className="text-xs">{etudiant.nom_filiere || "—"} - {etudiant.niveau}</p>
              </div>
            </div>
            
            <table className="w-full text-xs border rounded-xl overflow-hidden mb-4">
              <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                <tr>
                  <th className="px-2 py-2 text-left">Designation</th>
                  <th className="px-2 py-2 text-center">Statut</th>
                  <th className="px-2 py-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((f, i) => {
                  let montant = f.type === "fixe" ? f.montant : 20000
                  let statut = f.type === "fixe" ? etudiant[f.key] : etudiant[f.mois]
                  if (statut === "partiel") montant = montant / 2
                  return (
                    <tr key={f.key} className={`${i % 2 ? "bg-slate-50" : "bg-white"}`}>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{f.label}</span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                          statut === "payé" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {statut === "payé" ? <CheckCircle size={8}/> : <AlertCircle size={8}/>}
                          {statut === "payé" ? "Paye" : "Partiel"}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono">{formatMontant(montant)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <tr>
                  <td colSpan={2} className="px-2 py-1.5 font-bold text-xs">TOTAL</td>
                  <td className="px-2 py-1.5 text-right font-bold">{formatMontant(total)}</td>
                </tr>
              </tfoot>
            </table>
            
            <div className="flex justify-between text-[9px] pt-2 border-t">
              <div>CFP Don Bosco Mahajanga</div>
              <div className="flex items-center gap-1"><Shield size={10}/>Cachet et signature</div>
            </div>
          </div>
          
          <div className="border-t p-3 flex justify-end gap-2 bg-slate-50 flex-shrink-0">
            <button 
              onClick={generatePDF} 
              disabled={generatingPDF}
              className="flex-1 px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50"
            >
              {generatingPDF ? (
                <><div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />Generation...</>
              ) : (
                <><FileText size={12} /> Telecharger PDF</>
              )}
            </button>
            <button onClick={handleClose} className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all hover:scale-105">
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Modales de résultat */}
      <SuccessModal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        title="PDF genere avec succes !"
        message={"Le recu de " + (etudiant.nom || "") + " " + (etudiant.prenom || "") + " a ete telecharge."}
      />
      <ErrorModal
        isOpen={errorModal}
        onClose={() => setErrorModal(false)}
        message="Une erreur est survenue lors de la generation du PDF. Veuillez reessayer."
      />
    </>
  )
}

// ✅ TableauRetardataires avec modale de succès et montants corrigés
function TableauRetardataires({ data, onRefresh, onClose }) {
  const [animating, setAnimating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filiereFilter, setFiliereFilter] = useState("")
  const [niveauFilter, setNiveauFilter] = useState("")
  const [retardataires, setRetardataires] = useState([])
  const [stats, setStats] = useState({ total: 0, totalMoisRetard: 0, montantTotal: 0 })
  const [successModal, setSuccessModal] = useState(false)
  const [errorModal, setErrorModal] = useState(false)
  const [detailModal, setDetailModal] = useState(null)

  useEffect(() => {
    analyserRetardataires()
  }, [data])

  const analyserRetardataires = () => {
    const analyse = data.filter(etudiant => {
      const { estEnRetard } = detecterRetards(etudiant)
      return estEnRetard
    }).map(etudiant => {
      const retardInfo = detecterRetards(etudiant)
      return { ...etudiant, retardInfo }
    })

    setRetardataires(analyse)
    
    const totalMois = analyse.reduce((sum, e) => sum + e.retardInfo.totalMoisRetard, 0)
    const montantTotal = analyse.reduce((sum, e) => sum + e.retardInfo.montantTotalRetard, 0)
    
    setStats({ total: analyse.length, totalMoisRetard: totalMois, montantTotal })
  }

  const handleClose = () => {
    setAnimating(true)
    setTimeout(onClose, 200)
  }

  const generateRetardListPDF = () => {
    setLoading(true)
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.width
      const marginX = 15
      const marginY = 20
      
      // En-tête
      doc.setFontSize(18)
      doc.setTextColor(0, 51, 102)
      doc.setFont("helvetica", "bold")
      doc.text("CENTRE DE FORMATION PROFESSIONNELLE", pageWidth / 2, marginY, { align: "center" })
      doc.text("DON BOSCO - MAHAJANGA", pageWidth / 2, marginY + 10, { align: "center" })
      doc.setFontSize(16)
      doc.setTextColor(220, 38, 38)
      doc.text("LISTE DES ETUDIANTS EN RETARD DE PAIEMENT", pageWidth / 2, marginY + 25, { align: "center" })
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.setFont("helvetica", "normal")
      doc.text("Genere le: " + formatDateTime(new Date()), pageWidth / 2, marginY + 35, { align: "center" })
      
      doc.setDrawColor(220, 38, 38)
      doc.setLineWidth(0.5)
      doc.line(marginX, marginY + 40, pageWidth - marginX, marginY + 40)
      
      const retardatairesFiltered = retardataires.filter(e =>
        (e.numero_matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         e.prenom?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (!filiereFilter || e.nom_filiere === filiereFilter) &&
        (!niveauFilter || e.niveau === niveauFilter)
      )
      
      // ✅ Montants formatés en ASCII pur pour le tableau PDF
      const tableData = retardatairesFiltered.map(e => {
        const montantStr = e.retardInfo.montantTotalRetard.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ar"
        return [
          e.numero_matricule || "",
          (e.nom || "") + " " + (e.prenom || ""),
          e.nom_filiere || "-",
          e.niveau || "-",
          e.retardInfo.totalMoisRetard + " mois",
          montantStr,
          e.retardInfo.retards.map(r => r.mois).join(", ")
        ]
      })
      
      autoTable(doc, {
        startY: marginY + 45,
        head: [["Matricule", "Nom complet", "Filiere", "Niveau", "Mois retard", "Montant du", "Mois concernes"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [220, 38, 38],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
          halign: "center"
        },
        bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
        margin: { left: marginX, right: marginX },
        alternateRowStyles: { fillColor: [255, 240, 240] }
      })
      
      const finalY = doc.lastAutoTable.finalY + 10
      
      // ✅ Statistiques avec montants ASCII purs
      const montantTotalStr = stats.montantTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ar"
      
      doc.setFillColor(240, 248, 255)
      doc.rect(marginX, finalY, pageWidth - (marginX * 2), 35, 'F')
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "bold")
      doc.text("STATISTIQUES", marginX + 5, finalY + 8)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("Total etudiants en retard: " + retardatairesFiltered.length, marginX + 5, finalY + 18)
      doc.text("Total mois de retard cumules: " + stats.totalMoisRetard + " mois", marginX + 5, finalY + 26)
      doc.text("Montant total du: " + montantTotalStr, marginX + 5, finalY + 34)
      
      // Pied de page
      const footerY = doc.internal.pageSize.height - 15
      doc.setDrawColor(200, 200, 200)
      doc.line(marginX, footerY - 5, pageWidth - marginX, footerY - 5)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text("CFP Don Bosco Mahajanga - Tel: 034 75 34 462", pageWidth / 2, footerY, { align: "center" })
      
      doc.save("liste_retardataires_" + new Date().toISOString().split('T')[0] + ".pdf")
      
      setSuccessModal(true) // ✅ Modale au lieu d'alert()
    } catch (error) {
      console.error("Erreur génération PDF:", error)
      setErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const retardatairesFiltered = retardataires.filter(e =>
    (e.numero_matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     e.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     e.prenom?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filiereFilter || e.nom_filiere === filiereFilter) &&
    (!niveauFilter || e.niveau === niveauFilter)
  )

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${animating ? 'animate-fade-out' : 'animate-fade-in'}`}>
        <div className={`bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl ${animating ? 'animate-scale-out' : 'animate-scale-in'}`}>
          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle className="text-white" size={24}/>
              </div>
              <div>
                <span className="font-bold text-lg">Etudiants en retard de paiement</span>
                <p className="text-xs text-white/80 mt-0.5">Paiements impayes apres le 10 du mois</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1 hover:bg-red-600 rounded-lg transition-all duration-300 hover:rotate-90">
              <X size={20}/>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-red-50 to-rose-50 flex-shrink-0">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Etudiants en retard</p>
                  <p className="text-3xl font-bold text-red-600">{stats.total}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full"><UserX className="w-6 h-6 text-red-600" /></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total mois de retard</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.totalMoisRetard}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full"><Clock className="w-6 h-6 text-amber-600" /></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Montant total du</p>
                  <p className="text-3xl font-bold text-emerald-600">{formatMontant(stats.montantTotal)}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full"><DollarSign className="w-6 h-6 text-emerald-600" /></div>
              </div>
            </div>
          </div>

          <div className="p-6 border-b flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16}/>
                <input
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-300"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white" value={filiereFilter} onChange={e => setFiliereFilter(e.target.value)}>
                <option value="">Toutes les filieres</option>
                {filieres.map(f => <option key={f}>{f}</option>)}
              </select>
              <select className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none bg-white" value={niveauFilter} onChange={e => setNiveauFilter(e.target.value)}>
                <option value="">Tous les niveaux</option>
                {niveaux.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-100">
                <tr className="border-b-2 border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Matricule</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Nom complet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Filiere</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Niveau</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Mois en retard</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Montant du</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600">Details</th>
                </tr>
              </thead>
              <tbody>
                {retardatairesFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="text-green-500" size={48}/>
                        <p className="text-slate-500 font-medium">Aucun etudiant en retard</p>
                        <p className="text-slate-400 text-sm">Tous les paiements sont a jour</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  retardatairesFiltered.map((e, idx) => (
                    <tr 
                      key={e.numero_matricule} 
                      className={`border-b border-slate-100 hover:bg-red-50 transition-all duration-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    >
                      <td className="px-4 py-3 font-mono text-sm font-medium">{e.numero_matricule}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm">{e.nom} {e.prenom}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{e.nom_filiere || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{e.niveau || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <Clock size={12}/>
                          {e.retardInfo.totalMoisRetard} mois
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">
                        {formatMontant(e.retardInfo.montantTotalRetard)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                          title="Voir les details"
                          onClick={() => setDetailModal(e)}
                        >
                          <Eye size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t p-4 flex justify-between items-center bg-slate-50 rounded-b-2xl flex-shrink-0">
            <div className="text-sm text-slate-500">{retardatairesFiltered.length} etudiant(s) affiche(s)</div>
            <div className="flex gap-3">
              <button
                onClick={generateRetardListPDF}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all duration-300 flex items-center gap-2 hover:scale-105 disabled:opacity-50"
              >
                {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Download size={16}/>}
                Exporter PDF
              </button>
              <button onClick={handleClose} className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all duration-300">Fermer</button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Modale détails retards */}
      {detailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Details des retards</h3>
                  <p className="text-xs text-white/80">{detailModal.nom} {detailModal.prenom}</p>
                </div>
              </div>
              <button onClick={() => setDetailModal(null)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">Matricule</p>
                  <p className="font-bold text-sm font-mono">{detailModal.numero_matricule}</p>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">Filiere</p>
                  <p className="font-bold text-sm">{detailModal.nom_filiere || "—"}</p>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500">Niveau</p>
                  <p className="font-bold text-sm">{detailModal.niveau}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {detailModal.retardInfo.retards.map((r, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-slate-700">{r.mois}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.statut === 'partiel' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {r.statut}
                      </span>
                    </div>
                    <span className="font-semibold text-red-600 text-sm">{formatMontant(r.montantDu)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-xl p-4 flex justify-between items-center">
                <span className="text-white font-bold">Total du</span>
                <span className="text-white font-bold text-lg">{formatMontant(detailModal.retardInfo.montantTotalRetard)}</span>
              </div>
            </div>
            <div className="border-t p-4 flex justify-end bg-slate-50">
              <button
                onClick={() => setDetailModal(null)}
                className="px-6 py-2 bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all hover:scale-105"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modale succès PDF retardataires */}
      <SuccessModal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        title="PDF genere avec succes !"
        message={"La liste des " + retardatairesFiltered.length + " etudiant(s) en retard a ete exportee avec succes."}
      />
      <ErrorModal
        isOpen={errorModal}
        onClose={() => setErrorModal(false)}
        message="Une erreur est survenue lors de la generation du PDF. Veuillez reessayer."
      />
    </>
  )
}

export default function Paiements() {
  const [data, setData] = useState([])
  const [anneeActive, setAnneeActive] = useState(null)
  const [loading, setLoading] = useState(false)
  const [animatedRows, setAnimatedRows] = useState([])
  const [search, setSearch] = useState("")
  const [niveauFilter, setNiveau] = useState("")
  const [filiereFilter, setFiliere] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showRetardTable, setShowRetardTable] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [formAnimating, setFormAnimating] = useState(false)
  const [recuEtudiant, setRecuEtudiant] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [exportSuccessModal, setExportSuccessModal] = useState(false)
  const [exportErrorModal, setExportErrorModal] = useState(false)
  
  const [editingPayment, setEditingPayment] = useState({
    active: false, matricule: null, typeFrais: null, mois: null,
    currentValue: null, editValue: { statut: "impayé", montant: 0 }
  })

  const initFrais = () => tousLesFrais.reduce((acc, f) => {
    acc[f.key] = { checked: false, montant: f.montant, statut: "payé" }
    return acc
  }, {})

  const [formBase, setFormBase] = useState({ numero_matricule: "", id_niveau: "", filiere_nom: "" })
  const [fraisForm, setFraisForm] = useState(initFrais())
  const [retardStats, setRetardStats] = useState({ totalRetardataires: 0, totalMoisRetard: 0 })

  const addNotification = (message, type) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const fetchAnneeActive = async () => {
    try {
      const res = await fetch("${API_URL}/annees/active")
      const annee = await res.json()
      setAnneeActive(annee)
      return annee
    } catch { setAnneeActive(null); return null }
  }

  const fetchData = async (annee = anneeActive) => {
    setLoading(true)
    try {
      const res = await getPaiements(annee?.id_annee || null)
      const dataArray = Array.isArray(res) ? res : []
      setData(dataArray)
      
      const retardataires = dataArray.filter(etudiant => detecterRetards(etudiant).estEnRetard)
      const totalMois = retardataires.reduce((sum, e) => sum + detecterRetards(e).totalMoisRetard, 0)
      setRetardStats({ totalRetardataires: retardataires.length, totalMoisRetard: totalMois })
      
      setTimeout(() => { setAnimatedRows(dataArray.map(() => true)) }, 100)
      addNotification("Donnees chargees avec succes", "success")
    } catch (error) {
      console.error("Erreur fetchData:", error)
      setData([])
      addNotification("Erreur lors du chargement des donnees", "error")
    }
    setLoading(false)
  }

  useEffect(() => { fetchAnneeActive().then(annee => fetchData(annee)) }, [])

  const handleGenerer = async (matricule, id_niveau) => {
    if (!id_niveau) { addNotification("Niveau introuvable", "error"); return }
    if (!confirm("Generer les paiements pour " + matricule + " ?")) return
    setLoading(true)
    try {
      const result = await genererPaiements(matricule, id_niveau)
      if (result?.error) { addNotification("Erreur: " + result.error, "error"); return }
      if (result?.already) { addNotification("Paiements deja generes", "warning"); return }
      await fetchData()
      addNotification("Paiements generes avec succes!", "success")
    } catch (error) {
      addNotification("Erreur lors de la generation", "error")
    }
    setLoading(false)
  }

  const handleEditClick = (etudiant, typeFraisInfo, currentValue) => {
    let defaultMontant = 20000
    if (typeFraisInfo.typeFrais === "inscription") defaultMontant = 50000
    else if (typeFraisInfo.typeFrais === "combinaison") defaultMontant = 30000
    else if (typeFraisInfo.typeFrais === "tablier") defaultMontant = 20000
    else if (typeFraisInfo.typeFrais === "tenue_fete") defaultMontant = 30000
    
    setEditingPayment({
      active: true,
      matricule: etudiant.numero_matricule,
      id_niveau: etudiant.id_niveau,
      id_filiere: etudiant.id_filiere,
      typeFrais: typeFraisInfo.typeFrais,
      mois: typeFraisInfo.mois,
      currentValue: currentValue,
      editValue: { statut: currentValue || "impayé", montant: defaultMontant }
    })
  }

  const handleSaveEdit = async () => {
    if (!editingPayment.active) return
    setLoading(true)
    try {
      const result = await updatePaiement(
        editingPayment.matricule,
        editingPayment.typeFrais,
        editingPayment.mois,
        { montant: editingPayment.editValue.montant, statut: editingPayment.editValue.statut }
      )
      if (result?.error) {
        addNotification("Erreur: " + result.error, "error")
      } else {
        addNotification("Paiement modifie avec succes!", "success")
        await fetchData()
      }
    } catch (error) {
      addNotification("Erreur lors de la modification", "error")
    }
    setEditingPayment({ active: false, matricule: null, typeFrais: null, mois: null, currentValue: null, editValue: { statut: "impayé", montant: 0 } })
    setLoading(false)
  }

  const handleCancelEdit = () => {
    setEditingPayment({ active: false, matricule: null, typeFrais: null, mois: null, currentValue: null, editValue: { statut: "impayé", montant: 0 } })
  }

  const resetForm = () => {
    setFormAnimating(true)
    setTimeout(() => {
      setFormBase({ numero_matricule: "", id_niveau: "", filiere_nom: "" })
      setFraisForm(initFrais())
      setShowForm(false)
      setFormAnimating(false)
    }, 200)
  }

  const handleAdd = async () => {
    const id_filiere = filiereIds[formBase.filiere_nom]
    const niveauId = Number(formBase.id_niveau)
    
    if (!id_filiere || !niveauId || !formBase.numero_matricule) {
      addNotification("Veuillez remplir tous les champs", "error")
      return
    }
    
    const lignes = tousLesFrais.filter(f => fraisForm[f.key].checked)
    if (lignes.length === 0) { addNotification("Cochez au moins un paiement", "error"); return }

    setLoading(true)
    let successCount = 0
    let errorCount = 0
    
    for (const f of lignes) {
      try {
        await addPaiement({
          numero_matricule: formBase.numero_matricule,
          id_niveau: niveauId,
          id_filiere: id_filiere,
          type_frais: f.type === "fixe" ? f.key : "ecolage",
          mois: f.mois || null,
          montant: Number(fraisForm[f.key].montant),
          statut: fraisForm[f.key].statut
        })
        successCount++
      } catch (error) {
        console.error("Erreur paiement:", error)
        errorCount++
      }
    }
    
    if (successCount > 0) {
      addNotification(successCount + " paiement(s) enregistre(s) ! " + (errorCount > 0 ? errorCount + " erreur(s)" : ''), "success")
      resetForm()
      await fetchData()
    } else {
      addNotification("Aucun paiement n'a pu etre enregistre", "error")
    }
    setLoading(false)
  }

  const handleExportPDF = (exportType, includeStats, orientation) => {
    setLoading(true)
    try {
      let exportData = []
      if (exportType === 'all') exportData = data
      else if (exportType === 'filtered') exportData = filteredData
      else if (exportType === 'retard') exportData = data.filter(e => detecterRetards(e).estEnRetard)
      
      const doc = new jsPDF({ orientation: orientation, unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.width
      const marginX = 15
      const marginY = 20
      
      doc.setFontSize(18)
      doc.setTextColor(0, 51, 102)
      doc.setFont("helvetica", "bold")
      doc.text("CENTRE DE FORMATION PROFESSIONNELLE", pageWidth / 2, marginY, { align: "center" })
      doc.setFontSize(14)
      doc.text("DON BOSCO - MAHAJANGA", pageWidth / 2, marginY + 10, { align: "center" })
      doc.setFontSize(16)
      doc.text("LISTE DES PAIEMENTS", pageWidth / 2, marginY + 25, { align: "center" })
      
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.setFont("helvetica", "normal")
      doc.text("Genere le: " + formatDateTime(new Date()), pageWidth / 2, marginY + 35, { align: "center" })
      
      doc.setDrawColor(0, 51, 102)
      doc.setLineWidth(0.5)
      doc.line(marginX, marginY + 40, pageWidth - marginX, marginY + 40)
      
      // ✅ Montants PDF formatés en ASCII pur
      const tableData = exportData.map(e => {
        const retardInfo = detecterRetards(e)
        const montantStr = retardInfo.montantTotalRetard.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ar"
        return [
          e.numero_matricule || "",
          (e.nom || "") + " " + (e.prenom || ""),
          e.nom_filiere || "-",
          e.niveau || "-",
          e.inscription === "payé" ? "Paye" : e.inscription === "partiel" ? "Partiel" : "Impaye",
          retardInfo.estEnRetard ? "Oui" : "Non",
          montantStr
        ]
      })
      
      autoTable(doc, {
        startY: marginY + 45,
        head: [["Matricule", "Nom complet", "Filiere", "Niveau", "Inscription", "En retard", "Montant du"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontSize: 9, fontStyle: "bold", halign: "center" },
        bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
        margin: { left: marginX, right: marginX },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      })
      
      if (includeStats) {
        const finalY = doc.lastAutoTable.finalY + 10
        const totalEtudiants = exportData.length
        const enRetard = exportData.filter(e => detecterRetards(e).estEnRetard).length
        const montantTotalDu = exportData.reduce((sum, e) => sum + detecterRetards(e).montantTotalRetard, 0)
        const montantStr = montantTotalDu.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ar"
        
        doc.setFillColor(240, 248, 255)
        doc.rect(marginX, finalY, pageWidth - (marginX * 2), 40, 'F')
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "bold")
        doc.text("STATISTIQUES", marginX + 5, finalY + 8)
        doc.setFontSize(9)
        doc.setFont("helvetica", "normal")
        doc.text("Total etudiants: " + totalEtudiants, marginX + 5, finalY + 20)
        doc.text("Etudiants en retard: " + enRetard, marginX + 5, finalY + 28)
        doc.text("Montant total du: " + montantStr, marginX + 5, finalY + 36)
      }
      
      const footerY = doc.internal.pageSize.height - 15
      doc.setDrawColor(200, 200, 200)
      doc.line(marginX, footerY - 5, pageWidth - marginX, footerY - 5)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text("CFP Don Bosco Mahajanga - Tel: 034 75 34 462", pageWidth / 2, footerY, { align: "center" })
      
      doc.save("paiements_" + new Date().toISOString().split('T')[0] + ".pdf")
      setExportSuccessModal(true)
    } catch (error) {
      console.error("Erreur export PDF:", error)
      setExportErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  const toggleFrais = (key, field, value) => setFraisForm(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))

  const filteredData = data.filter(e =>
    (e.nom?.toLowerCase().includes(search.toLowerCase()) || 
     e.numero_matricule?.toLowerCase().includes(search.toLowerCase()) ||
     e.prenom?.toLowerCase().includes(search.toLowerCase())) &&
    (!niveauFilter || e.niveau === niveauFilter) && 
    (!filiereFilter || e.nom_filiere === filiereFilter)
  )

  const total = data.length
  const payes = data.filter(e => e.inscription === "payé").length
  const impayes = data.filter(e => e.inscription === "impayé").length
  const partiels = data.filter(e => e.inscription === "partiel").length
  const tauxPayement = total > 0 ? ((payes + partiels) / total * 100).toFixed(0) : 0

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-slate-600 font-medium animate-pulse">Chargement des paiements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-6 lg:p-8">
        
        {notifications.map(notif => (
          <Notification key={notif.id} message={notif.message} type={notif.type} onClose={() => removeNotification(notif.id)} />
        ))}
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 animate-slide-down">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <CreditCard className="text-white" size={24}/>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Gestion des Paiements
                </h1>
              </div>
              {anneeActive && (
                <div className="flex items-center gap-2 ml-12">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <p className="text-sm text-slate-600">
                    Annee scolaire : <span className="font-semibold text-slate-800">{anneeActive.libelle}</span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowExportModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95">
                <Download size={18}/><span>Exporter PDF</span>
              </button>
              <button onClick={() => setShowRetardTable(true)} className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group relative overflow-hidden">
                <AlertTriangle size={18} className="group-hover:animate-bounce"/>
                <span>Retardataires</span>
                {retardStats.totalRetardataires > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {retardStats.totalRetardataires}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total etudiants", value: total, color: "blue", icon: <Users className="w-6 h-6 text-blue-600" />, pct: 100 },
            { label: "Inscription payee", value: payes, color: "green", icon: <CheckCircle className="w-6 h-6 text-green-600" />, pct: (payes/total||0)*100 },
            { label: "Inscription impayee", value: impayes, color: "red", icon: <AlertCircle className="w-6 h-6 text-red-600" />, pct: (impayes/total||0)*100 },
            { label: "Taux de paiement", value: tauxPayement + "%", color: "amber", icon: <TrendingUp className="w-6 h-6 text-amber-600" />, pct: tauxPayement },
          ].map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-up group`} style={{ animationDelay: i * 100 + "ms" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</p>
                </div>
                <div className={`p-3 bg-${s.color}-50 rounded-xl group-hover:rotate-12 transition-transform duration-300`}>{s.icon}</div>
              </div>
              <div className={`mt-3 h-1 bg-${s.color}-100 rounded-full overflow-hidden`}>
                <div className={`h-full bg-${s.color}-500 rounded-full`} style={{ width: s.pct + "%" }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* RETARDS BANNER */}
        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-4 mb-6 border border-red-200 animate-slide-up" style={{ animationDelay: "350ms" }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Etudiants en retard de paiement</h3>
                <p className="text-xs text-slate-500">Paiement du mois non effectue avant le 10</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{retardStats.totalRetardataires}</p>
                <p className="text-xs text-slate-500">Etudiants</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{retardStats.totalMoisRetard}</p>
                <p className="text-xs text-slate-500">Mois de retard</p>
              </div>
              <button onClick={() => setShowRetardTable(true)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all duration-300 flex items-center gap-2">
                <Eye size={16}/>Voir la liste
              </button>
            </div>
          </div>
        </div>

        {/* FILTRES */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" size={18}/>
                <input
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                  placeholder="Rechercher par nom, prenom ou matricule..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className="px-5 py-2.5 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 group">
                <Filter size={18} className="group-hover:rotate-12 transition-transform duration-300"/>
                <span>Filtres</span>
                <ChevronDown size={16} className={`transform transition-all duration-300 ${showFilters ? 'rotate-180' : ''}`}/>
              </button>
              <button
                onClick={() => { if (anneeActive) { setShowForm(true) } else { addNotification("Activez une annee scolaire d'abord", "warning") } }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300"/> Nouveau paiement
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="p-4 bg-gradient-to-r from-slate-50 to-white animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={filiereFilter} onChange={e => setFiliere(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all duration-300 hover:border-blue-300">
                  <option value="">Toutes les filieres</option>
                  {filieres.map(f => <option key={f}>{f}</option>)}
                </select>
                <select value={niveauFilter} onChange={e => setNiveau(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all duration-300 hover:border-blue-300">
                  <option value="">Tous les niveaux</option>
                  {niveaux.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              {(search || niveauFilter || filiereFilter) && (
                <div className="mt-4 flex justify-end">
                  <button onClick={() => { setSearch(""); setNiveau(""); setFiliere(""); addNotification("Filtres reinitialises", "info") }} className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all duration-300 hover:scale-105">
                    <RotateCcw size={14} className="inline mr-1"/> Reinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TABLEAU */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Matricule</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Nom & Prenom</th>
                  <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider">Niveau</th>
                  {colsFixe.map(c => (
                    <th key={c.key} className="px-2 py-3 text-center text-xs font-semibold">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] hidden sm:inline">{c.label}</span>
                      </div>
                    </th>
                  ))}
                  {colsMois.map(c => (
                    <th key={c.key} className="px-1 py-3 text-center text-xs font-semibold">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[9px] hidden sm:inline">{c.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr className="animate-fade-in">
                    <td colSpan={20} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard className="text-slate-300 animate-bounce" size={48}/>
                        <p className="text-slate-500 font-medium">Aucun paiement trouve</p>
                        <p className="text-slate-400 text-sm">Essayez de modifier vos filtres</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((e, idx) => {
                    const retardInfo = detecterRetards(e)
                    return (
                      <tr 
                        key={e.numero_matricule} 
                        className={`border-t border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} ${animatedRows[idx] ? 'animate-slide-right' : 'opacity-0'} ${retardInfo.estEnRetard ? 'border-l-4 border-l-red-500' : ''}`}
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors duration-300">{e.numero_matricule}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm text-slate-800">{e.nom} {e.prenom}</div>
                          <div className="text-xs text-slate-400">{e.nom_filiere || "—"}</div>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {e.niveau?.slice(0, 2) || "—"}
                          </span>
                        </td>
                        {colsFixe.map(c => {
                          const isEditing = editingPayment.active && editingPayment.matricule === e.numero_matricule && editingPayment.typeFrais === c.typeFrais && editingPayment.mois === c.mois
                          return (
                            <td key={c.key} className="px-2 py-3 text-center">
                              <ClickableBadge 
                                value={e[c.key]}
                                isEditing={isEditing}
                                editValue={editingPayment.editValue}
                                onEditChange={(val) => setEditingPayment({ ...editingPayment, editValue: val })}
                                onSave={handleSaveEdit}
                                onCancel={handleCancelEdit}
                                onClick={() => handleEditClick(e, c, e[c.key])}
                              />
                            </td>
                          )
                        })}
                        {colsMois.map(c => {
                          const isEditing = editingPayment.active && editingPayment.matricule === e.numero_matricule && editingPayment.typeFrais === c.typeFrais && editingPayment.mois === c.mois
                          const estEnRetardCeMois = retardInfo.retards.some(r => r.mois === c.label)
                          return (
                            <td key={c.key} className="px-1 py-3 text-center relative">
                              <ClickableBadge 
                                value={e[c.key]}
                                isEditing={isEditing}
                                editValue={editingPayment.editValue}
                                onEditChange={(val) => setEditingPayment({ ...editingPayment, editValue: val })}
                                onSave={handleSaveEdit}
                                onCancel={handleCancelEdit}
                                onClick={() => handleEditClick(e, c, e[c.key])}
                              />
                              {estEnRetardCeMois && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              )}
                            </td>
                          )
                        })}
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => handleGenerer(e.numero_matricule, e.id_niveau)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs flex items-center gap-1 transition-all duration-300 hover:scale-105 group" title="Generer les paiements">
                              <Zap size={14} className="group-hover:animate-pulse"/>
                              <span className="hidden sm:inline">Generer</span>
                            </button>
                            <button onClick={() => setRecuEtudiant(e)} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl text-xs flex items-center gap-1 transition-all duration-300 hover:scale-105 group" title="Voir le recu">
                              <FileText size={14} className="group-hover:animate-bounce"/>
                              <span className="hidden sm:inline">Recu</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL AJOUT */}
      {showForm && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${formAnimating ? 'animate-fade-out' : 'animate-fade-in'}`}>
          <div className={`bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl ${formAnimating ? 'animate-scale-out' : 'animate-scale-in'}`}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-4 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <CreditCard className="text-white" size={18}/>
                </div>
                <span className="font-bold text-base">Ajouter un paiement</span>
              </div>
              <button onClick={resetForm} className="p-1 hover:bg-blue-400 rounded-lg transition-all duration-300 hover:rotate-90"><X size={18}/></button>
            </div>
            
            <div className="flex-1 overflow-auto p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <input 
                  className="border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                  placeholder="Matricule" 
                  value={formBase.numero_matricule} 
                  onChange={e => setFormBase({...formBase, numero_matricule: e.target.value.toUpperCase()})}
                />
                <select className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300" value={formBase.id_niveau} onChange={e => setFormBase({...formBase, id_niveau: e.target.value})}>
                  <option value="">Niveau</option>
                  <option value="1">1ere annee</option>
                  <option value="2">2eme annee</option>
                  <option value="3">3eme annee</option>
                </select>
                <select className="border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300" value={formBase.filiere_nom} onChange={e => setFormBase({...formBase, filiere_nom: e.target.value})}>
                  <option value="">Filiere</option>
                  {filieres.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              
              <div>
                <div className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                  <Star size={14} className="text-amber-500"/> Frais fixes
                </div>
                <div className="space-y-2">
                  {tousLesFrais.filter(f => f.type === "fixe").map(f => (
                    <div key={f.key} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-300">
                      <label className="flex items-center gap-2 text-sm cursor-pointer flex-1">
                        <input type="checkbox" className="accent-blue-500 w-4 h-4 rounded" checked={fraisForm[f.key].checked} onChange={e => toggleFrais(f.key, "checked", e.target.checked)}/>
                        <span className="font-medium">{f.label}</span>
                        <span className="text-slate-400 ml-auto">{formatMontant(f.montant)}</span>
                      </label>
                      {fraisForm[f.key].checked && (
                        <div className="flex gap-2 ml-2 animate-fade-in">
                          <select className="border rounded-lg text-xs px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" value={fraisForm[f.key].statut} onChange={e => toggleFrais(f.key, "statut", e.target.value)}>
                            <option value="payé">Paye</option>
                            <option value="partiel">Partiel</option>
                          </select>
                          <input type="number" className="w-24 border rounded-lg text-right px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" value={fraisForm[f.key].montant} onChange={e => toggleFrais(f.key, "montant", e.target.value)}/>
                          <span className="text-xs text-slate-500">Ar</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500"/> Ecolage (mensuel)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {tousLesFrais.filter(f => f.type === "mois").map(f => (
                    <div key={f.key} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-300">
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="accent-blue-500 w-4 h-4 rounded" checked={fraisForm[f.key].checked} onChange={e => toggleFrais(f.key, "checked", e.target.checked)}/>
                        <span className="text-xs">{f.label}</span>
                      </label>
                      {fraisForm[f.key].checked && (
                        <div className="flex gap-1 animate-fade-in">
                          <select className="border rounded text-[10px] px-1 py-0.5 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" value={fraisForm[f.key].statut} onChange={e => toggleFrais(f.key, "statut", e.target.value)}>
                            <option value="payé">Paye</option>
                            <option value="partiel">Partiel</option>
                          </select>
                          <input type="number" className="w-16 border rounded text-right px-1 py-0.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none" value={fraisForm[f.key].montant} onChange={e => toggleFrais(f.key, "montant", e.target.value)}/>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Total selectionne:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatMontant(tousLesFrais.filter(f => fraisForm[f.key].checked).reduce((a, f) => a + Number(fraisForm[f.key].montant || 0), 0))}
                </span>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
              <button onClick={resetForm} className="px-5 py-2 border border-slate-300 rounded-xl text-sm hover:bg-slate-100 transition-all duration-300 hover:scale-105 active:scale-95">Annuler</button>
              <button onClick={handleAdd} disabled={loading} className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95">
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {recuEtudiant && <Recu etudiant={recuEtudiant} anneeActive={anneeActive} onClose={() => setRecuEtudiant(null)} />}
      {showRetardTable && <TableauRetardataires data={data} onRefresh={fetchData} onClose={() => setShowRetardTable(false)} />}
      <ExportPDFModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExportPDF} data={data} stats={{ total, payes, impayes, partiels, tauxPayement }} />

      {/* ✅ Modales succès/erreur pour l'export principal */}
      <SuccessModal isOpen={exportSuccessModal} onClose={() => setExportSuccessModal(false)} title="Export reussi !" message="Le fichier PDF des paiements a ete genere et telecharge avec succes." />
      <ErrorModal isOpen={exportErrorModal} onClose={() => setExportErrorModal(false)} message="Une erreur est survenue lors de l'export PDF. Veuillez reessayer." />

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes scaleOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
        @keyframes progress { 0% { width: 100%; } 100% { width: 0%; } }
        .animate-slide-down { animation: slideDown 0.4s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-slide-right { animation: slideRight 0.3s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-fade-out { animation: fadeOut 0.2s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        .animate-scale-out { animation: scaleOut 0.2s ease-out forwards; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%); }
      `}</style>
    </div>
  )
}