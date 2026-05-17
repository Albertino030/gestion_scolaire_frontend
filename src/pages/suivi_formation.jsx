import { useEffect, useState, useRef } from "react";
import {
  Search, Plus, X, Briefcase, TrendingUp, Users, RotateCcw, Edit,
  Trash2, CheckCircle, Clock, Award, AlertCircle, LayoutGrid, List,
  Filter, ChevronDown, Download, Eye, ChevronLeft, ChevronRight,
  Sparkles, GraduationCap, Calendar, Building, DollarSign, Phone, MessageSquare,
  Shield, Zap, Trash, UserSearch, AlertTriangle
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://127.0.0.1:8000";

const api = {
  get: async (endpoint) => {
    try {
      const res = await axios.get(`${API_URL}${endpoint}`);
      return res.data;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  post: async (endpoint, data) => {
    const res = await axios.post(`${API_URL}${endpoint}`, data);
    return res.data;
  },
  put: async (endpoint, data) => {
    const res = await axios.put(`${API_URL}${endpoint}`, data);
    return res.data;
  },
  delete: async (endpoint) => {
    const res = await axios.delete(`${API_URL}${endpoint}`);
    return res.data;
  }
};

const typesSuivi = ["Stage", "Essai", "CDD", "CDI", "Auto-emploi", "Sous emploi", "Non renseigne"];

// Composant pour afficher le statut avec badge
const BadgeStatus = ({ type }) => {
  const colors = {
    CDI: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg",
    CDD: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg",
    Stage: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg",
    Essai: "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg",
    "Auto-emploi": "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg",
    "Sous emploi": "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg",
  };
  const colorClass = colors[type] || "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
  if (!type || type === "Non renseigne") {
    return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-500">Non renseigné</span>;
  }
  return (
    <motion.span 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`px-3 py-1 rounded-full text-xs font-medium shadow-md ${colorClass}`}
    >
      {type}
    </motion.span>
  );
};

// Carte de statistiques
const StatCard = ({ icon: Icon, label, value, color, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`bg-white rounded-2xl border border-${color}-100 p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative group`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-100 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
      </div>
    </motion.div>
  );
};

// Modal d'alerte - Veuillez sélectionner un étudiant
const AlertNoStudentModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertTriangle size={22} />
                <h2 className="font-bold text-lg">Attention</h2>
              </div>
              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-all">
                <X size={20} />
              </motion.button>
            </div>
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <UserSearch size={32} className="text-amber-500" />
                </div>
              </div>
              <p className="text-gray-700 font-medium text-lg mb-2">Aucun étudiant sélectionné</p>
              <p className="text-sm text-gray-500 mb-6">
                Veuillez rechercher et sélectionner un étudiant avant d'ajouter un suivi.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg"
              >
                OK
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal d'alerte - Étudiant non trouvé
const AlertStudentNotFoundModal = ({ isOpen, onClose, searchValue }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertCircle size={22} />
                <h2 className="font-bold text-lg">Étudiant non trouvé</h2>
              </div>
              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-all">
                <X size={20} />
              </motion.button>
            </div>
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <UserSearch size={32} className="text-red-500" />
                </div>
              </div>
              <p className="text-gray-700 font-medium text-lg mb-2">Aucun étudiant trouvé</p>
              <p className="text-sm text-gray-500 mb-2">
                Aucun étudiant ne correspond au matricule :
              </p>
              <p className="text-lg font-mono font-bold text-red-600 mb-6">{searchValue}</p>
              <p className="text-xs text-gray-400 mb-6">
                Vérifiez le matricule ou ajoutez l'étudiant d'abord.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg"
              >
                OK
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal de succès
const SuccessModal = ({ isOpen, onClose, message, actionType }) => {
  const getIconColor = () => {
    switch(actionType) {
      case "add": return "text-green-500";
      case "edit": return "text-blue-500";
      case "delete": return "text-red-500";
      default: return "text-green-500";
    }
  };
  
  const getBgGradient = () => {
    switch(actionType) {
      case "add": return "from-green-500 to-green-600";
      case "edit": return "from-blue-500 to-blue-600";
      case "delete": return "from-red-500 to-red-600";
      default: return "from-green-500 to-green-600";
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${getBgGradient()} text-white px-6 py-4 flex justify-between items-center`}>
              <div className="flex items-center gap-2">
                <CheckCircle size={22} />
                <h2 className="font-bold text-lg">Succès !</h2>
              </div>
              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-all">
                <X size={20} />
              </motion.button>
            </div>
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className={`flex justify-center mb-4`}
              >
                <div className={`p-3 rounded-full bg-opacity-20 ${actionType === "add" ? "bg-green-100" : actionType === "edit" ? "bg-blue-100" : "bg-red-100"}`}>
                  <CheckCircle size={48} className={getIconColor()} />
                </div>
              </motion.div>
              <p className="text-gray-700 font-medium text-lg mb-4">{message}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className={`px-6 py-2.5 text-sm bg-gradient-to-r ${getBgGradient()} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all`}
              >
                OK
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal de confirmation de suppression
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <AlertCircle size={22} />
                <h2 className="font-bold text-lg">Confirmation de suppression</h2>
              </div>
              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-all">
                <X size={20} />
              </motion.button>
            </div>
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 size={32} className="text-red-500" />
                </div>
              </div>
              <p className="text-gray-700 font-medium mb-2">Êtes-vous sûr de vouloir supprimer ce suivi ?</p>
              <p className="text-sm text-gray-500 mb-6">{itemName}</p>
              <p className="text-xs text-gray-400 mb-6">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Supprimer
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal d'ajout
const ModalAjout = ({ isOpen, onClose, onSave, anneeActive, showSuccessModal, showNoStudentAlert, showStudentNotFoundAlert }) => {
  const [matricule, setMatricule] = useState("");
  const [anneeSuivi, setAnneeSuivi] = useState(1);
  const [typeSuivi, setTypeSuivi] = useState("Non renseigne");
  const [employeur, setEmployeur] = useState("");
  const [poste, setPoste] = useState("");
  const [salaire, setSalaire] = useState("");
  const [contact, setContact] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [etudiantInfo, setEtudiantInfo] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [etudiants, setEtudiants] = useState([]);
  const [anneesSortie, setAnneesSortie] = useState([]);

  useEffect(() => {
    if (isOpen) {
      chargerEtudiantsSortants();
      chargerAnneesSortie();
    }
  }, [isOpen]);

  const chargerAnneesSortie = async () => {
    const data = await api.get("/suivi/annees-sortie");
    setAnneesSortie(data || []);
  };

  const chargerEtudiantsSortants = async () => {
    const data = await api.get("/suivi/etudiants-sortants");
    setEtudiants(data || []);
  };

  const rechercherEtudiant = () => {
    const etudiant = etudiants.find(e => e.numero_matricule === recherche);
    if (etudiant) {
      setEtudiantInfo(etudiant);
      setMatricule(etudiant.numero_matricule);
    } else {
      showStudentNotFoundAlert(recherche);
      setEtudiantInfo(null);
      setMatricule("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!etudiantInfo) {
      showNoStudentAlert();
      return;
    }

    setLoading(true);
    try {
      const data = {
        numero_matricule: matricule,
        id_annee_sortie: etudiantInfo.annee_sortie_id,
        annee_suivi: anneeSuivi,
        type_suivi: typeSuivi,
        employeur: employeur || null,
        poste_occupe: poste || null,
        salaire: salaire ? parseFloat(salaire) : null,
        contact_employeur: contact || null,
        commentaire: commentaire || null
      };
      await api.post("/suivi/", data);
      
      const studentName = `${etudiantInfo.nom} ${etudiantInfo.prenom}`;
      showSuccessModal(`Suivi ajouté avec succès pour ${studentName}`, "add");
      
      onSave();
      onClose();
      resetForm();
    } catch (err) {
      alert("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMatricule("");
    setAnneeSuivi(1);
    setTypeSuivi("Non renseigne");
    setEmployeur("");
    setPoste("");
    setSalaire("");
    setContact("");
    setCommentaire("");
    setEtudiantInfo(null);
    setRecherche("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto shadow-2xl"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <h2 className="font-bold text-lg">Ajouter un suivi</h2>
              </div>
              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-all"><X size={20} /></motion.button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Numéro matricule"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value.toUpperCase())}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" onClick={rechercherEtudiant} className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-lg">Rechercher</motion.button>
                </div>
                {etudiantInfo && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 bg-white rounded-xl">
                    <p className="font-semibold text-gray-800">{etudiantInfo.nom} {etudiantInfo.prenom}</p>
                    <p className="text-xs text-gray-500">Filière: {etudiantInfo.filiere}</p>
                    <p className="text-xs text-indigo-600 mt-1">Année de sortie: {etudiantInfo.annee_sortie_libelle}</p>
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Année de suivi (1-5)</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(a => (
                    <motion.button
                      key={a}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setAnneeSuivi(a)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${anneeSuivi === a ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Année {a}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de suivi</label>
                <select value={typeSuivi} onChange={e => setTypeSuivi(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  {typesSuivi.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employeur</label>
                <input value={employeur} onChange={e => setEmployeur(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Nom de l'entreprise" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poste occupé</label>
                <input value={poste} onChange={e => setPoste(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Poste" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salaire (Ar)</label>
                <input type="number" value={salaire} onChange={e => setSalaire(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Montant" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact employeur</label>
                <input value={contact} onChange={e => setContact(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Téléphone / Email" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all">Annuler</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 transition-all">
                  {loading ? "..." : "Enregistrer"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal d'édition
const ModalEdit = ({ isOpen, onClose, onSave, suivi, showSuccessModal }) => {
  const [typeSuivi, setTypeSuivi] = useState("Non renseigne");
  const [anneeSuivi, setAnneeSuivi] = useState(1);
  const [employeur, setEmployeur] = useState("");
  const [poste, setPoste] = useState("");
  const [salaire, setSalaire] = useState("");
  const [contact, setContact] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (suivi) {
      setTypeSuivi(suivi.type_suivi || "Non renseigne");
      setAnneeSuivi(suivi.annee_suivi || 1);
      setEmployeur(suivi.employeur || "");
      setPoste(suivi.poste_occupe || "");
      setSalaire(suivi.salaire || "");
      setContact(suivi.contact_employeur || "");
      setCommentaire(suivi.commentaire || "");
    }
  }, [suivi]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suivi) return;

    setLoading(true);
    try {
      const data = {
        type_suivi: typeSuivi,
        employeur: employeur || null,
        poste_occupe: poste || null,
        salaire: salaire ? parseFloat(salaire) : null,
        contact_employeur: contact || null,
        commentaire: commentaire || null
      };
      await api.put(`/suivi/${suivi.numero_matricule}/${suivi.id_annee_sortie}/${anneeSuivi}`, data);
      
      const studentName = `${suivi.nom} ${suivi.prenom}`;
      showSuccessModal(`Suivi modifié avec succès pour ${studentName}`, "edit");
      
      onSave();
      onClose();
    } catch (err) {
      alert("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto shadow-2xl"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Edit size={20} />
                <h2 className="font-bold text-lg">Modifier le suivi</h2>
              </div>
              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-all"><X size={20} /></motion.button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800">{suivi?.nom} {suivi?.prenom}</p>
                <p className="text-xs text-gray-500">Matricule: {suivi?.numero_matricule} | {suivi?.filiere}</p>
                <p className="text-xs text-amber-600 mt-1">Année de sortie: {suivi?.annee_sortie}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Année de suivi</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(a => (
                    <motion.button
                      key={a}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setAnneeSuivi(a)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${anneeSuivi === a ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Année {a}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de suivi</label>
                <select value={typeSuivi} onChange={e => setTypeSuivi(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all">
                  {typesSuivi.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employeur</label>
                <input value={employeur} onChange={e => setEmployeur(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poste occupé</label>
                <input value={poste} onChange={e => setPoste(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salaire (Ar)</label>
                <input type="number" value={salaire} onChange={e => setSalaire(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact employeur</label>
                <input value={contact} onChange={e => setContact(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" />
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all">Annuler</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg disabled:opacity-50 transition-all">
                  {loading ? "..." : "Modifier"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Composant principal
export default function SuiviFormation() {
  const [data, setData] = useState([]);
  const [tableau5ans, setTableau5ans] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [anneeActive, setAnneeActive] = useState(null);
  const [anneeFiltre, setAnneeFiltre] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modalAjoutOpen, setModalAjoutOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("liste");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  
  // États pour les modales
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successActionType, setSuccessActionType] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showNoStudentAlert, setShowNoStudentAlert] = useState(false);
  const [showStudentNotFoundAlert, setShowStudentNotFoundAlert] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Fonctions pour afficher les alertes
  const showNoStudentAlertModal = () => {
    setShowNoStudentAlert(true);
    setTimeout(() => setShowNoStudentAlert(false), 3000);
  };

  const showStudentNotFoundAlertModal = (matricule) => {
    setSearchValue(matricule);
    setShowStudentNotFoundAlert(true);
    setTimeout(() => setShowStudentNotFoundAlert(false), 3000);
  };

  // Fonction pour afficher la modale de succès
  const showSuccessModal = (message, actionType) => {
    setSuccessMessage(message);
    setSuccessActionType(actionType);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Fonction pour calculer l'année de sortie et vérifier si +5 ans
  const estPlusDe5Ans = (anneeSortie) => {
    if (!anneeSortie) return false;
    const match = anneeSortie.match(/(\d{4})/g);
    if (!match) return false;
    const anneeFin = parseInt(match[match.length - 1]);
    const anneeActuelle = new Date().getFullYear();
    return (anneeActuelle - anneeFin) > 5;
  };

  // Fonction pour supprimer les suivis de plus de 5 ans
  const supprimerSuivisDepasses = async (suivis) => {
    const suivisASupprimer = suivis.filter(suivi => estPlusDe5Ans(suivi.annee_sortie));
    if (suivisASupprimer.length > 0) {
      console.log(`${suivisASupprimer.length} suivis à supprimer (plus de 5 ans)`);
      for (const suivi of suivisASupprimer) {
        try {
          await api.delete(`/suivi/${suivi.id}`);
          console.log(`Suivi supprimé pour ${suivi.nom} ${suivi.prenom}`);
        } catch (error) {
          console.error(`Erreur suppression suivi ${suivi.id}:`, error);
        }
      }
      if (suivisASupprimer.length > 0) {
        showSuccessModal(`${suivisASupprimer.length} suivi(s) de plus de 5 ans ont été supprimés automatiquement`, "info");
      }
    }
  };

  // Charger l'année scolaire active
  const fetchAnneeActive = async () => {
    try {
      const res = await api.get("/annees/active");
      setAnneeActive(res);
      return res;
    } catch (error) {
      console.error("Erreur chargement année active:", error);
      return null;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const active = await fetchAnneeActive();
      const idAnnee = active?.id_annee;
      
      const [suivis, tableau, anneesData] = await Promise.all([
        api.get("/suivi/"),
        api.get("/suivi/tableau"),
        api.get("/suivi/annees-sortie")
      ]);
      
      const suivisData = suivis || [];
      const tableauData = tableau || [];
      
      await supprimerSuivisDepasses(suivisData);
      
      const [suivisApres, tableauApres] = await Promise.all([
        api.get("/suivi/"),
        api.get("/suivi/tableau")
      ]);
      
      setData(suivisApres || []);
      setTableau5ans(tableauApres || []);
      setAnnees(anneesData || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/suivi/${itemToDelete.id}`);
      const studentName = `${itemToDelete.nom} ${itemToDelete.prenom}`;
      showSuccessModal(`Suivi supprimé avec succès pour ${studentName}`, "delete");
      fetchData();
      setShowConfirmDelete(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const filteredListe = data.filter(item =>
    (!anneeFiltre || item.annee_sortie === anneeFiltre) &&
    (!typeFilter || item.type_suivi === typeFilter) &&
    (item.nom?.toLowerCase().includes(search.toLowerCase()) ||
     item.numero_matricule?.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredTableau = tableau5ans;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredListe.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredListe.length / itemsPerPage);

  const stats = {
    total: data.filter(d => !anneeFiltre || d.annee_sortie === anneeFiltre).length,
    cdi: data.filter(d => d.type_suivi === "CDI" && (!anneeFiltre || d.annee_sortie === anneeFiltre)).length,
    cdd: data.filter(d => d.type_suivi === "CDD" && (!anneeFiltre || d.annee_sortie === anneeFiltre)).length,
    stage: data.filter(d => d.type_suivi === "Stage" && (!anneeFiltre || d.annee_sortie === anneeFiltre)).length,
    auto: data.filter(d => d.type_suivi === "Auto-emploi" && (!anneeFiltre || d.annee_sortie === anneeFiltre)).length,
    insertion: filteredListe.length ? ((filteredListe.filter(d => ["CDI","CDD","Auto-emploi"].includes(d.type_suivi)).length / filteredListe.length) * 100).toFixed(0) : 0
  };

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"
      >
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg"
            >
              <GraduationCap className="text-white" size={24} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Suivi Après Formation</h1>
              <p className="text-sm text-gray-500">
                Suivi des anciens élèves sur 5 ans
                {anneeActive && <span className="ml-2 text-emerald-600">• Année scolaire: {anneeActive.libelle}</span>}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalAjoutOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={18} /> Ajouter un suivi
          </motion.button>
        </div>
      </motion.div>

      {/* Banner d'information */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-6 mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">
              🔄 Nettoyage automatique des données
            </p>
            <p className="text-xs text-gray-500">
              Les suivis de plus de 5 ans après la formation sont automatiquement supprimés pour optimiser la base de données.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-all flex items-center gap-1"
          >
            <RefreshIcon size={12} /> Vérifier
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 p-6">
        <StatCard icon={Users} label="Total suivis" value={stats.total} color="gray" delay={0.1} />
        <StatCard icon={CheckCircle} label="CDI" value={stats.cdi} color="green" delay={0.2} />
        <StatCard icon={Clock} label="CDD" value={stats.cdd} color="blue" delay={0.3} />
        <StatCard icon={Award} label="Auto-emploi" value={stats.auto} color="purple" delay={0.4} />
        <StatCard icon={Briefcase} label="Stage" value={stats.stage} color="orange" delay={0.5} />
        <StatCard icon={TrendingUp} label="Insertion" value={`${stats.insertion}%`} color="indigo" delay={0.6} />
      </div>

      {/* Filtres et Onglets */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg mx-6 mb-6"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Rechercher par nom ou matricule..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Filter size={16} /> Filtres
              <ChevronDown size={14} className={`transform transition-all duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-3 flex gap-3 flex-wrap animate-slide-down">
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select 
                  className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer" 
                  value={anneeFiltre} 
                  onChange={e => setAnneeFiltre(e.target.value)}
                >
                  <option value="">Années de sortie</option>
                  {annees.map(a => <option key={a.id_annee} value={a.libelle}>{a.libelle}</option>)}
                </select>
              </div>
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select 
                  className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer" 
                  value={typeFilter} 
                  onChange={e => setTypeFilter(e.target.value)}
                >
                  <option value="">Types de suivi</option>
                  {typesSuivi.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              {(search || anneeFiltre || typeFilter) && (
                <button 
                  onClick={() => { setSearch(""); setAnneeFiltre(""); setTypeFilter(""); }}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 text-red-500"
                >
                  <RotateCcw size={14} /> Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="flex gap-2 p-4 border-b border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("liste")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "liste" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <List size={16} /> Liste détaillée
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("tableau")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === "tableau" ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <LayoutGrid size={16} /> Tableau 5 ans
          </motion.button>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="px-6 pb-6">
        <AnimatePresence mode="wait">
          {activeTab === "liste" ? (
            <motion.div
              key="liste"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Année sortie</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Matricule</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Étudiant</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Filière</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Année suivi</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Situation</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employeur</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.length === 0 ? (
                      <tr className="animate-fade-in">
                        <td colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Users size={48} className="text-gray-300" />
                            <p className="text-gray-400 font-medium">Aucun suivi trouvé</p>
                            <p className="text-gray-400 text-sm">Ajoutez un suivi pour commencer</p>
                          </div>
                         </td>
                      </tr>
                    ) : (
                      currentItems.map((item, idx) => {
                        const isDepasse = estPlusDe5Ans(item.annee_sortie);
                        return (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`hover:bg-gray-50 transition-colors group ${isDepasse ? 'opacity-50 line-through' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-lg text-xs font-mono ${isDepasse ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                {item.annee_sortie}
                                {isDepasse && <span className="ml-1 text-[10px]">(expiré)</span>}
                              </span>
                             </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.numero_matricule}</td>
                            <td className="px-4 py-3"><div className="font-medium text-gray-800">{item.nom} {item.prenom}</div></td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.filiere || "-"}</td>
                            <td className="px-4 py-3 text-center"><span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">🎓 Année {item.annee_suivi}</span></td>
                            <td className="px-4 py-3 text-center"><BadgeStatus type={item.type_suivi} /></td>
                            <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{item.employeur || "-"}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex gap-1 justify-center">
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setSelected(item); setModalEditOpen(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"><Edit size={14} /></motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setItemToDelete(item); setShowConfirmDelete(true); }} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"><Trash2 size={14} /></motion.button>
                              </div>
                             </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredListe.length)} sur {filteredListe.length}
                  </div>
                  <div className="flex gap-1">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition-all"><ChevronLeft size={16} /></motion.button>
                    {[...Array(totalPages)].map((_, i) => (
                      <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(i+1)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === i+1 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'hover:bg-gray-200'}`}>{i+1}</motion.button>
                    ))}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-white transition-all"><ChevronRight size={16} /></motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="tableau"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Étudiant</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Filière</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Année 1</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Année 2</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Année 3</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Année 4</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Année 5</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTableau.length === 0 ? (
                      <tr className="animate-fade-in">
                        <td colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Users size={48} className="text-gray-300" />
                            <p className="text-gray-400 font-medium">Aucun ancien élève trouvé</p>
                          </div>
                         </td>
                      </tr>
                    ) : (
                      filteredTableau.map((etudiant, idx) => {
                        const isDepasse = estPlusDe5Ans(etudiant.annee_sortie_libelle);
                        return (
                          <motion.tr
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`hover:bg-gray-50 transition-colors group ${isDepasse ? 'opacity-50' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800">{etudiant.nom} {etudiant.prenom}</div>
                              <div className="text-xs text-gray-400 font-mono">{etudiant.numero_matricule}</div>
                              {isDepasse && (
                                <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                                  <Shield size={10} /> 5 ans
                                </span>
                              )}
                             </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{etudiant.filiere || "-"}</td>
                            {[1, 2, 3, 4, 5].map(an => (
                              <td key={an} className="px-4 py-3 text-center">
                                <BadgeStatus type={etudiant[`suivi_an${an}`]} />
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center">
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => {
                                const suiviExist = data.find(s => s.numero_matricule === etudiant.numero_matricule && s.annee_sortie === etudiant.annee_sortie_libelle);
                                if (suiviExist) { setSelected(suiviExist); setModalEditOpen(true); }
                                else alert("Aucun suivi trouvé pour cet étudiant");
                              }} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all">
                                <Edit size={14} />
                              </motion.button>
                             </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modales */}
      <ModalAjout 
        isOpen={modalAjoutOpen} 
        onClose={() => { setModalAjoutOpen(false); }} 
        onSave={fetchData} 
        anneeActive={anneeActive}
        showSuccessModal={showSuccessModal}
        showNoStudentAlert={showNoStudentAlertModal}
        showStudentNotFoundAlert={showStudentNotFoundAlertModal}
      />
      <ModalEdit 
        isOpen={modalEditOpen} 
        onClose={() => { setModalEditOpen(false); setSelected(null); }} 
        onSave={fetchData} 
        suivi={selected}
        showSuccessModal={showSuccessModal}
      />
      <SuccessModal 
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
        actionType={successActionType}
      />
      <ConfirmDeleteModal 
        isOpen={showConfirmDelete}
        onClose={() => { setShowConfirmDelete(false); setItemToDelete(null); }}
        onConfirm={handleDelete}
        itemName={itemToDelete ? `${itemToDelete.nom} ${itemToDelete.prenom}` : ""}
      />
      <AlertNoStudentModal 
        isOpen={showNoStudentAlert}
        onClose={() => setShowNoStudentAlert(false)}
      />
      <AlertStudentNotFoundModal 
        isOpen={showStudentNotFoundAlert}
        onClose={() => setShowStudentNotFoundAlert(false)}
        searchValue={searchValue}
      />

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-slide-right { animation: slideRight 0.2s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}

// Composant RefreshIcon
function RefreshIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}