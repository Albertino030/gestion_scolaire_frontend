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
  // Présentation générale
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

  // Module Dashboard
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

  // Module Étudiants
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
      "Validation des champs obligatoires",
      "Animation des lignes du tableau",
      "Toast notifications pour feedback utilisateur"
    ],
    fields: [
      "Matricule", "Date inscription", "Nom", "Prénom", "Genre",
      "Date naissance", "Lieu naissance", "Nom père", "Nom mère",
      "Nom tuteur", "Adresse", "Téléphone", "Filière", "Niveau",
      "Projet professionnel"
    ]
  },

  // Module Année Scolaire
  anneeScolaire: {
    name: "Gestion des Années Scolaires",
    description: "Configuration et gestion des années académiques",
    features: [
      "Ajout d'une nouvelle année scolaire",
      "Modification d'une année existante",
      "Suppression d'une année (hors année active)",
      "Activation d'une année (désactive automatiquement les autres)",
      "Affichage de l'année active en cours",
      "Statistiques (total, actives, archivées, taux actif)",
      "Recherche par libellé",
      "Dates de début et fin configurables",
      "Validation avant suppression",
      "Interface responsive avec animations"
    ]
  },

  // Module Paiements
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
      "Statistiques: total étudiants, payés, impayés, taux",
      "Recherche par nom/matricule",
      "Filtrage par filière et niveau",
      "Génération de reçu PDF personnalisé",
      "Modification individuelle des paiements",
      "Interface avec badges colorés",
      "Bouton 'Générer' pour initialiser les paiements"
    ]
  },

  // Module Présences
  presence: {
    name: "Gestion des Présences",
    description: "Suivi de l'assiduité des étudiants",
    features: [
      "Enregistrement des absences et retards",
      "Motif optionnel pour chaque absence/retard",
      "Filtrage par filière, niveau et type",
      "Recherche par nom/matricule",
      "Statistiques: total présences, présents, absences, taux",
      "Export PDF et CSV des données",
      "Modification et suppression des enregistrements",
      "Affichage des détails individuels",
      "Test PDF pour vérification",
      "Lié à l'année scolaire active"
    ]
  },

  // Module Examens / Notes
  examens: {
    name: "Gestion des Examens et Notes",
    description: "Saisie et suivi des notes d'examens",
    features: [
      "6 examens par année scolaire",
      "Saisie des notes par matière",
      "Calcul automatique des moyennes",
      "Classement automatique des étudiants",
      "Affichage des rangs (1er, 2ème, 3ème avec badges)",
      "Visualisation des notes par examen",
      "Modification des notes existantes",
      "Filtrage par filière, niveau et examen",
      "Export PDF (synthèse et détaillé)",
      "Export CSV (synthèse et détaillé)",
      "Statistiques détaillées (moyenne générale, taux réussite, mentions)",
      "Performance par matière avec graphiques",
      "Top 3 des meilleurs étudiants"
    ]
  },

  // Module Délibération
  deliberation: {
    name: "Délibération et Passage",
    description: "Décision finale de fin d'année",
    features: [
      "Calcul automatique de la moyenne annuelle",
      "Formule: (Ex1×1 + Ex2×2 + Ex3×1 + Ex4×2 + Ex5×1 + Ex6×2) ÷ 9",
      "Définition du seuil de délibération (défaut: 10/20)",
      "Application automatique des statuts",
      "Décision manuelle: Passer / Redoubler / Renvoyer",
      "Affichage de la moyenne annuelle par étudiant",
      "Statistiques: moyenne classe, taux réussite, meilleure moyenne",
      "Filtrage par statut (Tous, Passés, Redoublants, Renvoyés, En attente)",
      "Liste des étudiants admis avec export PDF",
      "Sauvegarde individuelle ou massive",
      "Confirmation avant renvoi"
    ]
  },

  // Module Suivi Formation
  suiviFormation: {
    name: "Suivi Après Formation",
    description: "Suivi des anciens élèves sur 5 ans",
    features: [
      "Suivi sur 5 ans après la formation",
      "Types: CDI, CDD, Stage, Essai, Auto-emploi, Sous emploi",
      "Informations: employeur, poste, salaire, contact",
      "Tableau récapitulatif 5 ans",
      "Statistiques: total suivis, CDI, CDD, Auto-emploi, Stage",
      "Taux d'insertion professionnelle",
      "Recherche par nom/matricule",
      "Filtrage par année de sortie et type suivi",
      "Ajout, modification, suppression",
      "Nettoyage automatique des données (suppression après 5 ans)",
      "Deux vues: Liste détaillée / Tableau 5 ans"
    ]
  },

  // Module Auth / Utilisateurs
  auth: {
    name: "Authentification et Utilisateurs",
    description: "Gestion des comptes utilisateurs",
    features: [
      "Connexion avec email et mot de passe",
      "Inscription des nouveaux utilisateurs",
      "Mot de passe oublié (envoi de code)",
      "Réinitialisation du mot de passe",
      "Rôles: Administrateur et Utilisateur",
      "Affichage du compte connecté",
      "Bouton de déconnexion",
      "Message d'accès non autorisé"
    ]
  },

  // Module Exports
  exports: {
    name: "Exports de Données",
    description: "Génération de rapports PDF et CSV",
    features: [
      "Export PDF liste étudiants (complet)",
      "Export PDF étudiants par filière",
      "Export PDF étudiants par niveau",
      "Export PDF résultats d'examen (synthèse)",
      "Export PDF relevé détaillé des notes",
      "Export CSV résultats (synthèse)",
      "Export CSV relevé détaillé",
      "Export PDF liste des admis",
      "Export PDF reçu de paiement",
      "Export PDF/CSV présence",
      "Export PDF statistiques"
    ]
  }
};

// Fonction de recherche intelligente
const findAnswer = (question) => {
  const q = question.toLowerCase();
  
  // Mots-clés par module
  const keywords = {
    dashboard: ["tableau de bord", "dashboard", "statistique", "graphique", "kpi", "indicateur"],
    etudiants: ["étudiant", "élève", "apprenant", "inscription", "matricule"],
    anneeScolaire: ["année scolaire", "année académique", "session", "période"],
    paiements: ["paiement", "frais", "écolage", "inscription", "argent", "recette", "reçu"],
    presence: ["présence", "absence", "retard", "assiduité", "pointage"],
    examens: ["examen", "note", "moyenne", "classement", "rang", "coefficient"],
    deliberation: ["délibération", "passage", "redoublement", "renvoi", "admis", "statut"],
    suiviFormation: ["suivi", "insertion", "emploi", "création", "stage", "cdi", "cdd"],
    auth: ["connexion", "inscription", "compte", "mot de passe", "login", "register"],
    exports: ["export", "pdf", "csv", "imprimer", "télécharger"]
  };

  // Vérifier quel module est concerné
  let targetModule = null;
  for (const [module, words] of Object.entries(keywords)) {
    if (words.some(word => q.includes(word))) {
      targetModule = module;
      break;
    }
  }

  // Réponses spécifiques
  if (q.includes("comment") || q.includes("procédure") || q.includes("faire")) {
    if (q.includes("ajouter") && (q.includes("étudiant") || q.includes("élève"))) {
      return {
        answer: `📚 **Comment ajouter un étudiant ?**

1. Allez dans le menu "Étudiants"
2. Cliquez sur le bouton "Ajouter" (bleu avec une croix)
3. Remplissez le formulaire avec les informations :
   - Matricule (unique)
   - Nom et prénom
   - Date de naissance et lieu
   - Filière et niveau
   - Coordonnées et contacts parents
   - Projet professionnel
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
3. Choisissez l'examen (1 à 6)
4. Cliquez sur "Nouvelle saisie"
5. Sélectionnez l'étudiant dans la liste
6. Entrez les notes pour chaque matière
7. Cliquez sur "Enregistrer"

💡 Les notes sont automatiquement sauvegardées et le classement se met à jour.`,
        suggestions: ["Comment modifier une note ?", "Comment voir le classement ?", "Comment exporter les notes ?"]
      };
    }

    if (q.includes("délibération") || q.includes("passage")) {
      return {
        answer: `⚖️ **Comment faire la délibération ?**

1. Allez dans "Examens" → onglet "Délibération & Passage"
2. Sélectionnez la filière et le niveau
3. Définissez le seuil de délibération (défaut 10/20)
4. Cliquez sur "Appliquer" pour générer les statuts automatiques
5. Ajustez manuellement si nécessaire (Passer/Redoubler/Renvoyer)
6. Cliquez sur "Sauvegarder toutes les délibérations"

📊 La moyenne annuelle est calculée avec les coefficients:
   Ex1:1, Ex2:2, Ex3:1, Ex4:2, Ex5:1, Ex6:2

La liste des admis s'affiche automatiquement.`,
        suggestions: ["Quels sont les critères de renvoi ?", "Comment exporter la liste des admis ?", "Comment modifier un statut ?"]
      };
    }

    if (q.includes("paiement") || q.includes("générer")) {
      return {
        answer: `💰 **Comment gérer les paiements ?**

**Pour générer les paiements d'un étudiant :**
1. Allez dans "Paiements"
2. Recherchez l'étudiant
3. Cliquez sur "Générer" dans la colonne Actions

**Pour modifier un paiement :**
1. Cliquez sur le badge coloré (vert/payé, rouge/impayé, jaune/partiel)
2. Sélectionnez le nouveau statut
3. Modifiez le montant si nécessaire
4. Cliquez sur "Sauvegarder"

**Pour voir un reçu :**
- Cliquez sur "Reçu" pour générer un PDF détaillé

📋 Frais configurables :
- Inscription: 50,000 Ar
- Tablier: 20,000 Ar
- Combinaison: 30,000 Ar
- Tenue fête: 30,000 Ar
- Écolage: 20,000 Ar/mois (septembre à juin)`,
        suggestions: ["Comment exporter les paiements ?", "Comment ajouter un paiement manuel ?", "Voir les statistiques des paiements"]
      };
    }

    if (q.includes("présence") || q.includes("absence")) {
      return {
        answer: `✅ **Comment gérer les présences ?**

1. Allez dans "Présences"
2. Cliquez sur "Nouvelle présence"
3. Saisissez le matricule de l'étudiant
4. Choisissez le type (Absence ou Retard)
5. Ajoutez un motif (optionnel)
6. Cliquez sur "Enregistrer"

📊 Les statistiques sont mises à jour automatiquement :
   - Total présences
   - Nombre d'absences
   - Nombre de retards
   - Taux de présence

💡 Vous pouvez filtrer par filière, niveau et type.`,
        suggestions: ["Comment modifier une présence ?", "Comment exporter les présences ?", "Comment supprimer une présence ?"]
      };
    }
  }

  // Questions sur les fonctionnalités spécifiques
  if (q.includes("classement") || q.includes("rang")) {
    return {
      answer: `🏆 **Classement des étudiants**

Le classement s'affiche automatiquement dans le tableau des notes.
- Les étudiants sont triés par moyenne décroissante
- Le rang est affiché dans la première colonne
- Badges colorés pour les 3 premiers :
  🥇 1er : badge jaune
  🥈 2ème : badge gris
  🥉 3ème : badge orange

💡 Cliquez sur "Stats" pour voir le Top 3 et plus de détails.`,
      suggestions: ["Comment voir les statistiques ?", "Comment exporter le classement ?", "Comment modifier les notes ?"]
    };
  }

  if (q.includes("export") || q.includes("pdf")) {
    return {
      answer: `📁 **Exports disponibles**

**Module Étudiants :**
- Liste complète des étudiants (PDF)
- Par filière (PDF)
- Par niveau (PDF)

**Module Examens :**
- Synthèse avec statistiques (PDF)
- Relevé détaillé des notes (PDF)
- Synthèse des résultats (CSV)
- Relevé détaillé (CSV)

**Module Délibération :**
- Liste des étudiants admis (PDF)

**Module Paiements :**
- Reçu de paiement individuel (PDF)

**Module Présences :**
- Export PDF et CSV

💡 Tous les exports sont générés automatiquement au format souhaité.`,
      suggestions: ["Comment exporter les notes ?", "Comment exporter la liste des étudiants ?", "Comment générer un reçu ?"]
    };
  }

  if (q.includes("statistique") || q.includes("stat")) {
    return {
      answer: `📊 **Statistiques disponibles**

**Dashboard (vue d'ensemble) :**
- Total étudiants, actifs, filles/garçons
- Taux d'insertion, recouvrement, réussite
- Graphiques interactifs

**Examens :**
- Moyenne générale de la classe
- Taux de réussite et mentions
- Performance par matière
- Top 3 meilleurs étudiants

**Délibération :**
- Moyenne de la classe
- Taux de réussite annuel
- Répartition Passés/Redoublants/Renvoyés

**Paiements :**
- Taux de recouvrement
- Nombre de payés/impayés/partiels

**Présences :**
- Taux d'assiduité
- Nombre d'absences et retards

**Suivi Formation :**
- Taux d'insertion professionnelle
- Répartition CDI/CDD/Stage/Auto-emploi`,
      suggestions: ["Comment voir les graphiques ?", "Comment exporter les statistiques ?", "Filtres disponibles ?"]
    };
  }

  if (q.includes("filtre") || q.includes("recherche")) {
    return {
      answer: `🔍 **Recherche et filtres disponibles**

Par module :

**Étudiants** : Recherche par nom/prénom/matricule + Filtres par filière et niveau

**Examens** : Filière, Niveau, Examen (1 à 6)

**Délibération** : Filière, Niveau, Seuil de délibération, Statut

**Paiements** : Recherche par nom/matricule + Filtres par filière et niveau

**Présences** : Recherche par nom/matricule + Filtres par filière, niveau, type

**Suivi Formation** : Recherche par nom/matricule + Filtres par année sortie, type suivi

💡 Tous les filtres peuvent être combinés pour affiner les résultats.`,
      suggestions: ["Comment réinitialiser les filtres ?", "Recherche avancée ?", "Filtres par date ?"]
    };
  }

  // Si aucun module spécifique n'est trouvé
  if (targetModule && KNOWLEDGE_BASE[targetModule]) {
    const module = KNOWLEDGE_BASE[targetModule];
    return {
      answer: `📌 **${module.name}**

${module.description}

**Fonctionnalités :**
${module.features.map(f => `  • ${f}`).join('\n')}

💡 Besoin de plus de détails sur une fonctionnalité spécifique ?`,
      suggestions: [`Comment utiliser ${module.name} ?`, `Exporter depuis ${module.name} ?`, `Filtres dans ${module.name} ?`]
    };
  }

  // Réponse par défaut
  return {
    answer: `👋 **Bonjour ! Je suis l'assistant virtuel du CFP Don Bosco.**

Je peux vous aider à comprendre toutes les fonctionnalités de l'application.

**Modules disponibles :**
📊 Tableau de Bord - Statistiques et graphiques
👨‍🎓 Étudiants - Gestion des inscriptions
📅 Année Scolaire - Configuration des sessions
💰 Paiements - Suivi financier
✅ Présences - Gestion de l'assiduité
📝 Examens - Notes et classements
⚖️ Délibération - Décisions de passage
📈 Suivi Formation - Insertion professionnelle
🔐 Authentification - Gestion des comptes
📁 Exports - PDF et CSV

**Posez-moi une question précise, par exemple :**
- "Comment ajouter un étudiant ?"
- "Comment fonctionne la délibération ?"
- "Comment exporter les notes ?"
- "Quelles sont les statistiques disponibles ?"`,
    suggestions: [
      "Comment ajouter un étudiant ?",
      "Comment fonctionne la délibération ?",
      "Comment exporter les notes ?",
      "Voir les statistiques",
      "Gérer les paiements"
    ]
  };
};

// ============================================================
// COMPOSANT PRINCIPAL DE L'ASSISTANT IA
// ============================================================
export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "👋 Bonjour ! Je suis l'assistant virtuel du CFP Don Bosco.\n\nJe connais toutes les fonctionnalités de l'application :\n• Gestion des étudiants\n• Saisie des notes et examens\n• Délibération et passage\n• Paiements et reçus\n• Présences et assiduité\n• Suivi après formation\n• Exports PDF et CSV\n\nPosez-moi votre question !",
      timestamp: new Date(),
      suggestions: [
        "📚 Comment gérer les étudiants ?",
        "📝 Comment saisir des notes ?",
        "⚖️ Comment fonctionne la délibération ?",
        "💰 Comment gérer les paiements ?",
        "✅ Comment gérer les présences ?",
        "📊 Voir les statistiques"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking
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
    { icon: <Clock size={14} />, label: "Présences", action: "Comment gérer les présences ?" },
    { icon: <BarChart3 size={14} />, label: "Stats", action: "Quelles sont les statistiques disponibles ?" },
    { icon: <FileText size={14} />, label: "Exports", action: "Comment exporter des données ?" },
    { icon: <GraduationCap size={14} />, label: "Suivi", action: "Comment fonctionne le suivi formation ?" }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-110 group animate-bounce-in"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        <Bot size={24} className="group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
          🤖 Assistant IA
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl transition-all duration-300 flex flex-col ${isMinimized || isMinimizing ? 'w-80 h-14' : 'w-[420px] h-[600px]'} overflow-hidden animate-slide-up`}>
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={handleMinimize}
      >
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-full">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Assistant IA Don Bosco</h3>
            <p className="text-[10px] opacity-80">Expert de l'application</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMinimize();
            }}
            className="p-1 hover:bg-white/20 rounded-lg transition-all"
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="p-1 hover:bg-white/20 rounded-lg transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white"
                      : "bg-white border border-gray-200 text-gray-700 shadow-sm"
                  }`}
                >
                  {msg.type === "bot" && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Bot size={10} className="text-white" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600">Assistant IA</span>
                    </div>
                  )}
                  <div className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  <div className="text-[9px] opacity-50 mt-1.5 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions rapides */}
          <div className="border-t border-gray-100 p-3 bg-white">
            <p className="text-[9px] text-gray-400 mb-2">⚡ Actions rapides :</p>
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(action.action)}
                  className="flex items-center gap-1 text-[9px] px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-all hover:scale-105"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage(inputValue)}
                placeholder="Posez votre question..."
                className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[8px] text-gray-400 text-center mt-2">
              💡 Je connais tous les modules de l'application
            </p>
          </div>
        </>
      )}
    </div>
  );
}