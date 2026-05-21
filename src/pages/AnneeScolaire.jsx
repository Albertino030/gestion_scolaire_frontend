import { useEffect, useState } from "react"
import { 
  Search, Plus, X, Printer, Filter, ChevronDown, 
  Calendar, CreditCard, AlertCircle, CheckCircle,
  TrendingUp, DollarSign, Receipt, Users,
  RotateCcw, Zap, Shield, Star, Award, Edit, Trash2, HelpCircle
} from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';


export default function AnneeScolaire() {
  const [annees, setAnnees] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [selectedAnnee, setSelectedAnnee] = useState(null)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState("success")
  
  const [form, setForm] = useState({ libelle: "", date_debut: "", date_fin: "" })
  const [editForm, setEditForm] = useState({ libelle: "", date_debut: "", date_fin: "" })

  const [filterStats, setFilterStats] = useState({ total: 0, actives: 0, inactives: 0 })

  const fetchAnnees = async () => {
    setLoading(true)
    try {
      const res = await fetch("${API_URL}/annees/")
      const data = await res.json()
      setAnnees(data)
      updateStats(data)
    } catch (error) {
      showMessage("❌ Erreur de connexion au serveur", "error")
    } finally {
      setLoading(false)
    }
  }

  const updateStats = (data) => {
    setFilterStats({
      total: data.length,
      actives: data.filter(a => a.actif).length,
      inactives: data.filter(a => !a.actif).length
    })
  }

  useEffect(() => { fetchAnnees() }, [])

  const showMessage = (text, type = "success") => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(null), 3000)
  }

  const addAnnee = async (e) => {
    e.preventDefault()
    if (!form.libelle) { showMessage("⚠️ Le libellé est obligatoire", "error"); return }
    setLoading(true)
    try {
      await fetch("${API_URL}/annees/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, actif: false })
      })
      setForm({ libelle: "", date_debut: "", date_fin: "" })
      showMessage("✅ Année ajoutée avec succès", "success")
      setShowForm(false)
      await fetchAnnees()
    } catch (error) {
      showMessage("❌ Erreur lors de l'ajout", "error")
    } finally {
      setLoading(false)
    }
  }

  const openActivateModal = (annee) => {
    setSelectedAnnee(annee)
    setShowActivateModal(true)
  }

  const confirmActivation = async () => {
    setLoading(true)
    try {
      await fetch(`${API_URL}/annees/activer/${selectedAnnee.id_annee}`, { method: "PUT" })
      showMessage(`✨ Année "${selectedAnnee.libelle}" activée avec succès`, "success")
      setShowActivateModal(false)
      setSelectedAnnee(null)
      await fetchAnnees()
    } catch (error) {
      showMessage("❌ Erreur lors de l'activation", "error")
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (annee) => {
    if (annee?.actif) {
      showMessage("⚠️ Impossible de supprimer l'année active", "error")
      return
    }
    setSelectedAnnee(annee)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    setLoading(true)
    try {
      await fetch(`${API_URL}/annees/${selectedAnnee.id_annee}`, { method: "DELETE" })
      showMessage(`🗑️ Année "${selectedAnnee.libelle}" supprimée`, "success")
      setShowDeleteModal(false)
      setSelectedAnnee(null)
      await fetchAnnees()
    } catch (error) {
      showMessage("❌ Erreur lors de la suppression", "error")
    } finally {
      setLoading(false)
    }
  }

  const openEditModal = (annee) => {
    setSelectedAnnee(annee)
    setEditForm({ libelle: annee.libelle, date_debut: annee.date_debut || "", date_fin: annee.date_fin || "" })
    setShowEditModal(true)
  }

  const confirmEdit = async () => {
    if (!editForm.libelle) {
      showMessage("⚠️ Le libellé est obligatoire", "error")
      return
    }
    setLoading(true)
    try {
      await fetch(`${API_URL}/annees/${selectedAnnee.id_annee}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
      showMessage(`✏️ Année "${selectedAnnee.libelle}" modifiée avec succès`, "success")
      setShowEditModal(false)
      setSelectedAnnee(null)
      await fetchAnnees()
    } catch (error) {
      showMessage("❌ Erreur lors de la modification", "error")
    } finally {
      setLoading(false)
    }
  }

  const filteredAnnees = annees.filter(a =>
    a.libelle.toLowerCase().includes(search.toLowerCase())
  )

  const anneeActive = annees.find(a => a.actif)
  const tauxActivation = filterStats.total > 0 ? ((filterStats.actives / filterStats.total) * 100).toFixed(0) : 0

  return (
    <div className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Toast Message */}
      {message && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm ${
            messageType === "success" ? "bg-emerald-500 text-white" :
            messageType === "error" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
          }`}>
            {messageType === "success" && <CheckCircle size={14} />}
            {messageType === "error" && <AlertCircle size={14} />}
            <span className="text-xs font-medium">{message}</span>
          </div>
        </div>
      )}

      {/* Header compact */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex justify-between items-center flex-shrink-0 animate-slide-down">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Calendar className="text-white" size={16} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Années Scolaires</h1>
            {anneeActive && (
              <p className="text-[10px] text-green-600 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Active: {anneeActive.libelle}
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 transition-all duration-300 hover:scale-105"
        >
          <Plus size={12} /> Ajouter
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {/* Stats miniatures */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="bg-white rounded-lg border p-2 text-center hover:shadow-md transition-all hover:scale-105">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px]">
              <Calendar size={10}/> Total
            </div>
            <div className="text-base font-bold text-slate-800">{filterStats.total}</div>
          </div>
          <div className="bg-white rounded-lg border p-2 text-center hover:shadow-md transition-all hover:scale-105">
            <div className="flex items-center justify-center gap-1 text-green-600 text-[10px]">
              <CheckCircle size={10}/> Actives
            </div>
            <div className="text-base font-bold text-green-600">{filterStats.actives}</div>
          </div>
          <div className="bg-white rounded-lg border p-2 text-center hover:shadow-md transition-all hover:scale-105">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-[10px]">
              <ArchiveIcon size={10}/> Archivées
            </div>
            <div className="text-base font-bold text-slate-600">{filterStats.inactives}</div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 p-2 text-center hover:shadow-md transition-all hover:scale-105">
            <div className="flex items-center justify-center gap-1 text-emerald-600 text-[10px]">
              <TrendingUp size={10}/> Taux actif
            </div>
            <div className="text-base font-bold text-emerald-700">{tauxActivation}%</div>
          </div>
        </div>

        {/* Barre recherche */}
        <div className="bg-white rounded-lg border mb-3 animate-slide-up">
          <div className="p-2 flex gap-2 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" size={12}/>
              <input 
                className="w-full pl-7 pr-2 py-1.5 border rounded-lg text-xs" 
                placeholder="Rechercher une année scolaire..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className="px-2 py-1.5 border rounded-lg text-xs flex items-center gap-1 hover:bg-slate-50 transition-all justify-center sm:justify-start"
            >
              <Filter size={12}/> Filtres 
              <ChevronDown size={10} className={`transform transition-all duration-300 ${showFilters ? 'rotate-180' : ''}`}/>
            </button>
          </div>
          {showFilters && (
            <div className="p-2 border-t flex gap-2 flex-col sm:flex-row animate-slide-down">
              <button 
                onClick={() => setSearch("")}
                className="flex-1 px-2 py-1 border rounded text-xs bg-white hover:bg-slate-50 transition-all"
              >
                Effacer recherche
              </button>
            </div>
          )}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg border overflow-x-auto animate-fade-in-up">
          <div className="min-w-[600px] md:min-w-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                  <th className="px-3 py-1.5 text-left">Année scolaire</th>
                  <th className="px-3 py-1.5 text-left">Date début</th>
                  <th className="px-3 py-1.5 text-left">Date fin</th>
                  <th className="px-3 py-1.5 text-center">Statut</th>
                  <th className="px-3 py-1.5 text-center">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                        <span className="text-xs text-slate-500">Chargement...</span>
                      </div>
                    </td>
                   </tr>
                ) : filteredAnnees.length === 0 ? (
                  <tr className="animate-fade-in">
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                      Aucune année scolaire trouvée
                    </td>
                   </tr>
                ) : (
                  filteredAnnees.map((a, i) => (
                    <tr 
                      key={a.id_annee} 
                      className={`border-t hover:bg-slate-50 transition-all duration-300 animate-slide-right ${
                        a.actif ? "bg-emerald-50/30" : ""
                      }`} 
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-800">{a.libelle}</div>
                        {a.actif && (
                          <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={10} className="text-slate-400 flex-shrink-0" />
                          <span className="break-words">{a.date_debut || "—"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={10} className="text-slate-400 flex-shrink-0" />
                          <span className="break-words">{a.date_fin || "—"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        {a.actif ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-emerald-700 font-semibold text-[10px] uppercase whitespace-nowrap">Actif</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-full">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                            <span className="text-slate-500 text-[10px] uppercase whitespace-nowrap">Inactif</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center flex-wrap">
                          {!a.actif && (
                            <button 
                              onClick={() => openActivateModal(a)}
                              className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] hover:bg-emerald-100 transition-all hover:scale-105 flex items-center gap-0.5 whitespace-nowrap"
                              title="Activer"
                            >
                              <Zap size={10}/> Activer
                            </button>
                          )}
                          <button 
                            onClick={() => openEditModal(a)}
                            className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] hover:bg-blue-100 transition-all hover:scale-105 flex items-center gap-0.5 whitespace-nowrap"
                            title="Modifier"
                          >
                            <Edit size={10}/> Modifier
                          </button>
                          {!a.actif && (
                            <button 
                              onClick={() => openDeleteModal(a)}
                              className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[10px] hover:bg-red-100 transition-all hover:scale-105 flex items-center gap-0.5 whitespace-nowrap"
                              title="Supprimer"
                            >
                              <Trash2 size={10}/> Suppr
                            </button>
                          )}
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

      {/* MODALE AJOUT */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 animate-fade-in" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl w-full max-w-[95%] sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
              <div className="flex items-center gap-2">
                <Plus size={18}/>
                <span className="font-bold text-sm">Ajouter une année scolaire</span>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-blue-500 rounded-lg transition-all">
                <X size={16}/>
              </button>
            </div>
            
            <form onSubmit={addAnnee} className="overflow-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Libellé *</label>
                <input
                  type="text"
                  placeholder="Ex: 2025-2026"
                  value={form.libelle}
                  onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                  className="w-full border-2 border-slate-200 p-2.5 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Date début</label>
                <input
                  type="date"
                  value={form.date_debut}
                  onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                  className="w-full border-2 border-slate-200 p-2.5 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Date fin</label>
                <input
                  type="date"
                  value={form.date_fin}
                  onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                  className="w-full border-2 border-slate-200 p-2.5 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <HelpCircle size={14} className="mt-0.5 flex-shrink-0"/>
                  ℹ️ L'année sera ajoutée comme inactive. Vous pourrez l'activer plus tard.
                </p>
              </div>
            </form>
            
            <div className="border-t p-4 flex justify-end gap-2">
              <button 
                onClick={() => setShowForm(false)} 
                className="px-4 py-1.5 border rounded-lg text-xs hover:bg-slate-50 transition-all font-medium"
              >
                Annuler
              </button>
              <button 
                onClick={addAnnee} 
                disabled={loading} 
                className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition-all disabled:opacity-50 font-medium"
              >
                {loading ? "..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE MODIFICATION */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 animate-fade-in" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[95%] sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
              <div className="flex items-center gap-2">
                <Edit size={18}/>
                <span className="font-bold text-sm">Modifier l'année scolaire</span>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-amber-600 rounded-lg transition-all">
                <X size={16}/>
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Libellé *</label>
                <input 
                  type="text"
                  className="w-full border-2 border-slate-200 p-2.5 rounded-lg text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                  value={editForm.libelle}
                  onChange={(e) => setEditForm({ ...editForm, libelle: e.target.value })}
                  placeholder="Ex: 2025-2026"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Date de début</label>
                <input 
                  type="date"
                  className="w-full border-2 border-slate-200 p-2.5 rounded-lg text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                  value={editForm.date_debut}
                  onChange={(e) => setEditForm({ ...editForm, date_debut: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Date de fin</label>
                <input 
                  type="date"
                  className="w-full border-2 border-slate-200 p-2.5 rounded-lg text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all duration-200"
                  value={editForm.date_fin}
                  onChange={(e) => setEditForm({ ...editForm, date_fin: e.target.value })}
                />
              </div>

              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0"/>
                  ⚠️ La modification n'affectera pas les données liées à cette année.
                </p>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end gap-2">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-1.5 border rounded-lg text-xs hover:bg-slate-50 transition-all font-medium"
              >
                Annuler
              </button>
              <button 
                onClick={confirmEdit}
                disabled={loading}
                className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs hover:bg-amber-600 transition-all disabled:opacity-50 font-medium"
              >
                {loading ? "..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE ACTIVATION */}
      {showActivateModal && selectedAnnee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 animate-fade-in" onClick={() => setShowActivateModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[95%] sm:max-w-md shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
              <div className="flex items-center gap-2">
                <Zap size={18}/>
                <span className="font-bold text-sm">Activer une année scolaire</span>
              </div>
              <button onClick={() => setShowActivateModal(false)} className="p-1 hover:bg-emerald-600 rounded-lg transition-all">
                <X size={16}/>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Shield size={32} className="text-emerald-600"/>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-center text-slate-800 mb-2">
                Confirmer l'activation
              </h3>
              
              <p className="text-sm text-slate-600 text-center mb-4">
                Êtes-vous sûr de vouloir activer l'année <br/>
                <span className="font-bold text-emerald-600">"{selectedAnnee.libelle}"</span> ?
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0"/>
                  ⚠️ Attention : Toutes les autres années seront automatiquement désactivées.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowActivateModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-slate-50 transition-all font-medium"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmActivation}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {loading ? "..." : <><Zap size={14}/> Activer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE SUPPRESSION */}
      {showDeleteModal && selectedAnnee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 animate-fade-in" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[95%] sm:max-w-md shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
              <div className="flex items-center gap-2">
                <Trash2 size={18}/>
                <span className="font-bold text-sm">Supprimer une année scolaire</span>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="p-1 hover:bg-red-600 rounded-lg transition-all">
                <X size={16}/>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-600"/>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-center text-slate-800 mb-2">
                Confirmer la suppression
              </h3>
              
              <p className="text-sm text-slate-600 text-center mb-4">
                Êtes-vous sûr de vouloir supprimer l'année <br/>
                <span className="font-bold text-red-600">"{selectedAnnee.libelle}"</span> ?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0"/>
                  ⚠️ Attention : Cette action est irréversible. Toutes les données liées à cette année seront perdues.
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-slate-50 transition-all font-medium"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {loading ? "..." : <><Trash2 size={14}/> Supprimer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown { 
          from { opacity: 0; transform: translateY(-10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes slideRight { 
          from { opacity: 0; transform: translateX(-10px); } 
          to { opacity: 1; transform: translateX(0); } 
        }
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(10px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes scaleIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes pulse { 
          0%,100% { opacity: 1; } 
          50% { opacity: 0.5; } 
        }
        .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.3s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-slide-right { animation: slideRight 0.2s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; opacity: 0; animation-fill-mode: forwards; }
        .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
        .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
        
        @media (max-width: 640px) {
          .animate-slide-right {
            animation-duration: 0.15s;
          }
        }
      `}</style>
    </div>
  )
}

// Composant Archive
function ArchiveIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}