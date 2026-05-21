import { useEffect, useState, useCallback } from "react";
import {
  Users, UserCheck, Calendar, Briefcase, TrendingUp, TrendingDown,
  CheckCircle, Clock, Award, AlertCircle, PieChart, BarChart3,
  Activity, CreditCard, BookOpen, Shield, Edit, Trash2, Plus
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { getDashboardComplet } from "../api/Dashboard";
import { getAnnees } from "../api/AnneeScolaire";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
    teal: "from-teal-500 to-teal-600",
    pink: "from-pink-500 to-pink-600",
    yellow: "from-yellow-500 to-yellow-600",
    emerald: "from-emerald-500 to-emerald-600",
    cyan: "from-cyan-500 to-cyan-600"
  };

  const bgColor = colors[color] || colors.blue;
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500";

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgColor} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${bgColor} shadow-lg`}>
            <Icon className="text-white" size={20} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${trendColor}`}>
              {trend === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{trendValue}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{title}</h3>
        <p className="text-xl sm:text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const ChartCard = ({ title, children, icon: Icon }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="p-1.5 sm:p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
          <Icon className="text-white" size={16} />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="h-64 sm:h-80">
        {children}
      </div>
    </div>
  );
};

const AnneeScolaireTable = ({ annees, onEdit, onDelete, onAdd }) => {
  return (
    <div className="mt-6 sm:mt-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
            <Calendar className="text-white" size={20} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">
            Gestion des années scolaires
          </h3>
        </div>
        
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm"
        >
          <Plus size={16} />
          Nouvelle année
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Année scolaire</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date début</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date fin</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {annees && annees.length > 0 ? (
              annees.map((annee) => (
                <tr key={annee.id_annee} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600">{annee.id_annee}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{annee.libelle}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{annee.date_debut || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{annee.date_fin || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      annee.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {annee.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onEdit(annee)}
                        className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(annee.id_annee)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  <Calendar className="mx-auto mb-2 text-gray-400" size={32} />
                  <p>Aucune année scolaire disponible</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anneesScolaires, setAnneesScolaires] = useState([]);
  const [dataFetched, setDataFetched] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (dataFetched) return;
    
    setLoading(true);
    try {
      // Récupérer les stats du dashboard
      const result = await getDashboardComplet();
      console.log("Données API chargées:", result);
      
      // Récupérer les années scolaires
      const anneesResult = await getAnnees();
      console.log("Années scolaires:", anneesResult);
      
      if (result) {
        setData(result);
        setAnneesScolaires(Array.isArray(anneesResult) ? anneesResult : []);
        setDataFetched(true);
      } else {
        setError("Impossible de charger les données");
      }
    } catch (err) {
      console.error("Erreur API:", err);
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [dataFetched]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleAddAnnee = () => {
    console.log("Ajouter une année scolaire");
  };

  const handleEditAnnee = (annee) => {
    console.log("Modifier l'année:", annee);
  };

  const handleDeleteAnnee = (id) => {
    console.log("Supprimer l'année:", id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error || "Erreur de chargement"}</p>
          <button 
            onClick={() => {
              setDataFetched(false);
              fetchDashboard();
            }} 
            className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm sm:text-base"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const etudiants = data.etudiants || {};
  const paiements = data.paiements || {};
  const presence = data.presence || {};
  const examens = data.examens || {};
  const suivi = data.suivi || {};
  const niveaux = data.repartition_niveaux || [];
  const filieres = data.repartition_filieres || [];
  const evolution = data.evolution_mensuelle || [];

  const barChartData = {
    labels: niveaux.map(n => n.niveau),
    datasets: [{ label: "Nombre d'étudiants", data: niveaux.map(n => n.nombre_etudiants), backgroundColor: ['rgba(99, 102, 241, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(168, 85, 247, 0.8)'], borderRadius: 10 }]
  };

  const doughnutData = {
    labels: filieres.map(f => f.filiere),
    datasets: [{ data: filieres.map(f => f.nombre_etudiants), backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb7185', '#f97316'], borderWidth: 0 }]
  };

  const paiementsData = {
    labels: ['Payés', 'Impayés', 'Partiels'],
    datasets: [{ data: [paiements.paiements_payes || 0, paiements.paiements_impayes || 0, paiements.paiements_partiels || 0], backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], borderWidth: 0 }]
  };

  const presenceData = {
    labels: ['Absences', 'Retards'],
    datasets: [{ data: [presence.total_absences || 0, presence.total_retards || 0], backgroundColor: ['#ef4444', '#f59e0b'], borderWidth: 0 }]
  };

  const suiviData = {
    labels: ['CDI', 'CDD', 'Stage', 'Essai', 'Auto-emploi', 'Sous emploi'],
    datasets: [{ label: "Nombre d'étudiants", data: [suivi.cdi || 0, suivi.cdd || 0, suivi.stages || 0, suivi.essais || 0, suivi.auto_emploi || 0, suivi.sous_emploi || 0], backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444'], borderRadius: 10 }]
  };

  const evolutionData = {
    labels: evolution.map(e => `${e.mois_nom} ${e.annee}`),
    datasets: [{ label: "Inscriptions", data: evolution.map(e => e.inscriptions), fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: '#6366f1', borderWidth: 2, tension: 0.4, pointBackgroundColor: '#6366f1', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 3, pointHoverRadius: 5 }]
  };

  const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 10 } } }, tooltip: { backgroundColor: '#1f2937' } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } } };
  const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 10 } } }, tooltip: { backgroundColor: '#1f2937' } }, scales: { y: { beginAtZero: true, grid: { color: '#e5e7eb' } }, x: { grid: { display: false } } } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                <Activity className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Tableau de Bord
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Aperçu global de la gestion scolaire
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard title="Total Étudiants" value={etudiants.total_etudiants || 0} icon={Users} color="blue" trend="up" trendValue={12} />
          <StatCard title="Étudiants Actifs" value={etudiants.etudiants_actifs || 0} icon={UserCheck} color="green" />
          <StatCard title="Filles / Garçons" value={`${etudiants.total_filles || 0} / ${etudiants.total_garcons || 0}`} icon={Users} color="purple" />
          <StatCard title="Taux d'insertion" value={`${suivi.taux_insertion || 0}%`} icon={TrendingUp} color="emerald" trend="up" trendValue={5} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard title="Taux recouvrement" value={paiements.taux_recouvrement || "0%"} icon={CreditCard} color="teal" />
          <StatCard title="Moyenne générale" value={examens.moyenne_generale || "0"} icon={BookOpen} color="orange" />
          <StatCard title="Taux réussite" value={examens.taux_reussite || "0%"} icon={Award} color="yellow" trend="up" trendValue={8} />
          <StatCard title="Total suivis" value={suivi.total_suivis || 0} icon={Briefcase} color="pink" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ChartCard title="Répartition par niveau" icon={BarChart3}>
            <Bar data={barChartData} options={barOptions} />
          </ChartCard>
          <ChartCard title="Répartition par filière" icon={PieChart}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ChartCard title="État des paiements" icon={CreditCard}>
            <Doughnut data={paiementsData} options={doughnutOptions} />
          </ChartCard>
          <ChartCard title="Présence (Absences vs Retards)" icon={Clock}>
            <Doughnut data={presenceData} options={doughnutOptions} />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ChartCard title="Suivi professionnel" icon={Briefcase}>
            <Bar data={suiviData} options={barOptions} />
          </ChartCard>
          <ChartCard title="Évolution des inscriptions" icon={Activity}>
            <Line data={evolutionData} options={lineOptions} />
          </ChartCard>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <p className="text-white/80 text-xs sm:text-sm">Année scolaire active</p>
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  {data.annee_courante?.libelle || "Non définie"}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-xs sm:text-sm">En cours</span>
            </div>
          </div>
        </div>

        <AnneeScolaireTable 
          annees={anneesScolaires}
          onAdd={handleAddAnnee}
          onEdit={handleEditAnnee}
          onDelete={handleDeleteAnnee}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <CheckCircle size={24} className="opacity-80" />
              <span className="text-2xl sm:text-3xl font-bold">{paiements.taux_recouvrement || "0%"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold">Taux de recouvrement</h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1">Paiements effectués</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Users size={24} className="opacity-80" />
              <span className="text-2xl sm:text-3xl font-bold">{suivi.taux_insertion || "0"}%</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold">Taux d'insertion</h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1">Anciens élèves en emploi</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <Clock size={24} className="opacity-80" />
              <span className="text-2xl sm:text-3xl font-bold">{presence.taux_assiduite || "0"}%</span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold">Taux d'assiduité</h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1">Présence régulière</p>
          </div>
        </div>
      </div>
    </div>
  );
}