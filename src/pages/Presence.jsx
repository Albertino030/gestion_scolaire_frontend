import { useEffect, useState } from "react"
import { 
  Search, Plus, Trash2, X, Pencil, Filter, Download, Printer, 
  ChevronDown, Eye, Calendar, Users, Clock, AlertCircle, 
  CheckCircle, UserCheck, UserX, BarChart3, 
  ChevronRight, ChevronLeft, RefreshCw 
} from "lucide-react"
import { createPortal } from "react-dom"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

// =========================
// DONNÉES FIXES UI
// =========================
const niveaux = ["1ère année", "2ème année", "3ème année"]

const filieres = [
  "Ouvrage bois",
  "Ouvrage métallique",
  "Maçon polyvalent",
  "Hôtellerie",
  "Électrotechnique",
  "Bâtiment",
  "Mécanique automobile"
]

// =========================
// COMPONENT
// =========================
export default function Presence() {

  // =========================
  // DATA
  // =========================
  const [data, setData] = useState([])
  const [anneeActive, setAnneeActive] = useState(null)
  const [loading, setLoading] = useState(false)
  const [animatedRows, setAnimatedRows] = useState([])

  // =========================
  // FILTERS
  // =========================
  const [search, setSearch] = useState("")
  const [niveauFilter, setNiveauFilter] = useState("")
  const [filiereFilter, setFiliereFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // =========================
  // FORM
  // =========================
  const [showForm, setShowForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formAnimating, setFormAnimating] = useState(false)

  const [form, setForm] = useState({
    id: null,
    numero_matricule: "",
    motif: "",
    type: "absence"
  })

  // =========================
  // MODALES DE CONFIRMATION
  // =========================
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [presenceToDelete, setPresenceToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successAction, setSuccessAction] = useState("")
  
  // =========================
  // MODALES D'ALERTE
  // =========================
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertTitle, setAlertTitle] = useState("")
  const [alertType, setAlertType] = useState("error") // error, warning, info
  
  // =========================
  // MODALE EXPORT SUCCESS
  // =========================
  const [showExportSuccessModal, setShowExportSuccessModal] = useState(false)

  // =========================
  // GET ANNÉE ACTIVE
  // =========================
  const fetchAnneeActive = async () => {
    try {
      const res = await fetch(`${API_URL}/annees/`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      
      const data = await res.json()
      const active = data.find(a => a.actif === true || a.actif === 1)
      setAnneeActive(active || null)
      return active
    } catch (err) {
      console.error("Erreur lors de la récupération de l'année:", err)
      return null
    }
  }

  // =========================
  // GET PRESENCES FILTERED BY YEAR
  // =========================
  const fetchData = async (anneeId) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/presence/?id_annee=${anneeId}`)
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setData(Array.isArray(data) ? data : [])
      
      setTimeout(() => {
        setAnimatedRows(Array.isArray(data) ? data.map(() => true) : [])
      }, 100)
    } catch (err) {
      console.error("Erreur lors de la récupération des présences:", err)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    const init = async () => {
      const active = await fetchAnneeActive()
      if (active && active.id_annee) {
        await fetchData(active.id_annee)
      }
    }
    init()
  }, [])

  // =========================
  // AFFICHER MODALE D'ALERTE
  // =========================
  const showAlert = (title, message, type = "error") => {
    setAlertTitle(title)
    setAlertMessage(message)
    setAlertType(type)
    setShowAlertModal(true)
    
    setTimeout(() => {
      setShowAlertModal(false)
    }, 4000)
  }

  // =========================
  // AFFICHER MODALE DE SUCCÈS
  // =========================
  const showSuccess = (action, studentName = "") => {
    let msg = ""
    switch(action) {
      case "add":
        msg = `Présence ajoutée avec succès pour ${studentName}`
        break
      case "edit":
        msg = `Présence modifiée avec succès pour ${studentName}`
        break
      case "delete":
        msg = `Présence supprimée avec succès`
        break
      default:
        msg = "Opération réussie !"
    }
    setSuccessMessage(msg)
    setSuccessAction(action)
    setShowSuccessModal(true)
    
    setTimeout(() => {
      setShowSuccessModal(false)
    }, 3000)
  }

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormAnimating(true)
    setTimeout(() => {
      setForm({
        id: null,
        numero_matricule: "",
        motif: "",
        type: "absence"
      })
      setEditMode(false)
      setShowForm(false)
      setFormAnimating(false)
    }, 200)
  }

  // =========================
  // SUBMIT (ADD / UPDATE)
  // =========================
  const handleSubmit = async () => {
    if (!anneeActive) {
      showAlert("Année non trouvée", "⚠️ Aucune année active trouvée. Veuillez contacter l'administrateur.", "warning")
      return
    }

    if (!form.numero_matricule || form.numero_matricule.trim() === "") {
      showAlert("Champ obligatoire", "❌ Le matricule est obligatoire. Veuillez saisir un numéro de matricule valide.", "error")
      return
    }

    setLoading(true)
    
    try {
      if (!editMode) {
        const response = await fetch('${API_URL}/presence/', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numero_matricule: form.numero_matricule,
            motif: form.motif || "",
            type: form.type
          })
        })
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        
        const student = data.find(e => e.numero_matricule === form.numero_matricule)
        const studentName = student ? `${student.nom} ${student.prenom}` : form.numero_matricule
        showSuccess("add", studentName)
      }
      else {
        const response = await fetch(`${API_URL}/presence/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            motif: form.motif || "",
            type: form.type
          })
        })
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        
        const student = data.find(e => e.numero_matricule === form.numero_matricule)
        const studentName = student ? `${student.nom} ${student.prenom}` : form.numero_matricule
        showSuccess("edit", studentName)
      }
      
      resetForm()
      await fetchData(anneeActive.id_annee)
      
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err)
      showAlert("Erreur d'enregistrement", `❌ Erreur: ${err.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  // =========================
  // EDIT
  // =========================
  const handleEdit = (item) => {
    setForm({
      id: item.id,
      numero_matricule: item.numero_matricule,
      motif: item.motif || "",
      type: item.type
    })
    setEditMode(true)
    setShowForm(true)
  }

  // =========================
  // CONFIRMER SUPPRESSION
  // =========================
  const confirmDelete = (presence) => {
    setPresenceToDelete(presence)
    setShowConfirmDelete(true)
  }

  // =========================
  // DELETE
  // =========================
  const handleDelete = async () => {
    if (!presenceToDelete) return
    
    setDeleting(true)
    
    try {
      const response = await fetch(`${API_URL}/presence/${presenceToDelete.id}`, {
        method: "DELETE"
      })
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      showSuccess("delete")
      setShowConfirmDelete(false)
      setPresenceToDelete(null)
      await fetchData(anneeActive.id_annee)
      
    } catch (err) {
      console.error("Erreur lors de la suppression:", err)
      showAlert("Erreur de suppression", `❌ Erreur: ${err.message}`, "error")
    } finally {
      setDeleting(false)
    }
  }

  // =========================
  // EXPORT PDF - Version corrigée avec modale
  // =========================
  const exportToPDF = () => {
    if (!data || data.length === 0) {
      showAlert("Aucune donnée", "Aucune donnée à exporter. Veuillez vérifier votre liste de présences.", "warning")
      return
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      
      // Titre
      doc.setFontSize(16)
      doc.setTextColor(0, 51, 102)
      doc.setFont("helvetica", "bold")
      doc.text("GESTION DES PRÉSENCES", doc.internal.pageSize.width / 2, 15, { align: "center" })
      
      doc.setFontSize(11)
      doc.setTextColor(80, 80, 80)
      doc.text(`Année scolaire: ${anneeActive?.libelle || "Non définie"}`, doc.internal.pageSize.width / 2, 25, { align: "center" })
      
      // Date d'export
      const today = new Date()
      const dateStr = `${today.getDate().toString().padStart(2,'0')}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getFullYear()}`
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text(`Exporté le : ${dateStr}`, doc.internal.pageSize.width - 35, 10)
      
      // Statistiques
      const totalAbsences = filtered.filter(e => e.type === "absence").length
      const totalRetards = filtered.filter(e => e.type === "retard").length
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      doc.text(`Total: ${filtered.length} | Absences: ${totalAbsences} | Retards: ${totalRetards}`, 10, 32)
      
      // Préparer les données
      const tableData = filtered.map(e => [
        e.numero_matricule || "",
        e.nom || "",
        e.prenom || "",
        e.filiere || "-",
        e.niveau || "-",
        e.motif || "-",
        e.date_presence || "",
        e.type === "absence" ? "ABSENCE" : "RETARD"
      ])
      
      // Créer le tableau
      autoTable(doc, {
        startY: 38,
        head: [["Matricule", "Nom", "Prénom", "Filière", "Niveau", "Motif", "Date", "Type"]],
        body: tableData,
        theme: "striped",
        headStyles: { 
          fillColor: [0, 51, 102], 
          textColor: 255, 
          fontSize: 9, 
          fontStyle: "bold", 
          halign: "center" 
        },
        bodyStyles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 10, right: 10 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30 },
          4: { cellWidth: 20 },
          5: { cellWidth: 35 },
          6: { cellWidth: 25 },
          7: { cellWidth: 20 }
        }
      })
      
      // Numéros de page
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(120, 120, 120)
        doc.text(
          `Page ${i} sur ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        )
      }
      
      doc.save(`presences_${dateStr}.pdf`)
      setShowExportSuccessModal(true)
      setTimeout(() => {
        setShowExportSuccessModal(false)
      }, 3000)
      
    } catch (error) {
      console.error("Erreur export PDF:", error)
      showAlert("Erreur d'export", `❌ Erreur lors de l'export PDF: ${error.message}`, "error")
    }
  }

  // =========================
  // EXPORT CSV
  // =========================
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      showAlert("Aucune donnée", "Aucune donnée à exporter. Veuillez vérifier votre liste de présences.", "warning")
      return
    }
    
    const headers = ["Matricule", "Nom", "Prénom", "Filière", "Niveau", "Motif", "Date", "Type"]
    const csvData = filtered.map(e => [
      e.numero_matricule, 
      e.nom, 
      e.prenom, 
      e.filiere, 
      e.niveau, 
      e.motif, 
      e.date_presence, 
      e.type === "absence" ? "ABSENCE" : "RETARD"
    ])
    
    const csvContent = [headers, ...csvData].map(row => row.map(cell => `"${cell || ''}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `presences_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    showAlert("Export réussi", "✅ Le fichier CSV a été exporté avec succès!", "success")
  }

  // =========================
  // FILTERS
  // =========================
  const filtered = data.filter(e => {
    if (!e) return false
    
    const searchMatch = 
      (e.nom && e.nom.toLowerCase().includes(search.toLowerCase())) ||
      (e.prenom && e.prenom.toLowerCase().includes(search.toLowerCase())) ||
      (e.numero_matricule && e.numero_matricule.toLowerCase().includes(search.toLowerCase()))
    
    const niveauMatch = !niveauFilter || e.niveau === niveauFilter
    const filiereMatch = !filiereFilter || e.filiere === filiereFilter
    const typeMatch = !typeFilter || e.type === typeFilter
    
    return searchMatch && niveauMatch && filiereMatch && typeMatch
  })

  // =========================
  // STATISTIQUES
  // =========================
  const totalPresences = filtered.length
  const totalAbsences = filtered.filter(e => e.type === "absence").length
  const totalRetards = filtered.filter(e => e.type === "retard").length
  const tauxPresence = data.length > 0 ? ((data.length - totalAbsences) / data.length * 100).toFixed(1) : 0

  // =========================
  // MODALE D'ALERTE
  // =========================
  const AlertModal = () => {
    if (!showAlertModal) return null
    
    const getIcon = () => {
      switch(alertType) {
        case "success":
          return <CheckCircle size={24} className="text-green-500" />
        case "warning":
          return <AlertCircle size={24} className="text-amber-500" />
        case "error":
          return <X size={24} className="text-red-500" />
        default:
          return <AlertCircle size={24} className="text-blue-500" />
      }
    }
    
    const getBgGradient = () => {
      switch(alertType) {
        case "success":
          return "from-green-500 to-green-600"
        case "warning":
          return "from-amber-500 to-amber-600"
        case "error":
          return "from-red-500 to-red-600"
        default:
          return "from-blue-500 to-blue-600"
      }
    }
    
    return createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-2 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
          <div className={`bg-gradient-to-r ${getBgGradient()} text-white px-5 py-4 flex justify-between items-center rounded-t-2xl`}>
            <div className="flex items-center gap-2">
              {getIcon()}
              <h2 className="text-lg font-bold">{alertTitle}</h2>
            </div>
            <button onClick={() => setShowAlertModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>
          <div className="p-6 text-center">
            <p className="text-slate-700 font-medium">
              {alertMessage}
            </p>
            <button
              onClick={() => setShowAlertModal(false)}
              className={`mt-6 px-6 py-2.5 text-sm bg-gradient-to-r ${getBgGradient()} text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105`}
            >
              OK
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // =========================
  // MODALE EXPORT SUCCÈS
  // =========================
  const ExportSuccessModal = () => {
    if (!showExportSuccessModal) return null
    
    return createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-2 animate-fade-in">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-4 flex justify-between items-center rounded-t-2xl">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <h2 className="text-lg font-bold">Export réussi !</h2>
            </div>
            <button onClick={() => setShowExportSuccessModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-emerald-100">
                <CheckCircle size={40} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-slate-700 font-medium text-lg">
              ✅ PDF exporté avec succès !
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Le fichier a été téléchargé sur votre appareil.
            </p>
            <button
              onClick={() => setShowExportSuccessModal(false)}
              className="mt-6 px-6 py-2.5 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105"
            >
              OK
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // =========================
  // MODALE DE CONFIRMATION SUPPRESSION
  // =========================
  const ConfirmDeleteModal = () => {
    if (!showConfirmDelete) return null
    return createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-2">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-4 flex justify-between items-center rounded-t-2xl">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <h2 className="text-lg font-bold">Confirmation de suppression</h2>
            </div>
            <button onClick={() => setShowConfirmDelete(false)} className="p-1 hover:bg-red-400 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>
          <div className="p-5">
            <p className="text-slate-700 mb-3">Êtes-vous sûr de vouloir supprimer cette présence ?</p>
            <div className="bg-red-50 p-3 rounded-xl mb-4">
              <p className="text-sm font-semibold text-red-800">
                {presenceToDelete?.nom} {presenceToDelete?.prenom}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Matricule: {presenceToDelete?.numero_matricule} | 
                Type: {presenceToDelete?.type === "absence" ? "Absence" : "Retard"} |
                Date: {presenceToDelete?.date_presence}
              </p>
              {presenceToDelete?.motif && (
                <p className="text-xs text-red-600 mt-1">Motif: {presenceToDelete.motif}</p>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all hover:scale-105"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 hover:scale-105"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // =========================
  // MODALE DE SUCCÈS
  // =========================
  const SuccessModal = () => {
    if (!showSuccessModal) return null
    
    let iconColor = ""
    let bgGradient = ""
    switch(successAction) {
      case "add":
        iconColor = "text-green-500"
        bgGradient = "from-green-500 to-green-600"
        break
      case "edit":
        iconColor = "text-blue-500"
        bgGradient = "from-blue-500 to-blue-600"
        break
      case "delete":
        iconColor = "text-red-500"
        bgGradient = "from-red-500 to-red-600"
        break
      default:
        iconColor = "text-green-500"
        bgGradient = "from-green-500 to-green-600"
    }
    
    return createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-2">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
          <div className={`bg-gradient-to-r ${bgGradient} text-white px-5 py-4 flex justify-between items-center rounded-t-2xl`}>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              <h2 className="text-lg font-bold">Succès !</h2>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-3 rounded-full bg-opacity-20 ${successAction === "add" ? "bg-green-100" : successAction === "edit" ? "bg-blue-100" : "bg-red-100"}`}>
                <CheckCircle size={40} className={iconColor} />
              </div>
            </div>
            <p className="text-slate-700 font-medium text-lg">
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className={`mt-6 px-6 py-2.5 text-sm bg-gradient-to-r ${bgGradient} text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105`}
            >
              OK
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // =========================
  // AFFICHAGE DU CHARGEMENT
  // =========================
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
          <p className="mt-4 text-slate-600 font-medium animate-pulse">Chargement des données...</p>
        </div>
      </div>
    )
  }

  // =========================
  // UI MODERNISÉ AVEC ANIMATIONS
  // =========================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-6 lg:p-8">
        
        {/* HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 animate-slide-down">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl animate-pulse-slow">
                  <Calendar className="text-white" size={24}/>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent animate-fade-in">
                  Gestion des Présences
                </h1>
              </div>
              {anneeActive && (
                <div className="flex items-center gap-2 ml-12 animate-fade-in-up">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <p className="text-sm text-slate-600">
                    Année scolaire : <span className="font-semibold text-slate-800">{anneeActive.libelle}</span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={exportToPDF}
                className="px-4 py-2 text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-xl hover:bg-emerald-100 hover:border-emerald-400 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 group"
              >
                <Download size={18} className="group-hover:animate-bounce"/>
                <span className="hidden sm:inline">PDF</span>
              </button>
              
              <button
                onClick={exportToCSV}
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 group"
              >
                <Download size={18} className="group-hover:animate-bounce"/>
                <span className="hidden sm:inline">CSV</span>
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 group"
              >
                <Printer size={18} className="group-hover:animate-pulse"/>
                <span className="hidden sm:inline">Imprimer</span>
              </button>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-up group" style={{ animationDelay: "0ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total présences</p>
                <p className="text-3xl font-bold text-slate-800">{totalPresences}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-slide-right" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-up group" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Présents</p>
                <p className="text-3xl font-bold text-green-600">{totalPresences - totalAbsences}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-green-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-slide-right" style={{ width: `${((totalPresences - totalAbsences) / totalPresences || 0) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-up group" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Absences</p>
                <p className="text-3xl font-bold text-red-600">{totalAbsences}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-red-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full animate-slide-right" style={{ width: `${(totalAbsences / totalPresences || 0) * 100}%` }}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-up group" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Taux de présence</p>
                <p className="text-3xl font-bold text-amber-600">{tauxPresence}%</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-amber-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full animate-slide-right" style={{ width: `${tauxPresence}%` }}></div>
            </div>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors duration-300" size={18}/>
                <input
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                  placeholder="Rechercher par nom, prénom ou matricule..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="px-5 py-2.5 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 group"
              >
                <Filter size={18} className="group-hover:rotate-12 transition-transform duration-300"/>
                <span>Filtres</span>
                <ChevronDown size={16} className={`transform transition-all duration-300 ${showFilterPanel ? 'rotate-180' : ''}`}/>
              </button>
              
              <button
                onClick={() => {
                  setShowForm(true)
                  setEditMode(false)
                  setForm({
                    id: null,
                    numero_matricule: "",
                    motif: "",
                    type: "absence"
                  })
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300"/> Nouvelle présence
              </button>
            </div>
          </div>
          
          {showFilterPanel && (
            <div className="p-4 bg-gradient-to-r from-slate-50 to-white animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select 
                  value={filiereFilter}
                  onChange={e => setFiliereFilter(e.target.value)} 
                  className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all duration-300 hover:border-blue-300"
                >
                  <option value="">Toutes les filières</option>
                  {filieres.map(f => <option key={f}>{f}</option>)}
                </select>
                
                <select 
                  value={niveauFilter}
                  onChange={e => setNiveauFilter(e.target.value)} 
                  className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all duration-300 hover:border-blue-300"
                >
                  <option value="">Tous les niveaux</option>
                  {niveaux.map(n => <option key={n}>{n}</option>)}
                </select>
                
                <select 
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)} 
                  className="px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all duration-300 hover:border-blue-300"
                >
                  <option value="">Tous les types</option>
                  <option value="absence">❌ Absences</option>
                  <option value="retard">⏰ Retards</option>
                </select>
              </div>
              
              {(search || niveauFilter || filiereFilter || typeFilter) && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSearch("")
                      setNiveauFilter("")
                      setFiliereFilter("")
                      setTypeFilter("")
                    }}
                    className="text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all duration-300 hover:scale-105"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Matricule</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nom</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Prénom</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Filière</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Niveau</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Motif</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Type</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr className="animate-fade-in">
                    <td colSpan="9" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="text-slate-300 animate-bounce" size={48}/>
                        <p className="text-slate-500 font-medium">Aucune présence trouvée</p>
                        <p className="text-slate-400 text-sm">Essayez de modifier vos filtres</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((e, idx) => (
                    <tr 
                      key={e.id} 
                      className={`border-t border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} ${animatedRows[idx] ? 'animate-slide-right' : 'opacity-0'}`}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors duration-300">{e.numero_matricule}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{e.nom || "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{e.prenom || "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{e.filiere || "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{e.niveau || "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 max-w-xs truncate">{e.motif || "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{e.date_presence}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-300 hover:scale-105 ${
                          e.type === "absence"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${e.type === "absence" ? "bg-red-500" : "bg-amber-500"}`}></span>
                          {e.type === "absence" ? "Absence" : "Retard"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEdit(e)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 group"
                            title="Modifier"
                          >
                            <Pencil size={16} className="group-hover:rotate-12 transition-transform duration-300"/>
                          </button>
                          <button
                            onClick={() => confirmDelete(e)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 group"
                            title="Supprimer"
                          >
                            <Trash2 size={16} className="group-hover:animate-bounce"/>
                          </button>
                          <button
                            onClick={() => {
                              const details = `${e.nom} ${e.prenom}\nMatricule: ${e.numero_matricule}\nFilière: ${e.filiere}\nNiveau: ${e.niveau}\nType: ${e.type === "absence" ? "Absence" : "Retard"}\nMotif: ${e.motif || "Aucun"}\nDate: ${e.date_presence}`
                              alert(details)
                            }}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 group"
                            title="Détails"
                          >
                            <Eye size={16} className="group-hover:animate-pulse"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL FORM */}
        {showForm && (
          <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${formAnimating ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className={`bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl ${formAnimating ? 'animate-scale-out' : 'animate-scale-in'}`}>
              <div className="border-b border-slate-200 p-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl animate-pulse-slow">
                      {editMode ? <Pencil className="text-white" size={20}/> : <Plus className="text-white" size={20}/>}
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {editMode ? "Modifier la présence" : "Ajouter une présence"}
                    </h2>
                  </div>
                  <button 
                    onClick={resetForm}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-300 hover:rotate-90"
                  >
                    <X size={20}/>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="animate-slide-right" style={{ animationDelay: "50ms" }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Matricule de l'étudiant {!editMode && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 disabled:bg-slate-50 disabled:text-slate-500"
                    placeholder="Ex: ET001"
                    value={form.numero_matricule}
                    onChange={e => setForm({...form, numero_matricule: e.target.value.toUpperCase()})}
                    disabled={editMode}
                  />
                  {editMode && (
                    <p className="text-xs text-slate-500 mt-1.5 animate-pulse">Le matricule ne peut pas être modifié</p>
                  )}
                </div>

                <div className="animate-slide-right" style={{ animationDelay: "100ms" }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Motif
                  </label>
                  <input
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                    placeholder="Raison de l'absence/retard"
                    value={form.motif}
                    onChange={e => setForm({...form, motif: e.target.value})}
                  />
                </div>

                <div className="animate-slide-right" style={{ animationDelay: "150ms" }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300 bg-white"
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                  >
                    <option value="absence">❌ Absence</option>
                    <option value="retard">⏰ Retard</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-3 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Traitement...
                      </div>
                    ) : (editMode ? "Modifier" : "Enregistrer")}
                  </button>
                  <button
                    onClick={resetForm}
                    className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODALES */}
        <ConfirmDeleteModal />
        <SuccessModal />
        <AlertModal />
        <ExportSuccessModal />
        
      </div>

      {/* STYLES DES ANIMATIONS */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes scaleOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.9); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        
        .animate-slide-down { animation: slideDown 0.4s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-slide-right { animation: slideRight 0.3s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-fade-out { animation: fadeOut 0.2s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        .animate-scale-out { animation: scaleOut 0.2s ease-out forwards; }
        .animate-bounce { animation: bounce 0.5s ease-in-out; }
        .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
        .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%);
        }
      `}</style>
    </div>
  )
}