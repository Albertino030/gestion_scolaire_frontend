// 📁 src/components/AIAssistant.jsx
// Assistant IA complet pour l'application CFP Don Bosco

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Bot, X, Send, MessageCircle, Sparkles, 
  GraduationCap, Users, DollarSign, Calendar, 
  BookOpen, BarChart3, Settings, HelpCircle, 
  ChevronRight, Minimize2, Maximize2, 
  UserCheck, UserX, CreditCard, Clock, Award,
  FileText, Download, Printer, Filter, Plus,
  Trash2, Edit, Eye, Shield, AlertCircle, CheckCircle,
  TrendingUp, PieChart, Activity, Briefcase, School,
  Key, Mail, Lock, UserPlus, LogIn, Zap, RefreshCw,
  Star, MapPin, Phone, Menu, ArrowRight, ChevronLeft,
  ChevronDown, Search, XCircle, ThumbsUp, ThumbsDown,
  AlertTriangle, FileCheck, FileSpreadsheet
} from "lucide-react";

// ============================================================
// BASE DE CONNAISSANCES COMPLÈTE DE L'APPLICATION
// ============================================================

const KNOWLEDGE_BASE = {
  general: {
    name: "CFP Don Bosco - Système de Gestion Scolaire",
    version: "2.0",
    description: "Application complète de gestion du Centre de Formation Professionnelle Don Bosco",
    modules: [
      "Dashboard", "Étudiants", "Année Scolaire", "Paiements", 
      "Présences", "Examens / Notes", "Délibération", "Suivi Formation", 
      "Utilisateurs", "Exports PDF/CSV"
    ]
  },
  dashboard: {
    name: "Tableau de Bord",
    description: "Vue d'ensemble de toutes les statistiques de l'établissement",
    features: [
      "Cartes statistiques (total étudiants, actifs, filles/garçons)",
      "Taux d'insertion professionnelle",
      "Taux de recouvrement des paiements",
      "Moyenne générale et taux de réussite",
      "Graphiques interactifs (Chart.js)",
      "Répartition par niveau (diagramme à barres)",
      "Répartition par filière (diagramme circulaire)",
      "État des paiements (payés/impayés/partiels)",
      "Suivi des présences (absences vs retards)",
      "Suivi professionnel (CDI/CDD/Stage/Auto-emploi)",
      "Évolution des inscriptions (courbe)",
      "Année scolaire active en cours",
      "Gestion des années scolaires (admin uniquement)"
    ],
    charts: [
      "Répartition par niveau (barres)",
      "Répartition par filière (doughnut)",
      "État des paiements (doughnut)",
      "Présences (doughnut)",
      "Suivi professionnel (barres)",
      "Évolution inscriptions (ligne)"
    ]
  },
  etudiants: {
    name: "Gestion des Étudiants",
    description: "Gestion complète du dossier étudiant",
    features: [
      "Ajout d'un nouvel étudiant (formulaire complet 15+ champs)",
      "Modification des informations étudiant",
      "Suppression d'un étudiant",
      "Recherche par nom, prénom ou matricule",
      "Filtrage par filière et niveau",
      "Affichage des statistiques (total, garçons, filles)",
      "Export PDF personnalisé (tous, par filière, par niveau)",
      "Export CSV des données",
      "Visualisation des détails individuels",
      "Génération automatique du matricule",
      "Validation des champs obligatoires"
    ]
  },
  anneeScolaire: {
    name: "Gestion des Années Scolaires",
    description: "Configuration et gestion des années académiques",
    features: [
      "Ajout d'une nouvelle année scolaire",
      "Modification d'une année existante",
      "Suppression d'une année (hors année active)",
      "Activation d'une année (désactive automatiquement les autres)",
      "Dates de début et fin configurables"
    ]
  },
  paiements: {
    name: "Gestion des Paiements",
    description: "Suivi financier des étudiants",
    features: [
      "Génération automatique des paiements",
      "Modification du statut (payé/partiel/impayé)",
      "Montants personnalisables",
      "Frais fixes: Inscription (50k), Tablier (20k), Combinaison (30k), Tenue fête (30k)",
      "Écolage mensuel: 20k/mois (septembre à juin)",
      "Calcul automatique des totaux",
      "Recherche par nom/matricule",
      "Filtrage par filière et niveau",
      "Génération de reçu PDF personnalisé"
    ]
  },
  presence: {
    name: "Gestion des Présences",
    description: "Suivi de l'assiduité des étudiants",
    features: [
      "Enregistrement des absences et retards",
      "Motif optionnel",
      "Filtrage par filière, niveau et type",
      "Recherche par nom/matricule",
      "Export PDF et CSV"
    ]
  },
  examens: {
    name: "Gestion des Examens et Notes",
    description: "Saisie et suivi des notes d'examens",
    features: [
      "6 examens par année scolaire",
      "Saisie des notes par matière",
      "Calcul automatique des moyennes",
      "Classement automatique des étudiants",
      "Affichage des rangs avec badges",
      "Export PDF et CSV"
    ]
  },
  deliberation: {
    name: "Délibération et Passage",
    description: "Décision finale de fin d'année",
    features: [
      "Calcul automatique de la moyenne annuelle",
      "Formule avec coefficients",
      "Définition du seuil de délibération",
      "Décision: Passer / Redoubler / Renvoyer",
      "Export liste des admis"
    ]
  },
  suiviFormation: {
    name: "Suivi Après Formation",
    description: "Suivi des anciens élèves sur 5 ans",
    features: [
      "Suivi sur 5 ans après la formation",
      "Types: CDI, CDD, Stage, Essai, Auto-emploi, Sous emploi",
      "Tableau récapitulatif 5 ans",
      "Taux d'insertion professionnelle"
    ]
  },
  auth: {
    name: "Authentification et Utilisateurs",
    description: "Gestion des comptes utilisateurs",
    features: [
      "Connexion avec email et mot de passe",
      "Inscription des nouveaux utilisateurs",
      "Mot de passe oublié",
      "Réinitialisation du mot de passe",
      "Rôles: Administrateur et Utilisateur"
    ]
  },
  exports: {
    name: "Exports de Données",
    description: "Génération de rapports PDF et CSV",
    features: [
      "Export PDF liste étudiants",
      "Export PDF résultats d'examen",
      "Export PDF reçu de paiement",
      "Export PDF/CSV présence",
      "Export PDF liste des admis"
    ]
  }
};

const findAnswer = (question) => {
  const q = question.toLowerCase();
  
  const keywords = {
    dashboard: ["tableau de bord", "dashboard", "statistique", "graphique", "kpi"],
    etudiants: ["étudiant", "élève", "apprenant", "inscription", "matricule"],
    anneeScolaire: ["année scolaire", "année académique", "session"],
    paiements: ["paiement", "frais", "écolage", "inscription", "argent", "recette", "reçu"],
    presence: ["présence", "absence", "retard", "assiduité"],
    examens: ["examen", "note", "moyenne", "classement", "rang", "coefficient"],
    deliberation: ["délibération", "passage", "redoublement", "renvoi", "admis", "statut"],
    suiviFormation: ["suivi", "insertion", "emploi", "création", "stage", "cdi", "cdd"],
    auth: ["connexion", "inscription", "compte", "mot de passe", "login", "register"],
    exports: ["export", "pdf", "csv", "imprimer", "télécharger"]
  };

  let targetModule = null;
  for (const [module, words] of Object.entries(keywords)) {
    if (words.some(word => q.includes(word))) {
      targetModule = module;
      break;
    }
  }

  if (q.includes("comment") || q.includes("procédure") || q.includes("faire")) {
    if (q.includes("ajouter") && (q.includes("étudiant") || q.includes("élève"))) {
      return {
        answer: `📚 **Comment ajouter un étudiant ?**

1. Allez dans le menu "Étudiants"
2. Cliquez sur le bouton "Ajouter" (bleu avec une croix)
3. Remplissez le formulaire avec les informations
4. Cliquez sur "Enregistrer"

✅ L'étudiant sera automatiquement ajouté à la base de données.`,
        suggestions: ["Comment modifier un étudiant ?", "Comment exporter la liste ?", "Comment filtrer les étudiants ?"]
      };
    }
    if (q.includes("saisir") && q.includes("note")) {
      return {
        answer: `📝 **Comment saisir des notes ?**

1. Allez dans "Examens" → onglet "Saisie des notes"
2. Sélectionnez la filière et le niveau
3. Choisissez l'examen
4. Cliquez sur "Nouvelle saisie"
5. Sélectionnez l'étudiant
6. Entrez les notes pour chaque matière
7. Cliquez sur "Enregistrer"`,
        suggestions: ["Comment modifier une note ?", "Comment voir le classement ?", "Comment exporter les notes ?"]
      };
    }
    if (q.includes("délibération") || q.includes("passage")) {
      return {
        answer: `⚖️ **Comment faire la délibération ?**

1. Allez dans "Examens" → onglet "Délibération & Passage"
2. Sélectionnez la filière et le niveau
3. Définissez le seuil de délibération
4. Cliquez sur "Appliquer" pour générer les statuts
5. Ajustez manuellement si nécessaire
6. Cliquez sur "Sauvegarder toutes les délibérations"`,
        suggestions: ["Quels sont les critères de renvoi ?", "Comment exporter la liste des admis ?"]
      };
    }
  }

  if (q.includes("export") || q.includes("pdf")) {
    return {
      answer: `📁 **Exports disponibles**

**Module Étudiants :** Liste complète, par filière, par niveau
**Module Examens :** Synthèse, relevé détaillé
**Module Délibération :** Liste des admis
**Module Paiements :** Reçu individuel
**Module Présences :** Export PDF et CSV`,
      suggestions: ["Comment exporter les notes ?", "Comment générer un reçu ?"]
    };
  }

  if (targetModule && KNOWLEDGE_BASE[targetModule]) {
    const module = KNOWLEDGE_BASE[targetModule];
    return {
      answer: `📌 **${module.name}**

${module.description}

**Fonctionnalités :**
${module.features.slice(0, 5).map(f => `  • ${f}`).join('\n')}

💡 Besoin de plus de détails ?`,
      suggestions: [`Comment utiliser ${module.name} ?`, `Exporter depuis ${module.name} ?`]
    };
  }

  return {
    answer: `👋 **Bonjour ! Je suis l'assistant virtuel du CFP Don Bosco.**

**Modules disponibles :**
📊 Tableau de Bord
👨‍🎓 Étudiants
📅 Année Scolaire
💰 Paiements
✅ Présences
📝 Examens
⚖️ Délibération
📈 Suivi Formation
🔐 Authentification
📁 Exports

**Posez-moi une question précise, par exemple :**
- "Comment ajouter un étudiant ?"
- "Comment fonctionne la délibération ?"
- "Comment exporter les notes ?"`,
    suggestions: [
      "Comment ajouter un étudiant ?",
      "Comment fonctionne la délibération ?",
      "Comment exporter les notes ?",
      "Gérer les paiements"
    ]
  };
};

// ============================================================
// COMPOSANT PRINCIPAL RESPONSIVE
// ============================================================
export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "👋 Bonjour ! Je suis l'assistant virtuel du CFP Don Bosco.\n\nJe connais toutes les fonctionnalités de l'application.\n\nPosez-moi votre question !",
      timestamp: new Date(),
      suggestions: [
        "📚 Comment gérer les étudiants ?",
        "📝 Comment saisir des notes ?",
        "⚖️ Comment fonctionne la délibération ?",
        "💰 Comment gérer les paiements ?"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Détecter les appareils mobiles
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = findAnswer(text);
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.answer,
        timestamp: new Date(),
        suggestions: response.suggestions || []
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
  };

  const handleMinimize = () => {
    setIsMinimizing(true);
    setTimeout(() => {
      setIsMinimized(!isMinimized);
      setIsMinimizing(false);
    }, 200);
  };

  const quickActions = [
    { icon: <Users size={14} />, label: "Étudiants", action: "Comment gérer les étudiants ?" },
    { icon: <BookOpen size={14} />, label: "Examens", action: "Comment saisir des notes ?" },
    { icon: <Award size={14} />, label: "Délibération", action: "Comment fonctionne la délibération ?" },
    { icon: <DollarSign size={14} />, label: "Paiements", action: "Comment gérer les paiements ?" },
    { icon: <FileText size={14} />, label: "Exports", action: "Comment exporter des données ?" }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      >
        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-ping"></div>
        <Bot size={20} className="sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute right-full mr-2 sm:mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg hidden sm:block">
          🤖 Assistant IA
        </span>
      </button>
    );
  }

  const windowWidth = isMinimized || isMinimizing ? 'w-[90vw] sm:w-80' : 'w-[95vw] sm:w-[420px]';
  const windowHeight = isMinimized || isMinimizing ? 'h-14' : 'h-[80vh] sm:h-[600px]';

  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-white rounded-2xl shadow-2xl transition-all duration-300 flex flex-col ${windowWidth} ${windowHeight} overflow-hidden animate-slide-up`}>
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-3 sm:px-4 py-2.5 sm:py-3 flex justify-between items-center cursor-pointer"
        onClick={handleMinimize}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="bg-white/20 p-1 sm:p-1.5 rounded-full">
            <Sparkles size={14} className="sm:w-4 sm:h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs sm:text-sm">Assistant IA</h3>
            <p className="text-[8px] sm:text-[10px] opacity-80 hidden sm:block">Expert de l'application</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMinimize();
            }}
            className="p-1 hover:bg-white/20 rounded-lg transition-all"
          >
            {isMinimized ? <Maximize2 size={14} className="sm:w-4 sm:h-4" /> : <Minimize2 size={14} className="sm:w-4 sm:h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="p-1 hover:bg-white/20 rounded-lg transition-all"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-2.5 sm:p-3 ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white"
                      : "bg-white border border-gray-200 text-gray-700 shadow-sm"
                  }`}
                >
                  {msg.type === "bot" && (
                    <div className="flex items-center gap-1 mb-1 sm:mb-1.5">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Bot size={9} className="sm:w-2.5 sm:h-2.5 text-white" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-600">Assistant IA</span>
                    </div>
                  )}
                  <div className="text-[11px] sm:text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  <div className="text-[8px] sm:text-[9px] opacity-50 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white border border-gray-200 rounded-2xl p-2.5 sm:p-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions rapides */}
          <div className="border-t border-gray-100 p-2.5 sm:p-3 bg-white">
            <p className="text-[8px] sm:text-[9px] text-gray-400 mb-1.5 sm:mb-2">⚡ Actions rapides :</p>
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(action.action)}
                  className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-1 sm:py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-all hover:scale-105"
                >
                  {action.icon}
                  <span className="hidden xs:inline">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input responsive */}
          <div className="border-t border-gray-200 p-2.5 sm:p-3 bg-white">
            <div className="flex gap-1.5 sm:gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage(inputValue)}
                placeholder="Posez votre question..."
                className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
            <p className="text-[7px] sm:text-[8px] text-gray-400 text-center mt-1.5 sm:mt-2">
              💡 Je connais tous les modules de l'application
            </p>
          </div>
        </>
      )}
    </div>
  );
}