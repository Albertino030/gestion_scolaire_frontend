import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  getNotes,
  addNotes,
  deleteNote,
  getEtudiantsByFiliereNiveau,
  getMatieresByFiliereNiveau,
  getFilieres,
  getNiveaux,
  getExamens,
  getAnneeActive,
  getExamensByAnnee,
  getMoyennesAnnuelles,
  saveDeliberation,
  getDeliberations
} from "../api/examen";

import {
  Plus,
  Trash2,
  X,
  Pencil,
  Filter,
  Download,
  Printer,
  ChevronDown,
  Users,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Search,
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  UserCheck,
  UserX,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Settings,
  Users as UsersIcon,
  FileCheck
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

export default function Examen() {
  const [activeTab, setActiveTab] = useState("notes");
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formAnimating, setFormAnimating] = useState(false);
  const [filters, setFilters] = useState({
    filiere: "",
    niveau: "",
    examen: "",
  });
  const [deliberationFilters, setDeliberationFilters] = useState({
    filiere: "",
    niveau: "",
  });
  const [matieres, setMatieres] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [allEtudiants, setAllEtudiants] = useState([]);
  const [filieresList, setFilieresList] = useState([]);
  const [niveauxList, setNiveauxList] = useState([]);
  const [examensList, setExamensList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [animatedRows, setAnimatedRows] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportMenuPosition, setExportMenuPosition] = useState({ top: 0, left: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const exportButtonRef = useRef(null);
  const exportMenuRef = useRef(null);
  const tableContainerRef = useRef(null);
  const [anneeActive, setAnneeActive] = useState(null);
  
  const [moyennesAnnuelles, setMoyennesAnnuelles] = useState([]);
  const [deliberations, setDeliberations] = useState({});
  const [savingDeliberation, setSavingDeliberation] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToExpel, setStudentToExpel] = useState(null);
  const [moyenneDeliberation, setMoyenneDeliberation] = useState(10);
  const [showPassantList, setShowPassantList] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState("tous");

  const [form, setForm] = useState({
    numero_matricule: "",
    nom: "",
    prenom: "",
    notes: {},
  });

  const examenCoefficients = {
    "Examen 1": 1,
    "Examen 2": 2,
    "Examen 3": 1,
    "Examen 4": 2,
    "Examen 5": 1,
    "Examen 6": 2
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportButtonRef.current &&
        !exportButtonRef.current.contains(event.target) &&
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const updateExportMenuPosition = () => {
    if (exportButtonRef.current) {
      const rect = exportButtonRef.current.getBoundingClientRect();
      setExportMenuPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      });
    }
  };

  const handleExportButtonClick = () => {
    if (!showExportMenu) {
      updateExportMenuPosition();
    }
    setShowExportMenu(!showExportMenu);
  };

  const loadAnneeActive = async () => {
    try {
      const res = await getAnneeActive();
      setAnneeActive(res.data);
    } catch (error) {
      console.error("Erreur chargement année active:", error);
    }
  };

  const loadDeliberations = async () => {
    if (!deliberationFilters.filiere || !deliberationFilters.niveau) return;
    try {
      const res = await getDeliberations(
        deliberationFilters.filiere,
        deliberationFilters.niveau,
        anneeActive?.id_annee
      );
      const delibMap = {};
      (res.data || []).forEach(d => {
        delibMap[d.numero_matricule] = d.statut;
      });
      setDeliberations(delibMap);
    } catch (error) {
      console.error("Erreur chargement délibérations:", error);
    }
  };

  useEffect(() => {
    loadAnneeActive();
    loadFilieres();
    loadNiveaux();
    loadExamens();
  }, []);

  useEffect(() => {
    if (activeTab === "deliberation" && deliberationFilters.filiere && deliberationFilters.niveau) {
      loadMoyennesAnnuelles();
      loadDeliberations();
    }
  }, [deliberationFilters, anneeActive, activeTab]);

  useEffect(() => {
    const checkScroll = () => {
      if (tableContainerRef.current) {
        const hasScroll = tableContainerRef.current.scrollWidth > tableContainerRef.current.clientWidth;
        setShowScrollButtons(hasScroll);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [matieres]);

  useEffect(() => {
    if (notes.length > 0) {
      setTimeout(() => {
        setAnimatedRows(notes.map(() => true));
      }, 100);
    }
  }, [notes]);

  const loadFilieres = async () => {
    try {
      const res = await getFilieres();
      setFilieresList(res.data || []);
      if (res.data && res.data.length > 0) {
        setFilters(prev => ({ ...prev, filiere: res.data[0] }));
        setDeliberationFilters(prev => ({ ...prev, filiere: res.data[0] }));
      }
    } catch (error) {
      console.error("Erreur chargement filières:", error);
      setErrorMessage("Erreur chargement des filières");
    }
  };

  const loadNiveaux = async () => {
    try {
      const res = await getNiveaux();
      const correctedNiveaux = (res.data || []).map(n => {
        if (n === "1ère année") return "1ère année";
        if (n === "2ème année") return "2ème année";
        if (n === "3ème année") return "3ème année";
        return n;
      });
      setNiveauxList(correctedNiveaux);
      if (correctedNiveaux.length > 0) {
        setFilters(prev => ({ ...prev, niveau: correctedNiveaux[0] }));
        setDeliberationFilters(prev => ({ ...prev, niveau: correctedNiveaux[0] }));
      }
    } catch (error) {
      console.error("Erreur chargement niveaux:", error);
      setNiveauxList(["1ère année", "2ème année", "3ème année"]);
    }
  };

  // ✅ CORRECTION 1 : loadExamens transforme les objets en strings
  const loadExamens = async () => {
    try {
      const res = await getExamensByAnnee(anneeActive?.id_annee);
      if (res.data && res.data.length > 0) {
        const examensNoms = res.data.map(e => e.nom_examen);
        setExamensList(examensNoms);
        setFilters(prev => ({ ...prev, examen: examensNoms[0] }));
      } else {
        setExamensList(["Examen 1", "Examen 2", "Examen 3", "Examen 4", "Examen 5", "Examen 6"]);
        setFilters(prev => ({ ...prev, examen: "Examen 1" }));
      }
    } catch (error) {
      console.error("Erreur chargement examens:", error);
      setExamensList(["Examen 1", "Examen 2", "Examen 3", "Examen 4", "Examen 5", "Examen 6"]);
    }
  };

  useEffect(() => {
    if (filters.filiere && filters.niveau && filters.examen) {
      loadNotes();
      loadMatieres();
      loadEtudiants();
    }
  }, [filters.filiere, filters.niveau, filters.examen, anneeActive]);

  const calculerMoyenneAnnuelle = (notesParExamen) => {
    let totalPondere = 0;
    let totalCoeffs = 0;
    
    for (let i = 1; i <= 6; i++) {
      const examenNom = `Examen ${i}`;
      const examenData = notesParExamen[examenNom];
      const coeff = examenCoefficients[examenNom] || 1;
      
      if (examenData && examenData.moyenne !== undefined && !isNaN(examenData.moyenne)) {
        totalPondere += examenData.moyenne * coeff;
        totalCoeffs += coeff;
      }
    }
    
    return totalCoeffs > 0 ? totalPondere / totalCoeffs : 0;
  };

  const loadMoyennesAnnuelles = async () => {
    setLoading(true);
    try {
      const res = await getMoyennesAnnuelles(
        deliberationFilters.filiere,
        deliberationFilters.niveau,
        anneeActive?.id_annee
      );
      const data = res.data || [];
      
      const avecMoyenne = data.map(etudiant => {
        const moyenneAnnuelle = calculerMoyenneAnnuelle(etudiant.notes_par_examen || {});
        let statutPropose = "en_attente";
        if (moyenneAnnuelle >= moyenneDeliberation) {
          statutPropose = "passe";
        } else if (moyenneAnnuelle >= moyenneDeliberation - 2) {
          statutPropose = "redouble";
        } else {
          statutPropose = "renvoye";
        }
        
        return {
          ...etudiant,
          moyenne_annuelle: moyenneAnnuelle,
          statut: deliberations[etudiant.numero_matricule] || statutPropose
        };
      });
      
      const tries = [...avecMoyenne].sort((a, b) => b.moyenne_annuelle - a.moyenne_annuelle);
      setMoyennesAnnuelles(tries);
    } catch (error) {
      console.error("Erreur chargement moyennes annuelles:", error);
      setErrorMessage("Erreur chargement des données pour délibération");
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await getNotes({ ...filters, id_annee: anneeActive?.id_annee });
      const notesData = res.data || [];
      setNotes(notesData);
    } catch (error) {
      console.error("Erreur chargement notes:", error);
      setNotes([]);
      setErrorMessage("Erreur chargement des notes");
    } finally {
      setLoading(false);
    }
  };

  const loadMatieres = async () => {
    try {
      const res = await getMatieresByFiliereNiveau(filters.filiere, filters.niveau, anneeActive?.id_annee);
      setMatieres(res.data || []);
    } catch (error) {
      console.error("Erreur chargement matières:", error);
      setMatieres([]);
      setErrorMessage("Erreur chargement des matières");
    }
  };

  const loadEtudiants = async () => {
    try {
      const res = await getEtudiantsByFiliereNiveau(filters.filiere, filters.niveau, anneeActive?.id_annee);
      const etudiantsData = res.data || [];
      setEtudiants(etudiantsData);
      setAllEtudiants(etudiantsData);
      
      if (etudiantsData.length === 0) {
        setErrorMessage(`Aucun étudiant trouvé pour ${filters.filiere} - ${filters.niveau}`);
      }
    } catch (error) {
      console.error("Erreur chargement étudiants:", error);
      setEtudiants([]);
      setAllEtudiants([]);
      setErrorMessage("Erreur chargement des étudiants. Vérifiez que l'API est bien configurée.");
    }
  };

  const handleSaveDeliberation = async (numero_matricule, statut) => {
    setSavingDeliberation(true);
    try {
      await saveDeliberation({
        numero_matricule,
        filiere: deliberationFilters.filiere,
        niveau: deliberationFilters.niveau,
        id_annee: anneeActive?.id_annee,
        statut,
        moyenne_annuelle: moyennesAnnuelles.find(e => e.numero_matricule === numero_matricule)?.moyenne_annuelle || 0
      });
      
      setDeliberations(prev => ({ ...prev, [numero_matricule]: statut }));
      setMoyennesAnnuelles(prev => 
        prev.map(e => 
          e.numero_matricule === numero_matricule 
            ? { ...e, statut } 
            : e
        )
      );
      setSuccessMessage(`✅ Statut mis à jour: ${getStatutLabel(statut)}`);
    } catch (error) {
      console.error("Erreur sauvegarde délibération:", error);
      setErrorMessage("❌ Erreur lors de la sauvegarde");
    } finally {
      setSavingDeliberation(false);
    }
  };

  const applyDeliberationThreshold = () => {
    const nouvellesDelibs = {};
    moyennesAnnuelles.forEach(etudiant => {
      let nouveauStatut = "en_attente";
      if (etudiant.moyenne_annuelle >= moyenneDeliberation) {
        nouveauStatut = "passe";
      } else if (etudiant.moyenne_annuelle >= moyenneDeliberation - 2) {
        nouveauStatut = "redouble";
      } else {
        nouveauStatut = "renvoye";
      }
      nouvellesDelibs[etudiant.numero_matricule] = nouveauStatut;
    });
    
    setDeliberations(prev => ({ ...prev, ...nouvellesDelibs }));
    setMoyennesAnnuelles(prev => 
      prev.map(e => ({
        ...e,
        statut: nouvellesDelibs[e.numero_matricule] || e.statut
      }))
    );
    setSuccessMessage(`✅ Seuil de délibération appliqué : ${moyenneDeliberation}/20`);
  };

  const handleSaveAllDeliberations = async () => {
    setSavingDeliberation(true);
    try {
      const delibereList = moyennesAnnuelles.map(e => ({
        numero_matricule: e.numero_matricule,
        filiere: deliberationFilters.filiere,
        niveau: deliberationFilters.niveau,
        id_annee: anneeActive?.id_annee,
        statut: e.statut,
        moyenne_annuelle: e.moyenne_annuelle
      }));
      
      for (const item of delibereList) {
        await saveDeliberation(item);
      }
      
      setSuccessMessage("✅ Toutes les délibérations ont été sauvegardées !");
    } catch (error) {
      console.error("Erreur sauvegarde massive:", error);
      setErrorMessage("❌ Erreur lors de la sauvegarde massive");
    } finally {
      setSavingDeliberation(false);
    }
  };

  const handleExpelStudent = (etudiant) => {
    setStudentToExpel(etudiant);
    setShowConfirmModal(true);
  };

  const confirmExpel = async () => {
    if (studentToExpel) {
      await handleSaveDeliberation(studentToExpel.numero_matricule, "renvoye");
      setShowConfirmModal(false);
      setStudentToExpel(null);
    }
  };

  const getStatutLabel = (statut) => {
    switch(statut) {
      case "passe": return "Passé ✅";
      case "redouble": return "Redoublement 🔄";
      case "renvoye": return "Renvoyé ❌";
      default: return "En attente ⏳";
    }
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case "passe": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "redouble": return "bg-amber-100 text-amber-700 border-amber-200";
      case "renvoye": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const getFilteredStudents = () => {
    if (filtreStatut === "tous") return moyennesAnnuelles;
    return moyennesAnnuelles.filter(e => e.statut === filtreStatut);
  };

  const exportPassantListPDF = () => {
    const passants = moyennesAnnuelles.filter(e => e.statut === "passe");
    if (passants.length === 0) {
      setErrorMessage("Aucun étudiant n'a le statut 'Passé'");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.width;
      
      doc.setFontSize(16);
      doc.setTextColor(0, 51, 102);
      doc.setFont("helvetica", "bold");
      doc.text("CENTRE DE FORMATION PROFESSIONNELLE DON BOSCO", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(80, 80, 80);
      doc.text("LISTE DES ÉTUDIANTS ADMIS", pageWidth / 2, 30, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Filière: ${deliberationFilters.filiere} | Niveau: ${deliberationFilters.niveau}`, pageWidth / 2, 38, { align: "center" });
      doc.text(`Seuil de délibération: ${moyenneDeliberation}/20`, pageWidth / 2, 44, { align: "center" });

      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2,'0')}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getFullYear()}`;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Généré le : ${dateStr}`, pageWidth - 20, 10, { align: "right" });

      const tableData = passants.map((e, idx) => [
        idx + 1,
        e.numero_matricule || "",
        e.nom || "",
        e.prenom || "",
        e.moyenne_annuelle.toFixed(2)
      ]);

      autoTable(doc, {
        startY: 50,
        head: [["N°", "Matricule", "Nom", "Prénom", "Moyenne"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 9, fontStyle: "bold", halign: "center" },
        bodyStyles: { fontSize: 8, halign: "center" },
        margin: { left: 15, right: 15 },
        styles: { cellPadding: 3 }
      });

      doc.save(`liste_admis_${deliberationFilters.filiere}_${deliberationFilters.niveau}_${dateStr.replace(/\//g, '-')}.pdf`);
      setSuccessMessage("✅ Liste des admis exportée avec succès!");
    } catch (error) {
      console.error("Erreur export PDF:", error);
      setErrorMessage(`❌ Erreur lors de l'export PDF: ${error.message}`);
    }
  };

  const calculerTotalEtMoyenne = (etudiant) => {
    let totalPoints = 0;
    let totalCoeffs = 0;
    
    matieres.forEach(matiere => {
      const note = etudiant.notes?.[matiere.nom_matiere];
      if (note && !isNaN(parseFloat(note))) {
        totalPoints += parseFloat(note) * (matiere.coefficient || 1);
        totalCoeffs += (matiere.coefficient || 1);
      }
    });
    
    const moyenne = totalCoeffs > 0 ? totalPoints / totalCoeffs : 0;
    return { totalPoints, moyenne };
  };

  const getStudentsWithRanks = () => {
    const etudiantsAvecMoyenne = notes.map(etudiant => {
      const { totalPoints, moyenne } = calculerTotalEtMoyenne(etudiant);
      return {
        ...etudiant,
        totalPoints,
        moyenne
      };
    });
    
    const etudiantsTries = [...etudiantsAvecMoyenne].sort((a, b) => b.moyenne - a.moyenne);
    const etudiantsAvecRang = etudiantsTries.map((etudiant, index) => ({
      ...etudiant,
      rang: index + 1
    }));
    
    return etudiantsAvecRang;
  };

  const studentsWithRanks = getStudentsWithRanks();

  const calculerStatsParcourt = () => {
    const statsMatieres = {};
    let totalMoyennes = 0;
    let totalAdmis = 0;
    let totalMeilleurs = 0;
    
    matieres.forEach(matiere => {
      let somme = 0;
      let count = 0;
      let meilleur = 0;
      let echecs = 0;
      
      notes.forEach(etudiant => {
        const note = etudiant.notes?.[matiere.nom_matiere];
        if (note && !isNaN(parseFloat(note))) {
          const noteVal = parseFloat(note);
          somme += noteVal;
          count++;
          if (noteVal > meilleur) meilleur = noteVal;
          if (noteVal < 10) echecs++;
        }
      });
      
      statsMatieres[matiere.nom_matiere] = {
        moyenne: count > 0 ? somme / count : 0,
        meilleure: meilleur,
        tauxReussite: count > 0 ? ((count - echecs) / count * 100) : 0
      };
    });
    
    notes.forEach(etudiant => {
      const { moyenne } = calculerTotalEtMoyenne(etudiant);
      totalMoyennes += moyenne;
      if (moyenne >= 10) totalAdmis++;
      if (moyenne >= 14) totalMeilleurs++;
    });
    
    return {
      moyenneGenerale: notes.length > 0 ? totalMoyennes / notes.length : 0,
      tauxReussite: notes.length > 0 ? (totalAdmis / notes.length * 100) : 0,
      tauxMentions: notes.length > 0 ? (totalMeilleurs / notes.length * 100) : 0,
      statsMatieres
    };
  };

  const statsAvancees = calculerStatsParcourt();

  const stats = {
    totalEtudiants: notes.length,
    moyenneGenerale: notes.reduce((acc, etudiant) => acc + calculerTotalEtMoyenne(etudiant).moyenne, 0) / notes.length || 0,
    meilleureMoyenne: Math.max(...notes.map(e => calculerTotalEtMoyenne(e).moyenne), 0),
    tauxReussite: notes.filter(e => calculerTotalEtMoyenne(e).moyenne >= 10).length / notes.length * 100 || 0,
  };

  const handleEdit = (etudiant, matiere, noteValue, idNote) => {
    setEditMode(true);
    setForm({
      numero_matricule: etudiant.numero_matricule,
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      notes: { [matiere.id_matiere]: noteValue || "" },
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormAnimating(true);
    setTimeout(() => {
      setForm({
        numero_matricule: "",
        nom: "",
        prenom: "",
        notes: {},
      });
      setEditMode(false);
      setShowForm(false);
      setSearchTerm("");
      setFormAnimating(false);
    }, 150);
  };

  const handleSubmitNotes = async () => {
    if (!form.numero_matricule) {
      setErrorMessage("❌ Sélectionnez un étudiant");
      return;
    }

    const hasNotes = Object.values(form.notes).some(note => note && note !== "");
    if (!hasNotes) {
      setErrorMessage("❌ Veuillez saisir au moins une note");
      return;
    }

    setLoading(true);

    try {
      // ✅ CORRECTION 2 : Utiliser findIndex car examensList est maintenant un tableau de strings
      const examenId = examensList.indexOf(filters.examen) + 1 || 1;
      
      await addNotes({
        numero_matricule: form.numero_matricule,
        id_examen: examenId,
        notes: form.notes,
      });
      
      resetForm();
      await loadNotes();
      setSuccessMessage("✅ Notes enregistrées avec succès!");
    } catch (error) {
      console.error("Erreur enregistrement:", error);
      setErrorMessage("❌ Erreur lors de l'enregistrement des notes");
    } finally {
      setLoading(false);
    }
  };

  const filteredEtudiants = allEtudiants.filter(e => 
    `${e.nom} ${e.prenom} ${e.numero_matricule}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatNiveau = (niveau) => {
    if (!niveau) return "";
    const niveauStr = niveau.toString();
    if (niveauStr.includes("1")) return "1ère année";
    if (niveauStr.includes("2")) return "2ème année";
    if (niveauStr.includes("3")) return "3ème année";
    return niveauStr;
  };

  const scrollTable = (direction) => {
    if (tableContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      tableContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const exportToPDF = () => {
    if (!notes || notes.length === 0) {
      setErrorMessage("Aucune donnée à exporter");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.width;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.setFont("helvetica", "bold");
      doc.text("CENTRE DE FORMATION PROFESSIONNELLE DON BOSCO", pageWidth / 2, 15, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text("GESTION DES NOTES D'EXAMEN", pageWidth / 2, 23, { align: "center" });

      doc.setFontSize(9);
      doc.text(`Filière: ${filters.filiere} | Niveau: ${filters.niveau} | Examen: ${filters.examen}`, pageWidth / 2, 31, { align: "center" });

      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2,'0')}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getFullYear()}`;
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(`Exporté le : ${dateStr}`, pageWidth - 20, 8, { align: "right" });

      let currentY = 40;

      doc.setFillColor(0, 51, 102);
      doc.rect(10, currentY, pageWidth - 20, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text("STATISTIQUES GÉNÉRALES", pageWidth / 2, currentY + 4.5, { align: "center" });
      currentY += 10;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      const statsData = [
        ["Total étudiants", `${stats.totalEtudiants}`],
        ["Moyenne générale", `${stats.moyenneGenerale.toFixed(2)}/20`],
        ["Meilleure moyenne", `${stats.meilleureMoyenne.toFixed(2)}/20`],
        ["Taux de réussite", `${stats.tauxReussite.toFixed(1)}%`],
        ["Taux de mentions (≥14)", `${statsAvancees.tauxMentions.toFixed(1)}%`]
      ];

      autoTable(doc, {
        startY: currentY,
        head: [["Indicateur", "Valeur"]],
        body: statsData,
        theme: "striped",
        headStyles: { fillColor: [100, 100, 100], textColor: 255, fontSize: 8, halign: "center" },
        bodyStyles: { fontSize: 7 },
        margin: { left: 10, right: 10 },
        styles: { cellPadding: 2 }
      });

      currentY = doc.lastAutoTable.finalY + 5;

      if (studentsWithRanks.length > 0) {
        doc.setFillColor(0, 51, 102);
        doc.rect(10, currentY, pageWidth - 20, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text("TABLEAU DES NOTES (CLASSEMENT PAR RANG)", pageWidth / 2, currentY + 4.5, { align: "center" });
        currentY += 10;

        const tableData = studentsWithRanks.map(e => [
          e.numero_matricule || "",
          e.nom || "",
          e.prenom || "",
          e.moyenne.toFixed(2),
          e.rang
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [["Matricule", "Nom", "Prénom", "Moyenne/20", "Rang"]],
          body: tableData,
          theme: "striped",
          headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 8, fontStyle: "bold", halign: "center" },
          bodyStyles: { fontSize: 7, halign: "center" },
          margin: { left: 10, right: 10 },
          styles: { cellPadding: 2 }
        });
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Page ${i} sur ${pageCount} - CFP Don Bosco`,
          pageWidth / 2,
          doc.internal.pageSize.height - 8,
          { align: "center" }
        );
      }

      doc.save(`notes_${filters.filiere}_${filters.niveau}_${dateStr.replace(/\//g, '-')}.pdf`);
      setShowExportMenu(false);
      setSuccessMessage("✅ PDF exporté avec succès!");
    } catch (error) {
      console.error("Erreur export PDF:", error);
      setErrorMessage(`❌ Erreur lors de l'export PDF: ${error.message}`);
    }
  };

  const exportDetailedPDF = () => {
    if (!notes || notes.length === 0) {
      setErrorMessage("Aucune donnée à exporter");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.width;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.setFont("helvetica", "bold");
      doc.text("CENTRE DE FORMATION PROFESSIONNELLE DON BOSCO", pageWidth / 2, 15, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text("RELEVÉ DÉTAILLÉ DES NOTES", pageWidth / 2, 23, { align: "center" });

      doc.setFontSize(9);
      doc.text(`Filière: ${filters.filiere} | Niveau: ${filters.niveau} | Examen: ${filters.examen}`, pageWidth / 2, 31, { align: "center" });

      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2,'0')}/${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getFullYear()}`;
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(`Exporté le : ${dateStr}`, pageWidth - 20, 8, { align: "right" });

      const headers = ["Rang", "Matricule", "Nom", "Prénom", ...matieres.map(m => m.nom_matiere), "Total", "Moyenne"];
      
      const tableData = studentsWithRanks.map(etudiant => [
        etudiant.rang,
        etudiant.numero_matricule || "",
        etudiant.nom || "",
        etudiant.prenom || "",
        ...matieres.map(matiere => {
          const note = etudiant.notes?.[matiere.nom_matiere];
          return note ? parseFloat(note).toFixed(1) : "-";
        }),
        etudiant.totalPoints.toFixed(1),
        etudiant.moyenne.toFixed(2)
      ]);

      autoTable(doc, {
        startY: 40,
        head: [headers],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [0, 51, 102], textColor: 255, fontSize: 7, fontStyle: "bold", halign: "center", cellPadding: 1 },
        bodyStyles: { fontSize: 6, halign: "center" },
        margin: { left: 8, right: 8 },
        styles: { cellPadding: 1 }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Page ${i} sur ${pageCount} - CFP Don Bosco`,
          pageWidth / 2,
          doc.internal.pageSize.height - 8,
          { align: "center" }
        );
      }

      doc.save(`notes_detaillees_${filters.filiere}_${dateStr.replace(/\//g, '-')}.pdf`);
      setShowExportMenu(false);
      setSuccessMessage("✅ PDF détaillé exporté avec succès!");
    } catch (error) {
      console.error("Erreur export PDF détaillé:", error);
      setErrorMessage(`❌ Erreur lors de l'export PDF détaillé: ${error.message}`);
    }
  };

  const exportDetailedCSV = () => {
    if (!notes || notes.length === 0) {
      setErrorMessage("Aucune donnée à exporter");
      return;
    }

    try {
      const headers = ["Rang", "Matricule", "Nom", "Prénom", ...matieres.map(m => m.nom_matiere), "Total Points", "Moyenne/20"];
      
      const csvData = studentsWithRanks.map(etudiant => [
        etudiant.rang,
        etudiant.numero_matricule,
        etudiant.nom,
        etudiant.prenom,
        ...matieres.map(matiere => {
          const note = etudiant.notes?.[matiere.nom_matiere];
          return note || "-";
        }),
        etudiant.totalPoints.toFixed(1),
        etudiant.moyenne.toFixed(2)
      ]);
      
      const csvContent = [headers, ...csvData].map(row => row.join(";")).join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
      a.download = `notes_${filters.filiere}_${filters.niveau}_${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportMenu(false);
      setSuccessMessage("✅ CSV exporté avec succès!");
    } catch (error) {
      console.error("Erreur export CSV:", error);
      setErrorMessage(`❌ Erreur lors de l'export CSV: ${error.message}`);
    }
  };

  const exportSimpleCSV = () => {
    if (!notes || notes.length === 0) {
      setErrorMessage("Aucune donnée à exporter");
      return;
    }

    try {
      const headers = ["Rang", "Matricule", "Nom", "Prénom", "Moyenne/20"];
      const csvData = studentsWithRanks.map(e => [
        e.rang,
        e.numero_matricule,
        e.nom,
        e.prenom,
        e.moyenne.toFixed(2)
      ]);
      
      const csvContent = [headers, ...csvData].map(row => row.join(";")).join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
      a.download = `notes_synthese_${dateStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExportMenu(false);
      setSuccessMessage("✅ CSV exporté avec succès!");
    } catch (error) {
      console.error("Erreur export CSV:", error);
      setErrorMessage(`❌ Erreur lors de l'export CSV: ${error.message}`);
    }
  };

  const ExportMenuPortal = () => {
    if (!showExportMenu) return null;
    
    return createPortal(
      <div 
        ref={exportMenuRef}
        className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[99999] min-w-[220px]"
        style={{
          top: `${exportMenuPosition.top}px`,
          left: `${exportMenuPosition.left}px`,
        }}
      >
        <div className="p-1">
          <div className="px-3 py-1.5 text-[9px] font-semibold text-gray-500 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            📄 Format PDF
          </div>
          <button 
            onClick={exportToPDF} 
            className="w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 rounded flex items-center gap-2 transition-colors"
          >
            <FileText size={12} className="text-red-500" />
            Synthèse avec statistiques
          </button>
          <button 
            onClick={exportDetailedPDF} 
            className="w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 rounded flex items-center gap-2 transition-colors"
          >
            <FileText size={12} className="text-red-500" />
            Relevé détaillé des notes
          </button>
          
          <div className="border-t border-gray-100 my-1"></div>
          <div className="px-3 py-1.5 text-[9px] font-semibold text-gray-500 border-b border-gray-100 bg-gray-50">
            📊 Format CSV / Excel
          </div>
          <button 
            onClick={exportSimpleCSV} 
            className="w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 rounded flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet size={12} className="text-green-600" />
            Synthèse des résultats
          </button>
          <button 
            onClick={exportDetailedCSV} 
            className="w-full text-left px-3 py-2 text-[11px] hover:bg-gray-50 rounded flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet size={12} className="text-green-600" />
            Relevé détaillé
          </button>
        </div>
      </div>,
      document.body
    );
  };

  const DeliberationTab = () => {
    const filteredStudents = getFilteredStudents();
    const statsPassage = {
      total: moyennesAnnuelles.length,
      passe: moyennesAnnuelles.filter(e => e.statut === "passe").length,
      redouble: moyennesAnnuelles.filter(e => e.statut === "redouble").length,
      renvoye: moyennesAnnuelles.filter(e => e.statut === "renvoye").length,
      en_attente: moyennesAnnuelles.filter(e => e.statut === "en_attente").length
    };

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
              value={deliberationFilters.filiere}
              onChange={(e) => setDeliberationFilters({ ...deliberationFilters, filiere: e.target.value })}
            >
              {filieresList.map(f => <option key={f}>{f}</option>)}
            </select>
            <select
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
              value={deliberationFilters.niveau}
              onChange={(e) => setDeliberationFilters({ ...deliberationFilters, niveau: e.target.value })}
            >
              {niveauxList.map(n => <option key={n}>{n}</option>)}
            </select>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <label className="absolute -top-2 left-2 px-1 text-[9px] font-semibold text-gray-500 bg-white">Seuil délibération</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={moyenneDeliberation}
                  onChange={(e) => setMoyenneDeliberation(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none pt-5"
                />
              </div>
              <button
                onClick={applyDeliberationThreshold}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-sm whitespace-nowrap"
                title="Appliquer le seuil à tous les étudiants"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>

        {moyennesAnnuelles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-3 text-white">
              <p className="text-[10px] opacity-80">Moyenne classe</p>
              <p className="text-xl font-bold">
                {(moyennesAnnuelles.reduce((acc, e) => acc + e.moyenne_annuelle, 0) / moyennesAnnuelles.length).toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 text-white">
              <p className="text-[10px] opacity-80">Taux réussite</p>
              <p className="text-xl font-bold">
                {(moyennesAnnuelles.filter(e => e.moyenne_annuelle >= moyenneDeliberation).length / moyennesAnnuelles.length * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-3 text-white">
              <p className="text-[10px] opacity-80">Meilleure moyenne</p>
              <p className="text-xl font-bold">
                {Math.max(...moyennesAnnuelles.map(e => e.moyenne_annuelle), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-3 text-white">
              <p className="text-[10px] opacity-80">Total étudiants</p>
              <p className="text-xl font-bold">{moyennesAnnuelles.length}</p>
            </div>
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-3 text-white cursor-pointer hover:scale-105 transition-all"
              onClick={() => setShowPassantList(!showPassantList)}
            >
              <p className="text-[10px] opacity-80">Admis</p>
              <p className="text-xl font-bold">
                {statsPassage.passe}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltreStatut("tous")}
            className={`px-3 py-1.5 text-xs rounded-full transition-all ${filtreStatut === "tous" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Tous ({statsPassage.total})
          </button>
          <button
            onClick={() => setFiltreStatut("passe")}
            className={`px-3 py-1.5 text-xs rounded-full transition-all ${filtreStatut === "passe" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
          >
            Passés ({statsPassage.passe})
          </button>
          <button
            onClick={() => setFiltreStatut("redouble")}
            className={`px-3 py-1.5 text-xs rounded-full transition-all ${filtreStatut === "redouble" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
          >
            Redoublement ({statsPassage.redouble})
          </button>
          <button
            onClick={() => setFiltreStatut("renvoye")}
            className={`px-3 py-1.5 text-xs rounded-full transition-all ${filtreStatut === "renvoye" ? "bg-red-600 text-white" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
          >
            Renvoyés ({statsPassage.renvoye})
          </button>
          <button
            onClick={() => setFiltreStatut("en_attente")}
            className={`px-3 py-1.5 text-xs rounded-full transition-all ${filtreStatut === "en_attente" ? "bg-gray-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
          >
            En attente ({statsPassage.en_attente})
          </button>
        </div>

        {showPassantList && filteredStudents.length > 0 && filteredStudents[0]?.statut === "passe" && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 overflow-hidden animate-fade-in-up">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileCheck size={18} />
                <h3 className="font-semibold">📋 Liste des étudiants admis ({filteredStudents.length})</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportPassantListPDF}
                  className="px-2 py-1 text-xs bg-white text-emerald-700 rounded hover:bg-gray-100 transition-all flex items-center gap-1"
                >
                  <FileText size={12} /> Exporter PDF
                </button>
                <button
                  onClick={() => setShowPassantList(false)}
                  className="px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
            <div className="overflow-x-auto p-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-3 py-2 text-left">N°</th>
                    <th className="px-3 py-2 text-left">Matricule</th>
                    <th className="px-3 py-2 text-left">Nom & Prénom</th>
                    <th className="px-3 py-2 text-center">Moyenne</th>
                    <th className="px-3 py-2 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((etudiant, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-2 font-mono text-xs">{etudiant.numero_matricule}</td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{etudiant.nom}</div>
                        <div className="text-xs text-gray-500">{etudiant.prenom}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="font-bold text-emerald-600">{etudiant.moyenne_annuelle.toFixed(2)}</span>
                        <span className="text-xs text-gray-400">/20</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700`}>
                          <ThumbsUp size={12} /> Passé
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
               </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                  <th className="px-4 py-3 text-left">Matricule</th>
                  <th className="px-4 py-3 text-left">Nom & Prénom</th>
                  <th className="px-4 py-3 text-center">Moyenne Annuelle</th>
                  <th className="px-4 py-3 text-center">Statut Actuel</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
                      <p className="mt-2 text-xs text-gray-500">Chargement...</p>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      Aucun étudiant trouvé pour ce filtre
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((etudiant, idx) => {
                    const moyenne = etudiant.moyenne_annuelle;
                    const moyenneColor = moyenne >= moyenneDeliberation ? "text-emerald-600" : moyenne >= moyenneDeliberation - 2 ? "text-amber-600" : "text-red-600";
                    const statut = etudiant.statut;
                    
                    return (
                      <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{etudiant.numero_matricule}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{etudiant.nom}</div>
                          <div className="text-xs text-gray-500">{etudiant.prenom}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-lg font-bold ${moyenneColor}`}>
                            {moyenne.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400">/20</span>
                          <div className="text-[9px] text-gray-400">
                            Seuil: {moyenneDeliberation}/20
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(statut)}`}>
                            {statut === "passe" && <ThumbsUp size={12} />}
                            {statut === "redouble" && <RefreshCw size={12} />}
                            {statut === "renvoye" && <ThumbsDown size={12} />}
                            {statut === "en_attente" && <AlertTriangle size={12} />}
                            {getStatutLabel(statut)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleSaveDeliberation(etudiant.numero_matricule, "passe")}
                              disabled={savingDeliberation}
                              className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all flex items-center gap-1"
                            >
                              <UserCheck size={12} /> Passer
                            </button>
                            <button
                              onClick={() => handleSaveDeliberation(etudiant.numero_matricule, "redouble")}
                              disabled={savingDeliberation}
                              className="px-3 py-1 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all flex items-center gap-1"
                            >
                              <RefreshCw size={12} /> Redoubler
                            </button>
                            <button
                              onClick={() => handleExpelStudent(etudiant)}
                              disabled={savingDeliberation}
                              className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-1"
                            >
                              <UserX size={12} /> Renvoyer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {moyennesAnnuelles.length > 0 && (
          <div className="flex justify-end gap-3">
            <button
              onClick={exportPassantListPDF}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <FileCheck size={16} />
              Exporter liste des admis
            </button>
            <button
              onClick={handleSaveAllDeliberations}
              disabled={savingDeliberation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Sauvegarder toutes les délibérations
            </button>
          </div>
        )}

        {showConfirmModal && studentToExpel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-fade-in">
            <div className="bg-white rounded-xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Confirmation de renvoi
                </h3>
              </div>
              <div className="p-4">
                <p className="text-gray-700 mb-2">
                  Êtes-vous sûr de vouloir <span className="font-bold text-red-600">renvoyer</span> l'étudiant :
                </p>
                <p className="font-semibold text-center py-2 bg-red-50 rounded-lg">
                  {studentToExpel.nom} {studentToExpel.prenom}
                </p>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Matricule: {studentToExpel.numero_matricule}
                </p>
                <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-2 rounded-lg">
                  ⚠️ Cette action est irréversible. L'étudiant sera définitivement exclu de l'établissement.
                </p>
              </div>
              <div className="flex gap-2 p-4 border-t border-gray-100">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmExpel}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Confirmer le renvoi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && notes.length === 0 && activeTab === "notes") {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-xs text-gray-500 animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <ExportMenuPortal />

      {errorMessage && (
        <div className="fixed top-4 right-4 z-[99998] flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shadow-lg animate-slide-down bg-red-500 text-white">
          <AlertCircle size={14} />
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="fixed top-4 right-4 z-[99998] flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shadow-lg animate-slide-down bg-emerald-500 text-white">
          <CheckCircle size={14} />
          {successMessage}
        </div>
      )}

      <div className="p-2 md:p-3 lg:p-4">

        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 text-sm font-medium transition-all relative ${
              activeTab === "notes" 
                ? "text-emerald-600 border-b-2 border-emerald-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📝 Saisie des notes
          </button>
          <button
            onClick={() => setActiveTab("deliberation")}
            className={`px-4 py-2 text-sm font-medium transition-all relative ${
              activeTab === "deliberation" 
                ? "text-emerald-600 border-b-2 border-emerald-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ⚖️ Délibération & Passage
          </button>
        </div>

        {activeTab === "notes" ? (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2.5 mb-3 animate-slide-down">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                    <GraduationCap className="text-white" size={16} />
                  </div>
                  <div>
                    <h1 className="text-sm md:text-base font-bold text-gray-800">
                      Gestion des Notes
                    </h1>
                    <p className="text-[10px] text-gray-500">
                      Session: <span className="font-semibold">{filters.examen || "Non défini"}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1.5">
                  <button
                    ref={exportButtonRef}
                    onClick={handleExportButtonClick}
                    className="px-2 py-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all hover:scale-105 flex items-center gap-1"
                  >
                    <Download size={12} /> Export <ChevronDown size={10} className={`transform transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <button onClick={() => window.print()} className="px-2 py-1 text-[11px] text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all hover:scale-105">
                    <Printer size={12} /> <span className="hidden sm:inline">Imprimer</span>
                  </button>
                  
                  <button
                    onClick={() => setShowStatsModal(true)}
                    className="px-2 py-1 text-[11px] text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all hover:scale-105"
                  >
                    <BarChart3 size={12} /> Stats
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 hover:shadow-md transition-all hover:scale-105 animate-slide-up">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase">Total</p>
                    <p className="text-lg font-bold text-gray-800">{stats.totalEtudiants}</p>
                  </div>
                  <Users size={14} className="text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 hover:shadow-md transition-all hover:scale-105 animate-slide-up" style={{ animationDelay: "100ms" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase">Moy. générale</p>
                    <p className="text-lg font-bold text-emerald-600">{stats.moyenneGenerale.toFixed(1)}</p>
                  </div>
                  <TrendingUp size={14} className="text-emerald-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 hover:shadow-md transition-all hover:scale-105 animate-slide-up" style={{ animationDelay: "200ms" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase">Meilleure</p>
                    <p className="text-lg font-bold text-amber-600">{stats.meilleureMoyenne.toFixed(1)}</p>
                  </div>
                  <Award size={14} className="text-amber-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 hover:shadow-md transition-all hover:scale-105 animate-slide-up" style={{ animationDelay: "300ms" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase">Réussite</p>
                    <p className="text-lg font-bold text-purple-600">{stats.tauxReussite.toFixed(0)}%</p>
                  </div>
                  <BarChart3 size={14} className="text-purple-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-3 overflow-hidden animate-slide-up" style={{ animationDelay: "400ms" }}>
              <div className="p-2">
                <div className="flex flex-wrap gap-2">
                  <div className="flex-1 min-w-[120px] relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
                    <input
                      className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                      placeholder="Rechercher un étudiant..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <button
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className="px-2 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg flex items-center gap-1 hover:bg-gray-200 transition-all"
                  >
                    <Filter size={12} /> Filtres <ChevronDown size={10} className={`transform transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => {
                      if (allEtudiants.length === 0) {
                        setErrorMessage("❌ Aucun étudiant trouvé pour cette filière et niveau");
                        return;
                      }
                      setShowForm(true);
                      setEditMode(false);
                      setForm({
                        numero_matricule: "",
                        nom: "",
                        prenom: "",
                        notes: {},
                      });
                    }}
                    className="px-2 py-1.5 text-xs bg-emerald-500 text-white rounded-lg flex items-center gap-1 hover:bg-emerald-600 transition-all hover:scale-105"
                  >
                    <Plus size={12} /> Nouvelle
                  </button>
                </div>
                
                {showFilterPanel && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 animate-slide-down">
                    <select
                      className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                      value={filters.filiere}
                      onChange={(e) => setFilters({ ...filters, filiere: e.target.value })}
                    >
                      {filieresList.map(f => <option key={f}>{f}</option>)}
                    </select>
                    <select
                      className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                      value={filters.niveau}
                      onChange={(e) => setFilters({ ...filters, niveau: e.target.value })}
                    >
                      {niveauxList.map(n => <option key={n}>{n}</option>)}
                    </select>
                    <select
                      className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                      value={filters.examen}
                      onChange={(e) => setFilters({ ...filters, examen: e.target.value })}
                    >
                      {examensList && examensList.length > 0 ? (
                        examensList.map(examen => (
                          <option key={examen} value={examen}>
                            {examen}
                          </option>
                        ))
                      ) : (
                        <option value="">Chargement...</option>
                      )}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: "500ms" }}>
              {showScrollButtons && matieres.length > 3 && (
                <div className="flex items-center justify-between gap-1 p-1.5 border-b border-gray-100 bg-gray-50">
                  <button onClick={() => scrollTable('left')} className="p-1 hover:bg-gray-200 rounded-lg transition-all">
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[9px] text-gray-500 animate-pulse">← Glissez pour voir plus →</span>
                  <button onClick={() => scrollTable('right')} className="p-1 hover:bg-gray-200 rounded-lg transition-all">
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              <div 
                ref={tableContainerRef}
                className="overflow-x-auto scroll-smooth"
                style={{ maxWidth: '100%' }}
              >
                <div style={{ minWidth: `${Math.max(700, 350 + matieres.length * 80)}px` }}>
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                        <th className="px-2 py-1.5 text-center font-semibold w-12">Rang</th>
                        <th className="px-2 py-1.5 text-left font-semibold sticky left-0 bg-gray-800 z-10">Matricule</th>
                        <th className="px-2 py-1.5 text-left font-semibold sticky left-[70px] bg-gray-800 z-10">Étudiant</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Filière</th>
                        <th className="px-2 py-1.5 text-left font-semibold">Niveau</th>
                        {matieres.map((matiere, idx) => (
                          <th key={idx} className="px-2 py-1.5 text-center font-semibold whitespace-nowrap">
                            {matiere.nom_matiere?.substring(0, 12) || ""}
                            <span className="block text-[8px] text-gray-300">coeff {matiere.coefficient || 1}</span>
                          </th>
                        ))}
                        <th className="px-2 py-1.5 text-center font-semibold bg-gray-700">Total</th>
                        <th className="px-2 py-1.5 text-center font-semibold bg-gray-700">Moy.</th>
                        <th className="px-2 py-1.5 text-center font-semibold bg-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsWithRanks.length === 0 ? (
                        <tr className="animate-fade-in">
                          <td colSpan={6 + matieres.length} className="text-center py-8">
                            <BookOpen className="text-gray-300 mx-auto mb-1" size={24} />
                            <p className="text-[11px] text-gray-500">Aucune note enregistrée</p>
                            <p className="text-[10px] text-gray-400 mt-1">Cliquez sur "Nouvelle" pour ajouter des notes</p>
                          </td>
                        </tr>
                      ) : (
                        studentsWithRanks.map((etudiant, idx) => {
                          let rankColor = "";
                          if (etudiant.rang === 1) rankColor = "bg-yellow-100 text-yellow-800";
                          else if (etudiant.rang === 2) rankColor = "bg-gray-200 text-gray-700";
                          else if (etudiant.rang === 3) rankColor = "bg-orange-100 text-orange-700";
                          else rankColor = "bg-gray-100 text-gray-600";
                          
                          return (
                            <tr 
                              key={idx} 
                              className={`border-t border-gray-100 hover:bg-gray-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} ${animatedRows[idx] ? 'animate-slide-right' : 'opacity-0'}`}
                              style={{ animationDelay: `${idx * 20}ms` }}
                            >
                              <td className="px-2 py-1 text-center">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${rankColor}`}>
                                  {etudiant.rang}
                                </span>
                              </td>
                              <td className="px-2 py-1 font-mono text-[10px] font-medium sticky left-0 bg-white z-10">
                                {etudiant.numero_matricule}
                              </td>
                              <td className="px-2 py-1 sticky left-[70px] bg-white z-10">
                                <div className="font-medium text-[11px]">{etudiant.nom}</div>
                                <div className="text-[9px] text-gray-500">{etudiant.prenom}</div>
                              </td>
                              <td className="px-2 py-1 text-[10px]">{etudiant.filiere}</td>
                              <td className="px-2 py-1">
                                <span className="px-1 py-0.5 bg-gray-100 rounded text-[9px]">{formatNiveau(etudiant.id_niveau)}</span>
                              </td>
                              {matieres.map((matiere, mIdx) => {
                                const note = etudiant.notes?.[matiere.nom_matiere];
                                const noteValue = note !== null && note !== undefined ? parseFloat(note) : null;
                                return (
                                  <td key={mIdx} className="px-2 py-1 text-center">
                                    {noteValue !== null ? (
                                      <span className={`font-semibold text-[10px] ${noteValue >= 10 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {noteValue.toFixed(1)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-300">-</span>
                                    )}
                                  </td>
                                );
                              })}
                              <td className="px-2 py-1 text-center text-[10px] font-semibold">{etudiant.totalPoints.toFixed(1)}</td>
                              <td className="px-2 py-1 text-center">
                                <span className={`px-1 py-0.5 rounded text-[9px] font-semibold ${etudiant.moyenne >= 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  {etudiant.moyenne.toFixed(1)}
                                </span>
                              </td>
                              <td className="px-2 py-1 text-center">
                                <button
                                  onClick={() => {
                                    if (matieres.length > 0) {
                                      const firstMatiere = matieres[0];
                                      const firstNote = etudiant.notes?.[firstMatiere.nom_matiere];
                                      handleEdit(etudiant, firstMatiere, firstNote, null);
                                    }
                                  }}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-all hover:scale-110"
                                  title="Modifier"
                                >
                                  <Pencil size={11} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {showStatsModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 animate-fade-in">
                <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={18} />
                      <h2 className="text-sm font-semibold">Statistiques détaillées</h2>
                    </div>
                    <button onClick={() => setShowStatsModal(false)} className="p-1 hover:bg-white/20 rounded transition-all">
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="p-4 overflow-y-auto max-h-[calc(85vh-60px)]">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3">
                        <p className="text-[9px] text-emerald-600 uppercase">Moyenne générale</p>
                        <p className="text-xl font-bold text-emerald-700">{statsAvancees.moyenneGenerale.toFixed(2)}/20</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                        <p className="text-[9px] text-blue-600 uppercase">Taux de réussite</p>
                        <p className="text-xl font-bold text-blue-700">{statsAvancees.tauxReussite.toFixed(1)}%</p>
                      </div>
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3">
                        <p className="text-[9px] text-amber-600 uppercase">Taux de mentions</p>
                        <p className="text-xl font-bold text-amber-700">{statsAvancees.tauxMentions.toFixed(1)}%</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                        <p className="text-[9px] text-purple-600 uppercase">Total étudiants</p>
                        <p className="text-xl font-bold text-purple-700">{stats.totalEtudiants}</p>
                      </div>
                    </div>

                    {studentsWithRanks.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-xs font-bold text-gray-700 mb-3">🏆 Classement (Top 3)</h3>
                        <div className="space-y-2">
                          {studentsWithRanks.slice(0, 3).map((student, idx) => (
                            <div key={idx} className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-2 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-amber-600">#{student.rang}</span>
                                <div>
                                  <p className="font-semibold text-xs">{student.nom} {student.prenom}</p>
                                  <p className="text-[9px] text-gray-500">{student.numero_matricule}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-emerald-600">{student.moyenne.toFixed(2)}</p>
                                <p className="text-[9px] text-gray-500">/20</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <h3 className="text-xs font-bold text-gray-700 mb-3">📊 Performance par matière</h3>
                      <div className="space-y-2">
                        {Object.entries(statsAvancees.statsMatieres).map(([matiere, stat]) => (
                          <div key={matiere} className="bg-gray-50 rounded-lg p-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[11px] font-semibold text-gray-700">{matiere}</span>
                              <span className="text-[10px] text-gray-500">Moyenne: {stat.moyenne.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${(stat.moyenne / 20) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-1 text-[9px] text-gray-500">
                              <span>Meilleure: {stat.meilleure.toFixed(2)}</span>
                              <span>Taux réussite: {stat.tauxReussite.toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t p-3 flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                    <button onClick={exportToPDF} className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all flex items-center gap-1">
                      <FileText size={12} /> Exporter PDF
                    </button>
                    <button onClick={() => setShowStatsModal(false)} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 transition-all">
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showForm && (
              <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 ${formAnimating ? 'animate-fade-out' : 'animate-fade-in'}`}>
                <div className={`bg-white rounded-xl w-full max-w-sm shadow-xl ${formAnimating ? 'animate-scale-out' : 'animate-scale-in'}`}>
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2 rounded-t-xl flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <div className="p-0.5 bg-white/20 rounded-lg">
                        {editMode ? <Pencil size={12} /> : <Plus size={12} />}
                      </div>
                      <h2 className="text-sm font-semibold">{editMode ? "Modifier" : "Nouvelle"} saisie</h2>
                    </div>
                    <button onClick={resetForm} className="p-0.5 hover:bg-emerald-400 rounded transition-all">
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">Étudiant</label>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={11} />
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select
                        className="w-full mt-1.5 border border-gray-300 rounded-lg p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                        value={form.numero_matricule}
                        onChange={(e) => {
                          const selected = filteredEtudiants.find(et => et.numero_matricule === e.target.value);
                          if (selected) {
                            setForm({
                              ...form,
                              numero_matricule: selected.numero_matricule,
                              nom: selected.nom,
                              prenom: selected.prenom,
                            });
                          }
                        }}
                      >
                        <option value="">Sélectionner un étudiant</option>
                        {filteredEtudiants.length === 0 ? (
                          <option value="" disabled>Aucun étudiant trouvé</option>
                        ) : (
                          filteredEtudiants.map(e => (
                            <option key={e.numero_matricule} value={e.numero_matricule}>
                              {e.numero_matricule} - {e.nom} {e.prenom}
                            </option>
                          ))
                        )}
                      </select>
                      {filteredEtudiants.length === 0 && (
                        <p className="text-[9px] text-amber-600 mt-1">
                          ⚠️ Aucun étudiant trouvé pour {filters.filiere} - {filters.niveau}
                        </p>
                      )}
                    </div>

                    {form.numero_matricule && (
                      <div className="bg-emerald-50 rounded-lg p-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <p className="text-[8px] text-gray-500">Étudiant</p>
                            <p className="font-semibold text-[11px]">{form.nom} {form.prenom}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-500">Matricule</p>
                            <p className="font-mono text-[10px]">{form.numero_matricule}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-700 mb-1">Notes</label>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {matieres.length === 0 ? (
                          <p className="text-center text-[10px] text-gray-500 py-4">
                            Aucune matière trouvée pour cette filière et niveau
                          </p>
                        ) : (
                          matieres.map((matiere, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-2">
                              <label className="block text-[10px] font-medium text-gray-700 mb-0.5">
                                {matiere.nom_matiere}
                                <span className="text-gray-400 ml-1">(coeff {matiere.coefficient || 1})</span>
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="20"
                                className="w-full border border-gray-300 rounded-lg p-1.5 text-[11px] focus:ring-1 focus:ring-emerald-500 outline-none"
                                placeholder="0 - 20"
                                value={form.notes[matiere.id_matiere] || ""}
                                onChange={(e) => {
                                  setForm(prev => ({
                                    ...prev,
                                    notes: { ...prev.notes, [matiere.id_matiere]: e.target.value }
                                  }));
                                }}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button onClick={handleSubmitNotes} disabled={loading}
                        className="flex-1 bg-emerald-500 text-white py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-all hover:scale-105 disabled:opacity-50">
                        {loading ? "..." : (editMode ? "Modifier" : "Enregistrer")}
                      </button>
                      <button onClick={resetForm} className="flex-1 border border-gray-300 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all hover:scale-105">
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <DeliberationTab />
        )}
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
        .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-slide-right { animation: slideRight 0.2s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-fade-out { animation: fadeOut 0.15s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
        .animate-scale-out { animation: scaleOut 0.15s ease-out forwards; }
        
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px; }
      `}</style>
    </div>
  );
}