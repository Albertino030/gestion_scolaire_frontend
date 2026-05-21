import { useState, useEffect, useRef } from "react"
import { 
  Plus, Pencil, Trash2, Search, X, 
  Users, GraduationCap, ChevronDown, Filter, 
  RotateCcw, School, UserCheck, UserPlus, Eye,
  Award, FileText, CheckCircle, AlertCircle
} from "lucide-react"
import { createPortal } from "react-dom"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

export default function Etudiants() {
  const [data, setData] = useState([])
  const [anneeActive, setAnneeActive] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("success")
  const [search, setSearch] = useState("")
  const [filterNiveau, setFilterNiveau] = useState("")
  const [filterFiliere, setFilterFiliere] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [selectedEtudiant, setSelectedEtudiant] = useState(null)
  const [animatedRows, setAnimatedRows] = useState([])
  const [showPdfOptions, setShowPdfOptions] = useState(false)
  const [pdfMenuPosition, setPdfMenuPosition] = useState({ top: 0, left: 0 })
  const pdfButtonRef = useRef(null)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [formAnimating, setFormAnimating] = useState(false)
  const [detailsAnimating, setDetailsAnimating] = useState(false)
  const [showNiveauFiliereSelector, setShowNiveauFiliereSelector] = useState(false)
  const [selectedNiveaux, setSelectedNiveaux] = useState([])
  const [selectedFiliere, setSelectedFiliere] = useState("")
  const [showSingleStudentSearch, setShowSingleStudentSearch] = useState(false)
  const [searchMatricule, setSearchMatricule] = useState("")
  const [foundStudent, setFoundStudent] = useState(null)
  
  // États pour les modales de confirmation
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successAction, setSuccessAction] = useState("")
  const [deleting, setDeleting] = useState(false)

  const filieres = [
    "Ouvrage bois", "Ouvrage métallique", "Maçon polyvalent",
    "Hôtellerie", "Électrotechnique", "Bâtiment", "Mécanique automobile"
  ]
  const niveaux = ["1ère année", "2ème année", "3ème année"]

  const [form, setForm] = useState({
    numero_matricule: "", date_inscription: "", nom: "", prenom: "",
    genre: "", date_naissance: "", lieu_naissance: "",
    nom_complet_pere: "", nom_complet_mere: "", nom_complet_tuteur: "",
    adresse: "", telephone: "", filiere_choisie: "", niveau: "", projet_professionnel: ""
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pdfButtonRef.current &&
        !pdfButtonRef.current.contains(event.target) &&
        !event.target.closest(".pdf-menu")
      ) {
        setShowPdfOptions(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handlePdfButtonClick = () => {
    if (pdfButtonRef.current) {
      const rect = pdfButtonRef.current.getBoundingClientRect()
      setPdfMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: Math.min(rect.right - 280, window.innerWidth - 290)
      })
    }
    setShowPdfOptions(!showPdfOptions)
  }

  const fetchAnneeActive = async () => {
    try {
      const res = await fetch(`${API_URL}/annees/active`)
      const data = await res.json()
      setAnneeActive(data)
      return data
    } catch { return null }
  }

  const fetchData = async (annee = anneeActive) => {
    if (!annee) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/etudiants/?id_annee=${annee.id_annee}`)
      const json = await res.json()
      const dataArray = Array.isArray(json) ? json : []
      setData(dataArray)
      setTimeout(() => {
        setAnimatedRows(dataArray.map(() => true))
      }, 100)
    } catch (error) {
      console.error("Erreur fetchData:", error)
      setData([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAnneeActive().then(annee => fetchData(annee))
  }, [])

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 2000)
      return () => clearTimeout(t)
    }
  }, [message])

  const showToast = (msg, type = "success") => {
    setMessage(msg)
    setMessageType(type)
  }

  const showSuccessModalMessage = (action, studentName = "") => {
    let msg = ""
    switch(action) {
      case "add":
        msg = `Étudiant ${studentName} ajouté avec succès !`
        break
      case "edit":
        msg = `Étudiant ${studentName} modifié avec succès !`
        break
      case "delete":
        msg = `Étudiant ${studentName} supprimé avec succès !`
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

  const searchStudentByMatricule = () => {
    if (!searchMatricule.trim()) {
      showToast("Veuillez entrer un matricule", "error")
      return
    }
    const student = data.find(e => e.numero_matricule === searchMatricule.toUpperCase())
    if (student) {
      setFoundStudent(student)
    } else {
      setFoundStudent(null)
      showToast("Aucun étudiant trouvé avec ce matricule", "error")
    }
  }

  const generateStyledPDF = (doc, title, filteredData, subtitle = "") => {
    const pageW = doc.internal.pageSize.width

    doc.setFontSize(16)
    doc.setTextColor(0, 51, 102)
    doc.setFont("helvetica", "bold")
    doc.text("CENTRE DE FORMATION PROFESSIONNELLE DON BOSCO", pageW / 2, 15, { align: "center" })

    doc.setFontSize(12)
    doc.setTextColor(80, 80, 80)
    doc.setFont("helvetica", "bold")
    doc.text(title, pageW / 2, 24, { align: "center" })

    if (subtitle) {
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.setFont("helvetica", "normal")
      doc.text(subtitle, pageW / 2, 31, { align: "center" })
    }

    let startY = 38

    if (anneeActive) {
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`Année scolaire : ${anneeActive.libelle}`, 10, startY)
      startY += 6
    }

    const tableData = filteredData.map(e => [
      e.numero_matricule || "",
      (e.nom || "").toUpperCase(),
      (e.prenom || "").toUpperCase(),
      e.genre === "M" ? "M" : e.genre === "F" ? "F" : "-",
      e.date_naissance?.slice(0, 10) || "-",
      e.lieu_naissance || "-",
      e.nom_pere || "-",
      e.nom_mere || "-",
      e.nom_tuteur || "-",
      (e.adresse || "-").substring(0, 30),
      e.telephone || "-",
      e.nom_filiere || "-",
      e.niveau || "-",
      (e.projet_professionnel || "-").substring(0, 25)
    ])

    autoTable(doc, {
      startY: startY + 3,
      head: [["Mat.", "Nom", "Prénom", "G", "Date Naiss.", "Lieu", "Père", "Mère", "Tuteur", "Adresse", "Tél", "Filière", "Niv.", "Projet"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 2
      },
      bodyStyles: { fontSize: 7, cellPadding: 2 },
      margin: { left: 8, right: 8 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 22 },
        2: { cellWidth: 22 },
        3: { cellWidth: 7 },
        4: { cellWidth: 14 },
        5: { cellWidth: 18 },
        6: { cellWidth: 22 },
        7: { cellWidth: 22 },
        8: { cellWidth: 22 },
        9: { cellWidth: 25 },
        10: { cellWidth: 14 },
        11: { cellWidth: 22 },
        12: { cellWidth: 12 },
        13: { cellWidth: 22 }
      }
    })
  }

  const generateSingleStudentPDF = (etudiant) => {
    setPdfGenerating(true)
    setShowPdfOptions(false)
    setShowSingleStudentSearch(false)

    if (!etudiant) {
      showToast("Aucun étudiant sélectionné", "error")
      setPdfGenerating(false)
      return
    }

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageW = doc.internal.pageSize.width

      doc.setFontSize(16)
      doc.setTextColor(0, 51, 102)
      doc.setFont("helvetica", "bold")
      doc.text("CENTRE DE FORMATION PROFESSIONNELLE DON BOSCO", pageW / 2, 15, { align: "center" })

      doc.setFontSize(14)
      doc.setTextColor(80, 80, 80)
      doc.text("FICHE INDIVIDUELLE DE L'ÉTUDIANT", pageW / 2, 24, { align: "center" })

      if (anneeActive) {
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.text(`Année scolaire : ${anneeActive.libelle}`, 10, 32)
      }

      let y = 45

      doc.setFontSize(11)
      doc.setTextColor(0, 51, 102)
      doc.setFont("helvetica", "bold")
      doc.text("INFORMATIONS PERSONNELLES", 14, y)
      y += 6

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "normal")

      const infoLines = [
        { label: "Matricule", value: etudiant.numero_matricule || "-" },
        { label: "Nom complet", value: `${etudiant.nom || ""} ${etudiant.prenom || ""}` },
        { label: "Genre", value: etudiant.genre === "M" ? "Masculin" : etudiant.genre === "F" ? "Féminin" : "-" },
        { label: "Date de naissance", value: etudiant.date_naissance?.slice(0, 10) || "-" },
        { label: "Lieu de naissance", value: etudiant.lieu_naissance || "-" },
        { label: "Téléphone", value: etudiant.telephone || "-" },
        { label: "Adresse", value: etudiant.adresse || "-" }
      ]

      infoLines.forEach(line => {
        doc.setFont("helvetica", "bold")
        doc.text(`${line.label} :`, 14, y)
        doc.setFont("helvetica", "normal")
        doc.text(line.value, 55, y)
        y += 6
      })

      y += 4

      doc.setFontSize(11)
      doc.setTextColor(0, 51, 102)
      doc.setFont("helvetica", "bold")
      doc.text("INFORMATIONS ACADÉMIQUES", 14, y)
      y += 6

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "normal")

      const academicInfo = [
        { label: "Filière", value: etudiant.nom_filiere || "-" },
        { label: "Niveau", value: etudiant.niveau || "-" },
        { label: "Date d'inscription", value: etudiant.date_inscription?.slice(0, 10) || "-" }
      ]

      academicInfo.forEach(info => {
        doc.setFont("helvetica", "bold")
        doc.text(`${info.label} :`, 14, y)
        doc.setFont("helvetica", "normal")
        doc.text(info.value, 55, y)
        y += 6
      })

      y += 4

      if (etudiant.projet_professionnel) {
        doc.setFontSize(11)
        doc.setTextColor(0, 51, 102)
        doc.setFont("helvetica", "bold")
        doc.text("PROJET PROFESSIONNEL", 14, y)
        y += 6
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.setFont("helvetica", "normal")
        
        const projet = etudiant.projet_professionnel
        const maxWidth = 170
        const lines = doc.splitTextToSize(projet, maxWidth)
        doc.text(lines, 14, y)
        y += lines.length * 5
      }

      y += 4
      doc.setFontSize(11)
      doc.setTextColor(0, 51, 102)
      doc.setFont("helvetica", "bold")
      doc.text("INFORMATIONS FAMILIALES", 14, y)
      y += 6

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "normal")

      const familyInfo = [
        { label: "Nom du père", value: etudiant.nom_pere || "-" },
        { label: "Nom de la mère", value: etudiant.nom_mere || "-" },
        { label: "Nom du tuteur", value: etudiant.nom_tuteur || "-" }
      ]

      familyInfo.forEach(info => {
        doc.setFont("helvetica", "bold")
        doc.text(`${info.label} :`, 14, y)
        doc.setFont("helvetica", "normal")
        doc.text(info.value, 55, y)
        y += 6
      })

      const pageH = doc.internal.pageSize.height
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Document généré le ${new Date().toLocaleDateString("fr-FR")}`, pageW / 2, pageH - 10, { align: "center" })

      doc.save(`etudiant_${etudiant.numero_matricule}_${etudiant.nom}_${etudiant.prenom}.pdf`)
      showToast("✅ Fiche individuelle générée avec succès !")
      
      setSearchMatricule("")
      setFoundStudent(null)
    } catch (error) {
      console.error("Erreur PDF:", error)
      showToast(`❌ Erreur : ${error.message}`, "error")
    } finally {
      setPdfGenerating(false)
    }
  }

  const generatePDFByNiveauAndFiliere = () => {
    setPdfGenerating(true)
    setShowPdfOptions(false)
    setShowNiveauFiliereSelector(false)

    if (!data || data.length === 0) {
      showToast("Aucune donnée à exporter", "error")
      setPdfGenerating(false)
      return
    }

    if (selectedNiveaux.length === 0) {
      showToast("Veuillez sélectionner au moins un niveau", "error")
      setPdfGenerating(false)
      return
    }

    if (!selectedFiliere) {
      showToast("Veuillez sélectionner une filière", "error")
      setPdfGenerating(false)
      return
    }

    try {
      const filteredData = data.filter(e => 
        selectedNiveaux.includes(e.niveau) && e.nom_filiere === selectedFiliere
      )
      
      if (filteredData.length === 0) {
        showToast(`Aucun étudiant trouvé pour ${selectedFiliere} - ${selectedNiveaux.join(", ")}`, "error")
        setPdfGenerating(false)
        return
      }

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      let niveauLabel = selectedNiveaux.join(" / ")
      
      generateStyledPDF(
        doc, 
        "LISTE DES ÉTUDIANTS", 
        filteredData, 
        `Filière : ${selectedFiliere} | Niveau(x) : ${niveauLabel}`
      )
      
      doc.save(`etudiants_${selectedFiliere}_${selectedNiveaux.join("_")}_${Date.now()}.pdf`)
      showToast("✅ PDF généré avec succès !")
      
      setSelectedNiveaux([])
      setSelectedFiliere("")
    } catch (error) {
      console.error("Erreur PDF:", error)
      showToast(`❌ Erreur : ${error.message}`, "error")
    } finally {
      setPdfGenerating(false)
    }
  }

  const generatePDF = (type, value = null) => {
    setPdfGenerating(true)
    setShowPdfOptions(false)

    if (!data || data.length === 0) {
      showToast("Aucune donnée à exporter", "error")
      setPdfGenerating(false)
      return
    }

    try {
      let filteredData = []
      let title = ""
      let subtitle = ""

      switch (type) {
        case "all":
          filteredData = [...data]
          title = "LISTE COMPLÈTE DES ÉTUDIANTS"
          break
        case "single_filiere":
          filteredData = data.filter(e => e.nom_filiere === value)
          title = "LISTE DES ÉTUDIANTS"
          subtitle = `Filière : ${value.toUpperCase()}`
          break
        case "single_niveau":
          filteredData = data.filter(e => e.niveau === value)
          title = "LISTE DES ÉTUDIANTS"
          subtitle = `Niveau : ${value.toUpperCase()}`
          break
        default:
          filteredData = [...data]
          title = "LISTE DES ÉTUDIANTS"
      }

      if (filteredData.length === 0) {
        showToast("Aucune donnée pour cette sélection", "error")
        setPdfGenerating(false)
        return
      }

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      generateStyledPDF(doc, title, filteredData, subtitle)
      
      doc.save(`liste_etudiants_${Date.now()}.pdf`)
      showToast("✅ PDF généré avec succès !")
    } catch (error) {
      console.error("Erreur PDF:", error)
      showToast(`❌ Erreur : ${error.message}`, "error")
    } finally {
      setPdfGenerating(false)
    }
  }

  const handleEdit = async (etudiant) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/etudiants/${etudiant.numero_matricule}`)
      const data = await res.json()
      if (res.ok && !data.error) {
        setForm({
          numero_matricule: data.numero_matricule || "",
          date_inscription: data.date_inscription ? data.date_inscription.slice(0, 10) : "",
          nom: data.nom || "",
          prenom: data.prenom || "",
          genre: data.genre || "",
          date_naissance: data.date_naissance ? data.date_naissance.slice(0, 10) : "",
          lieu_naissance: data.lieu_naissance || "",
          nom_complet_pere: data.nom_pere || "",
          nom_complet_mere: data.nom_mere || "",
          nom_complet_tuteur: data.nom_tuteur || "",
          adresse: data.adresse || "",
          telephone: data.telephone || "",
          filiere_choisie: data.nom_filiere || "",
          niveau: data.niveau || "",
          projet_professionnel: data.projet_professionnel || ""
        })
        setSelectedId(data.numero_matricule)
        setEditMode(true)
        setShowForm(true)
      } else {
        showToast("❌ Impossible de charger", "error")
      }
    } catch (error) {
      console.error("Erreur:", error)
      showToast("❌ Erreur de connexion", "error")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!anneeActive) { showToast("Activez une année scolaire", "error"); return }
    if (!form.numero_matricule || !form.nom || !form.prenom) {
      showToast("Matricule, Nom et Prénom sont obligatoires", "error"); return
    }
    if (!form.filiere_choisie) { showToast("Sélectionnez une filière", "error"); return }
    if (!form.niveau) { showToast("Sélectionnez un niveau", "error"); return }

    const payload = {
      numero_matricule: form.numero_matricule,
      date_inscription: form.date_inscription || null,
      nom: form.nom, prenom: form.prenom, genre: form.genre,
      date_naissance: form.date_naissance || null,
      lieu_naissance: form.lieu_naissance,
      nom_pere: form.nom_complet_pere, nom_mere: form.nom_complet_mere,
      nom_tuteur: form.nom_complet_tuteur, adresse: form.adresse,
      telephone: form.telephone, filiere_choisie: form.filiere_choisie,
      niveau: form.niveau, id_annee: anneeActive.id_annee,
      projet_professionnel: form.projet_professionnel
    }

    // ✅ CORRECTION : Supprimer les guillemets autour de ${API_URL}
    const url = editMode
      ? `${API_URL}/etudiants/${selectedId}`
      : `${API_URL}/etudiants/`

    setLoading(true)
    try {
      const res = await fetch(url, {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const result = await res.json()
      if (res.ok && !result.error) {
        await fetchData(anneeActive)
        const studentName = `${form.nom} ${form.prenom}`
        if (editMode) {
          showSuccessModalMessage("edit", studentName)
        } else {
          showSuccessModalMessage("add", studentName)
        }
        resetFormAndClose()
      } else {
        showToast(`❌ ${result.error || "Erreur"}`, "error")
      }
    } catch (error) {
      showToast("❌ Erreur de connexion", "error")
    }
    setLoading(false)
  }

  const resetFormAndClose = () => {
    setFormAnimating(true)
    setTimeout(() => {
      setForm({
        numero_matricule: "", date_inscription: "", nom: "", prenom: "",
        genre: "", date_naissance: "", lieu_naissance: "",
        nom_complet_pere: "", nom_complet_mere: "", nom_complet_tuteur: "",
        adresse: "", telephone: "", filiere_choisie: "", niveau: "",
        projet_professionnel: ""
      })
      setEditMode(false)
      setSelectedId(null)
      setShowForm(false)
      setFormAnimating(false)
    }, 150)
  }

  const resetForm = () => {
    setForm({
      numero_matricule: "", date_inscription: "", nom: "", prenom: "",
      genre: "", date_naissance: "", lieu_naissance: "",
      nom_complet_pere: "", nom_complet_mere: "", nom_complet_tuteur: "",
      adresse: "", telephone: "", filiere_choisie: "", niveau: "",
      projet_professionnel: ""
    })
  }

  const confirmDelete = (etudiant) => {
    setStudentToDelete(etudiant)
    setShowConfirmDelete(true)
  }

  const handleDelete = async () => {
    if (!studentToDelete) return
    
    setDeleting(true)
    try {
      const res = await fetch(`${API_URL}/etudiants/${studentToDelete.numero_matricule}`, { method: "DELETE" })
      const result = await res.json()
      if (res.ok && !result.error) {
        await fetchData(anneeActive)
        const studentName = `${studentToDelete.nom} ${studentToDelete.prenom}`
        showSuccessModalMessage("delete", studentName)
        setShowConfirmDelete(false)
        setStudentToDelete(null)
      } else {
        showToast(`❌ ${result.error || "Erreur"}`, "error")
      }
    } catch {
      showToast("❌ Erreur de connexion", "error")
    } finally {
      setDeleting(false)
    }
  }

  const handleCloseDetails = () => {
    setDetailsAnimating(true)
    setTimeout(() => {
      setShowDetails(false)
      setSelectedEtudiant(null)
      setDetailsAnimating(false)
    }, 150)
  }

  const normalize = (str) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const filteredData = data.filter(e =>
    (normalize(e.nom).includes(normalize(search)) ||
      normalize(e.prenom).includes(normalize(search)) ||
      normalize(e.numero_matricule).includes(normalize(search))) &&
    (filterNiveau === "" || normalize(e.niveau) === normalize(filterNiveau)) &&
    (filterFiliere === "" || normalize(e.nom_filiere) === normalize(filterFiliere))
  )

  const stats = {
    total: data.length,
    masculin: data.filter(e => e.genre === "M").length,
    feminin: data.filter(e => e.genre === "F").length
  }

  const fieldLabels = {
    numero_matricule: "Matricule *", date_inscription: "Date inscription",
    nom: "Nom *", prenom: "Prénom *", genre: "Genre",
    date_naissance: "Date naissance", lieu_naissance: "Lieu naissance",
    nom_complet_pere: "Père", nom_complet_mere: "Mère",
    nom_complet_tuteur: "Tuteur", adresse: "Adresse",
    telephone: "Téléphone", filiere_choisie: "Filière *",
    niveau: "Niveau *", projet_professionnel: "Projet pro."
  }

  const ConfirmDeleteModal = () => {
    if (!showConfirmDelete) return null
    return createPortal(
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-2">
        <div className="bg-white rounded-xl w-full max-w-sm shadow-xl animate-scale-in">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 flex justify-between items-center rounded-t-xl">
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} />
              <h2 className="text-sm font-bold">Confirmation de suppression</h2>
            </div>
            <button onClick={() => setShowConfirmDelete(false)} className="p-0.5 hover:bg-red-400 rounded">
              <X size={14} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-700 mb-2">
              Êtes-vous sûr de vouloir supprimer l'étudiant ?
            </p>
            <div className="bg-red-50 p-2 rounded-lg mb-4">
              <p className="text-xs font-semibold text-red-800">
                {studentToDelete?.nom} {studentToDelete?.prenom}
              </p>
              <p className="text-[10px] text-red-600">Matricule: {studentToDelete?.numero_matricule}</p>
            </div>
            <p className="text-[10px] text-gray-500 mb-4">
              Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
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
        <div className="bg-white rounded-xl w-full max-w-sm shadow-xl animate-scale-in">
          <div className={`bg-gradient-to-r ${bgGradient} text-white px-3 py-2 flex justify-between items-center rounded-t-xl`}>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} />
              <h2 className="text-sm font-bold">Succès !</h2>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="p-0.5 hover:bg-white/20 rounded">
              <X size={14} />
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className={`p-2 rounded-full bg-opacity-20 ${successAction === "add" ? "bg-green-100" : successAction === "edit" ? "bg-blue-100" : "bg-red-100"}`}>
                <CheckCircle size={32} className={iconColor} />
              </div>
            </div>
            <p className="text-sm text-gray-700 font-medium">
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className={`mt-4 px-4 py-1.5 text-xs bg-gradient-to-r ${bgGradient} text-white rounded-lg hover:opacity-90 transition-all`}
            >
              OK
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  const NiveauFiliereSelectorPortal = () => {
    if (!showNiveauFiliereSelector) return null
    return createPortal(
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-2"
        onClick={() => setShowNiveauFiliereSelector(false)}
      >
        <div
          className="bg-white rounded-xl w-full max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 flex justify-between items-center rounded-t-xl">
            <div className="flex items-center gap-1.5">
              <GraduationCap size={14} />
              <h2 className="text-sm font-bold">Sélectionner Filière et Niveaux</h2>
            </div>
            <button onClick={() => setShowNiveauFiliereSelector(false)} className="p-0.5 hover:bg-purple-400 rounded">
              <X size={14} />
            </button>
          </div>
          <div className="p-3">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Filière :</label>
              <select
                value={selectedFiliere}
                onChange={(e) => setSelectedFiliere(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 outline-none"
              >
                <option value="">Sélectionner une filière</option>
                {filieres.map(filiere => {
                  const count = data.filter(e => e.nom_filiere === filiere).length
                  return (
                    <option key={filiere} value={filiere}>
                      {filiere} ({count} étudiants)
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Niveaux :</label>
              {niveaux.map(niveau => {
                const count = selectedFiliere 
                  ? data.filter(e => e.nom_filiere === selectedFiliere && e.niveau === niveau).length
                  : data.filter(e => e.niveau === niveau).length
                return (
                  <label key={niveau} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input                      type="checkbox"
                      checked={selectedNiveaux.includes(niveau)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNiveaux([...selectedNiveaux, niveau])
                        } else {
                          setSelectedNiveaux(selectedNiveaux.filter(n => n !== niveau))
                        }
                      }}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-xs">{niveau}</span>
                    <span className="text-[9px] text-gray-500">({count} étudiants)</span>
                  </label>
                )
              })}
            </div>

            {selectedFiliere && selectedNiveaux.length > 0 && (
              <div className="mt-3 p-2 bg-purple-50 rounded-lg">
                <p className="text-[10px] text-purple-700">
                  Aperçu : {selectedFiliere} - {selectedNiveaux.join(" / ")}
                  <br />
                  Total : {
                    data.filter(e => 
                      selectedNiveaux.includes(e.niveau) && e.nom_filiere === selectedFiliere
                    ).length
                  } étudiants
                </p>
              </div>
            )}
          </div>
          <div className="border-t p-2 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
            <button
              onClick={() => {
                setSelectedNiveaux([])
                setSelectedFiliere("")
                setShowNiveauFiliereSelector(false)
              }}
              className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              onClick={generatePDFByNiveauAndFiliere}
              disabled={selectedNiveaux.length === 0 || !selectedFiliere}
              className="px-3 py-1 text-xs bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              Générer PDF
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  const SingleStudentSearchPortal = () => {
    if (!showSingleStudentSearch) return null
    return createPortal(
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-2"
        onClick={() => {
          setShowSingleStudentSearch(false)
          setSearchMatricule("")
          setFoundStudent(null)
        }}
      >
        <div
          className="bg-white rounded-xl w-full max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2 flex justify-between items-center rounded-t-xl">
            <div className="flex items-center gap-1.5">
              <FileText size={14} />
              <h2 className="text-sm font-bold">PDF - Fiche individuelle</h2>
            </div>
            <button 
              onClick={() => {
                setShowSingleStudentSearch(false)
                setSearchMatricule("")
                setFoundStudent(null)
              }} 
              className="p-0.5 hover:bg-emerald-400 rounded"
            >
              <X size={14} />
            </button>
          </div>
          <div className="p-3">
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Entrer le matricule de l'étudiant :
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchMatricule}
                  onChange={(e) => setSearchMatricule(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && searchStudentByMatricule()}
                  placeholder="Ex: 2024-001"
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={searchStudentByMatricule}
                  className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  <Search size={12} />
                </button>
              </div>
            </div>

            {foundStudent && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-[11px] font-semibold text-emerald-800 mb-2">Étudiant trouvé :</p>
                <p className="text-[10px]"><span className="font-semibold">Matricule:</span> {foundStudent.numero_matricule}</p>
                <p className="text-[10px]"><span className="font-semibold">Nom:</span> {foundStudent.nom} {foundStudent.prenom}</p>
                <p className="text-[10px]"><span className="font-semibold">Filière:</span> {foundStudent.nom_filiere}</p>
                <p className="text-[10px]"><span className="font-semibold">Niveau:</span> {foundStudent.niveau}</p>
                <button
                  onClick={() => generateSingleStudentPDF(foundStudent)}
                  className="w-full mt-3 px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  <FileText size={10} className="inline mr-1" /> Générer PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>,
      document.body
    )
  }

  const PdfMenuPortal = () => {
    if (!showPdfOptions) return null
    return createPortal(
      <div
        className="pdf-menu fixed bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        style={{
          top: pdfMenuPosition.top,
          left: pdfMenuPosition.left,
          width: "280px",
          zIndex: 99999
        }}
      >
        <div className="p-1 max-h-80 overflow-y-auto">
          <div className="px-2 py-1.5 bg-emerald-50 rounded mb-1">
            <p className="text-[10px] font-semibold text-emerald-700">📄 Export PDF</p>
          </div>
          
          <button onClick={() => generatePDF("all")} disabled={pdfGenerating}
            className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-gray-50 rounded flex items-center gap-1.5 transition-colors">
            <FileText size={11} /> Tous les étudiants ({data.length})
          </button>
          
          <div className="border-t my-1"></div>
          
          <div className="text-[9px] font-semibold text-gray-500 px-2 py-0.5">Par filière</div>
          {filieres.map(filiere => {
            const count = data.filter(e => e.nom_filiere === filiere).length
            return (
              <button key={filiere} onClick={() => generatePDF("single_filiere", filiere)}
                className="w-full text-left px-2 py-1 text-[10px] hover:bg-gray-50 rounded pl-5 flex items-center gap-1 transition-colors">
                <ChevronDown size={8} /> {filiere} ({count})
              </button>
            )
          })}
          
          <div className="border-t my-1"></div>
          
          <div className="text-[9px] font-semibold text-gray-500 px-2 py-0.5">Par niveau</div>
          {niveaux.map(niveau => {
            const count = data.filter(e => e.niveau === niveau).length
            return (
              <button key={niveau} onClick={() => generatePDF("single_niveau", niveau)}
                className="w-full text-left px-2 py-1 text-[10px] hover:bg-gray-50 rounded pl-5 flex items-center gap-1 transition-colors">
                <ChevronDown size={8} /> {niveau} ({count})
              </button>
            )
          })}
          
          <div className="border-t my-1"></div>
          
          <button 
            onClick={() => setShowNiveauFiliereSelector(true)}
            className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-purple-50 rounded flex items-center gap-1.5 transition-colors text-purple-600"
          >
            <GraduationCap size={11} /> Par niveau ET filière
          </button>
          
          <div className="border-t my-1"></div>
          
          <button 
            onClick={() => setShowSingleStudentSearch(true)}
            className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-emerald-50 rounded flex items-center gap-1.5 transition-colors text-emerald-600"
          >
            <Award size={11} /> Fiche individuelle (par matricule)
          </button>
        </div>
      </div>,
      document.body
    )
  }

  if (loading && data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-xs text-gray-500 animate-pulse">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-2 sm:p-3 lg:p-4">

        {message && (
          <div className={`fixed top-2 right-2 z-50 animate-slide-down px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium shadow-lg ${messageType === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-2.5 mb-3 animate-slide-down">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <GraduationCap className="text-white" size={16} />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Gestion des Étudiants
                </h1>
                {anneeActive && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                    <p className="text-[9px] sm:text-[10px] text-gray-600">
                      Année : <span className="font-semibold text-gray-800">{anneeActive.libelle}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button ref={pdfButtonRef} onClick={handlePdfButtonClick} disabled={pdfGenerating}
                  className="px-2 py-1.5 bg-emerald-500 text-white rounded-lg text-xs flex items-center gap-1 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-60">
                  <FileText size={12} />
                  <span className="hidden xs:inline sm:inline">PDF</span>
                  <ChevronDown size={10} className={`transform transition-transform duration-200 ${showPdfOptions ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <button onClick={() => {
                if (!anneeActive) { showToast("Activez une année scolaire", "error"); return }
                resetForm();
                setEditMode(false);
                setSelectedId(null);
                setShowForm(true);
              }} 
              className="px-2 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs flex items-center gap-1 hover:scale-105 active:scale-95 transition-all">
                <Plus size={12} /> <span className="hidden xs:inline sm:inline">Ajouter</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 mb-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 hover:shadow-md transition-all hover:scale-105 animate-slide-up" style={{ animationDelay: "0ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase">Total</p>
                <p className="text-base sm:text-lg font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-1 h-0.5 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-slide-right" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 hover:shadow-md transition-all hover:scale-105 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase">Garçons</p>
                <p className="text-base sm:text-lg font-bold text-blue-600">{stats.masculin}</p>
              </div>
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-1 h-0.5 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full animate-slide-right" style={{ width: `${stats.total ? (stats.masculin / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 hover:shadow-md transition-all hover:scale-105 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] sm:text-[9px] text-gray-500 uppercase">Filles</p>
                <p className="text-base sm:text-lg font-bold text-pink-600">{stats.feminin}</p>
              </div>
              <div className="p-1.5 bg-pink-50 rounded-lg">
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600" />
              </div>
            </div>
            <div className="mt-1 h-0.5 bg-pink-100 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full animate-slide-right" style={{ width: `${stats.total ? (stats.feminin / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3 overflow-hidden animate-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="p-2 border-b border-gray-200">
            <div className="flex flex-col xs:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                <input
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Rechercher par nom, prénom ou matricule..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 justify-center xs:justify-start"
              >
                <Filter size={12} />
                <span>Filtres</span>
                <ChevronDown size={12} className={`transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="p-2 bg-gray-50 animate-slide-down">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                <select
                  value={filterFiliere}
                  onChange={e => setFilterFiliere(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Toutes les filières</option>
                  {filieres.map(f => <option key={f}>{f}</option>)}
                </select>
                <select
                  value={filterNiveau}
                  onChange={e => setFilterNiveau(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Tous les niveaux</option>
                  {niveaux.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              {(search || filterNiveau || filterFiliere) && (
                <div className="mt-2 flex justify-end">
                  <button onClick={() => { setSearch(""); setFilterNiveau(""); setFilterFiliere("") }}
                    className="text-[10px] text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition-all flex items-center gap-1">
                    <RotateCcw size={10} /> Réinitialiser
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <div className="overflow-x-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>
            <div className="min-w-[1000px] lg:min-w-0">
              <table className="w-full text-[10px] sm:text-[11px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                    <th className="px-1.5 py-1.5 text-left font-semibold">Matricule</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold">Nom</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold">Prénom</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold">Genre</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold hidden sm:table-cell">Dat.Naiss.</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold hidden md:table-cell">Lieu naiss.</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold hidden lg:table-cell">Père</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold hidden lg:table-cell">Mère</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold hidden xl:table-cell">Tuteur</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold hidden xl:table-cell">Adresse</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold">Tél.</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold">Filière</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold">Niveau</th>
                    <th className="px-1.5 py-1.5 text-left font-semibold hidden md:table-cell">Projet</th>
                    <th className="px-1.5 py-1.5 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr className="animate-fade-in">
                      <td colSpan={15} className="text-center py-6 sm:py-8">
                        <School className="text-gray-300 mx-auto mb-1" size={28} />
                        <p className="text-xs text-gray-500">Aucun étudiant trouvé</p>
                        <p className="text-[10px] text-gray-400">Modifiez vos filtres</p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((e, idx) => (
                      <tr
                        key={e.numero_matricule}
                        className={`border-t border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} ${animatedRows[idx] ? 'animate-slide-right' : 'opacity-0'}`}
                        style={{ animationDelay: `${idx * 20}ms` }}
                      >
                        <td className="px-1.5 py-1 font-mono font-medium text-[9px] sm:text-[10px]">{e.numero_matricule}</td>
                        <td className="px-1.5 py-1 font-medium">{e.nom}</td>
                        <td className="px-1.5 py-1">{e.prenom}</td>
                        <td className="px-1.5 py-1">
                          <span className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold ${e.genre === "M" ? "bg-blue-50 text-blue-700" : "bg-pink-50 text-pink-700"}`}>
                            <span className={`w-1 h-1 rounded-full ${e.genre === "M" ? "bg-blue-500" : "bg-pink-500"}`}></span>
                            {e.genre === "M" ? "M" : "F"}
                          </span>
                        </td>
                        <td className="px-1.5 py-1 text-[9px] sm:text-[10px] hidden sm:table-cell">{e.date_naissance?.slice(0, 10) || "-"}</td>
                        <td className="px-1.5 py-1 text-[9px] sm:text-[10px] max-w-[80px] truncate hidden md:table-cell">{e.lieu_naissance || "-"}</td>
                        <td className="px-1.5 py-1 text-[9px] sm:text-[10px] max-w-[80px] truncate hidden lg:table-cell">{e.nom_pere || "-"}</td>
                        <td className="px-1.5 py-1 text-[9px] sm:text-[10px] max-w-[80px] truncate hidden lg:table-cell">{e.nom_mere || "-"}</td>
                        <td className="px-1.5 py-1 text-[9px] sm:text-[10px] max-w-[80px] truncate hidden xl:table-cell">{e.nom_tuteur || "-"}</td>
                        <td className="px-1.5 py-1 text-[9px] sm:text-[10px] max-w-[100px] truncate hidden xl:table-cell">{e.adresse || "-"}</td>
                        <td className="px-1.5 py-1 text-[9px] sm:text-[10px]">{e.telephone || "-"}</td>
                        <td className="px-1.5 py-1">
                          <span className="inline-block px-1 py-0.5 bg-blue-50 text-blue-700 rounded text-[8px] sm:text-[9px] font-semibold max-w-[80px] truncate">{e.nom_filiere || "-"}</span>
                        </td>
                        <td className="px-1.5 py-1">
                          <span className="inline-block px-1 py-0.5 bg-purple-50 text-purple-700 rounded text-[8px] sm:text-[9px] font-semibold">{e.niveau || "-"}</span>
                        </td>
                        <td className="px-1.5 py-1 text-[9px] sm:text-[10px] max-w-[100px] truncate hidden md:table-cell">{e.projet_professionnel || "-"}</td>
                        <td className="px-1.5 py-1 text-center">
                          <div className="flex gap-0.5 sm:gap-1 justify-center">
                            <button onClick={() => { setSelectedEtudiant(e); setShowDetails(true); setDetailsAnimating(false) }}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded transition-all hover:scale-110" title="Détails">
                              <Eye size={10} className="sm:w-[11px] sm:h-[11px]" />
                            </button>
                            <button onClick={() => handleEdit(e)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all hover:scale-110" title="Modifier">
                              <Pencil size={10} className="sm:w-[11px] sm:h-[11px]" />
                            </button>
                            <button onClick={() => confirmDelete(e)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-all hover:scale-110" title="Supprimer">
                              <Trash2 size={10} className="sm:w-[11px] sm:h-[11px]" />
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
        </div>

        {showForm && (
          <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9998] p-2 ${formAnimating ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className={`bg-white rounded-xl w-full max-w-[95%] xs:max-w-lg sm:max-w-2xl max-h-[90vh] flex flex-col shadow-xl ${formAnimating ? 'animate-scale-out' : 'animate-scale-in'}`}>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 flex justify-between items-center rounded-t-xl">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-white/20 rounded-lg">
                    {editMode ? <Pencil size={14} /> : <Plus size={14} />}
                  </div>
                  <h2 className="text-sm font-bold">{editMode ? "Modifier" : "Ajouter"} étudiant</h2>
                  {anneeActive && <span className="text-[9px] text-blue-200 hidden xs:inline">({anneeActive.libelle})</span>}
                </div>
                <button onClick={resetFormAndClose} className="p-0.5 hover:bg-blue-400 rounded transition-all hover:rotate-90">
                  <X size={14} />
                </button>
              </div>

              <div className="overflow-auto p-3">
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">
                        {fieldLabels.numero_matricule}
                      </label>
                      <input type="text" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        value={form.numero_matricule} disabled={editMode}
                        onChange={e => setForm({ ...form, numero_matricule: e.target.value.toUpperCase() })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.nom}</label>
                      <input type="text" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value.toUpperCase() })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.prenom}</label>
                      <input type="text" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.date_naissance}</label>
                      <input type="date" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        value={form.date_naissance} onChange={e => setForm({ ...form, date_naissance: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.lieu_naissance}</label>
                      <input type="text" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        value={form.lieu_naissance} onChange={e => setForm({ ...form, lieu_naissance: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.telephone}</label>
                      <input type="text" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.genre}</label>
                      <select className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}>
                        <option value="">Sélectionner</option>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.filiere_choisie}</label>
                      <select className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        value={form.filiere_choisie} onChange={e => setForm({ ...form, filiere_choisie: e.target.value })}>
                        <option value="">Sélectionner</option>
                        {filieres.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.niveau}</label>
                      <select className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}>
                        <option value="">Sélectionner</option>
                        {niveaux.map(n => <option key={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.date_inscription}</label>
                      <input type="date" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                        value={form.date_inscription} onChange={e => setForm({ ...form, date_inscription: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.nom_complet_pere}</label>
                    <input type="text" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                      value={form.nom_complet_pere} onChange={e => setForm({ ...form, nom_complet_pere: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.nom_complet_mere}</label>
                    <input type="text" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                      value={form.nom_complet_mere} onChange={e => setForm({ ...form, nom_complet_mere: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.nom_complet_tuteur}</label>
                    <input type="text" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                      value={form.nom_complet_tuteur} onChange={e => setForm({ ...form, nom_complet_tuteur: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.adresse}</label>
                    <input type="text" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                      value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">{fieldLabels.projet_professionnel}</label>
                  <textarea rows="2" className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    value={form.projet_professionnel} onChange={e => setForm({ ...form, projet_professionnel: e.target.value })} />
                </div>
              </div>

              <div className="border-t p-2 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                <button onClick={resetFormAndClose} className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 transition-all hover:scale-105">
                  Annuler
                </button>
                <button onClick={handleSave} disabled={loading}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 hover:scale-105">
                  {loading ? "..." : (editMode ? "Modifier" : "Ajouter")}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetails && selectedEtudiant && (
          <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9998] p-2 ${detailsAnimating ? 'animate-fade-out' : 'animate-fade-in'}`}>
            <div className={`bg-white rounded-xl w-full max-w-[90%] xs:max-w-sm shadow-xl ${detailsAnimating ? 'animate-scale-out' : 'animate-scale-in'}`}>
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-3 py-2 flex justify-between items-center rounded-t-xl">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-white/20 rounded-lg">
                    <Award size={14} className="text-yellow-400" />
                  </div>
                  <h2 className="text-sm font-bold">Détails étudiant</h2>
                </div>
                <button onClick={handleCloseDetails} className="p-0.5 hover:bg-gray-600 rounded transition-all hover:rotate-90">
                  <X size={14} />
                </button>
              </div>

              <div className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-gray-500 uppercase">Matricule</p>
                    <p className="text-[10px] sm:text-xs font-mono font-semibold break-words">{selectedEtudiant.numero_matricule}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-gray-500 uppercase">Nom complet</p>
                    <p className="text-[10px] sm:text-xs font-semibold break-words">{selectedEtudiant.nom} {selectedEtudiant.prenom}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-gray-500 uppercase">Genre</p>
                    <p className="text-[10px] sm:text-xs">{selectedEtudiant.genre === "M" ? "Masculin" : "Féminin"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-gray-500 uppercase">Date naissance</p>
                    <p className="text-[10px] sm:text-xs">{selectedEtudiant.date_naissance?.slice(0, 10) || "-"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-gray-500 uppercase">Lieu naissance</p>
                    <p className="text-[10px] sm:text-xs break-words">{selectedEtudiant.lieu_naissance || "-"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-gray-500 uppercase">Téléphone</p>
                    <p className="text-[10px] sm:text-xs">{selectedEtudiant.telephone || "-"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-gray-500 uppercase">Filière</p>
                    <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] sm:text-[10px] font-semibold break-words">{selectedEtudiant.nom_filiere}</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-gray-500 uppercase">Niveau</p>
                    <span className="inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] sm:text-[10px] font-semibold">{selectedEtudiant.niveau}</span>
                  </div>
                  <div className="col-span-2 bg-gray-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-gray-500 uppercase">Adresse</p>
                    <p className="text-[10px] sm:text-xs break-words">{selectedEtudiant.adresse || "-"}</p>
                  </div>
                  <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-1.5">
                    <p className="text-[8px] text-blue-600 uppercase flex items-center gap-1">
                      <Award size={10} /> Projet professionnel
                    </p>
                    <p className="text-[10px] sm:text-xs break-words">{selectedEtudiant.projet_professionnel || "Non renseigné"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t p-2 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => generateSingleStudentPDF(selectedEtudiant)}
                  className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all"
                >
                  <FileText size={10} className="inline mr-1" /> PDF individuel
                </button>
                <button onClick={handleCloseDetails} className="px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:scale-105 transition-all">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        <PdfMenuPortal />
        <NiveauFiliereSelectorPortal />
        <SingleStudentSearchPortal />
        <ConfirmDeleteModal />
        <SuccessModal />
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-15px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes scaleOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-slide-right { animation: slideRight 0.2s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-fade-out { animation: fadeOut 0.15s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
        .animate-scale-out { animation: scaleOut 0.15s ease-out forwards; }
        .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; }
        
        @media (min-width: 480px) {
          .xs\\:inline { display: inline; }
          .xs\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .xs\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .xs\\:flex-row { flex-direction: row; }
          .xs\\:max-w-sm { max-width: 24rem; }
          .xs\\:max-w-lg { max-width: 32rem; }
        }
        @media (max-width: 479px) {
          .xs\\:inline { display: none; }
        }
      `}</style> 
    </div>
  )
}