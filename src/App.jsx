import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AIAssistant from "./components/AIAssistant";
import Home from "./pages/Home"; // Page d'accueil avec modale
import { verifyToken } from "./api/auth";

// Pages
import Dashboard from "./pages/Dashboard";
import Etudiants from "./pages/Etudiants";
import AnneeScolaire from "./pages/AnneeScolaire";
import Paiements from "./pages/Paiements";
import Presence from "./pages/Presence";
import Examen from "./pages/Examen";
import SuiviFormation from "./pages/suivi_formation";

// Layout principal avec Sidebar et Navbar
const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      
      const isValid = await verifyToken();
      setIsAuthenticated(isValid);
    };
    
    checkAuth();
  }, [token]);

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Composant principal avec les routes
function AppRoutes() {
  return (
    <Routes>
      {/* Route publique - Page d'accueil avec modale de connexion */}
      <Route path="/" element={<Home />} />
      
      {/* Routes protégées */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout><Dashboard /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/etudiants" element={
        <ProtectedRoute>
          <MainLayout><Etudiants /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/annee-scolaire" element={
        <ProtectedRoute>
          <MainLayout><AnneeScolaire /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/paiements" element={
        <ProtectedRoute>
          <MainLayout><Paiements /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/presence" element={
        <ProtectedRoute>
          <MainLayout><Presence /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/examen" element={
        <ProtectedRoute>
          <MainLayout><Examen /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/suivi-formation" element={
        <ProtectedRoute>
          <MainLayout><SuiviFormation /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
      <AIAssistant />
    </Router>
  );
}