import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Clock, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  School,
  LogOut,
  Briefcase,
  X
} from "lucide-react";
import logo from "../logo/LOGO CFP DON BOSCO.png";

export default function Sidebar({ onToggleCollapse, isCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Menu items (sans authentification)
  const menuItems = [
    { id: "dashboard", path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "etudiants", path: "/etudiants", label: "Étudiants", icon: Users },
    { id: "annee", path: "/annee-scolaire", label: "Année scolaire", icon: Calendar },
    { id: "paiements", path: "/paiements", label: "Paiements", icon: CreditCard },
    { id: "presence", path: "/presence", label: "Présence", icon: Clock },
    { id: "examen", path: "/examen", label: "Examen", icon: FileText },
    { id: "suivi", path: "/suivi-formation", label: "Suivi formation", icon: Briefcase }
  ];

  // Fermer le menu mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Boutons de contrôle */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden bg-gray-800 text-white p-2 rounded-lg shadow-lg"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex bg-gray-800 text-white p-2 rounded-lg shadow-lg"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Sidebar desktop */}
      <div
        className={`hidden md:block ${
          isCollapsed ? "w-16" : "w-72"
        } h-screen bg-white border-r border-gray-200 transition-all duration-300`}
      >
        <div className="h-full flex flex-col">
          {/* Logo - Agrandi et centré */}
          <div className={`py-8 ${isCollapsed ? "px-2" : "px-6"}`}>
            <div className={`flex flex-col items-center ${isCollapsed ? "" : "gap-3"}`}>
              <img
                src={logo}
                alt="Logo Don Bosco"
                className={`object-contain rounded-xl transition-all duration-300 ${
                  isCollapsed ? "w-12 h-12" : "w-32 h-32"
                }`}
              />
              {!isCollapsed && (
                <div className="text-center mt-2">
                  <h1 className="text-xl font-bold text-gray-800 tracking-wide">
                    DON BOSCO
                  </h1>
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    Centre de Formation Professionnelle
                  </p>
                  <div className="w-12 h-0.5 bg-blue-500 mx-auto mt-2 rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 px-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-colors duration-200
                  ${isCollapsed ? "justify-center" : ""}
                  ${
                    isActive(item.path)
                      ? "bg-blue-600 text-white"
                      : hoveredItem === item.id
                      ? "bg-gray-100 text-gray-800"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <item.icon size={20} />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {isCollapsed && hoveredItem === item.id && (
                  <div className="fixed left-14 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3">
            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem("logout")}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-colors duration-200
                bg-red-500 hover:bg-red-600 text-white
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <LogOut size={18} />
              {!isCollapsed && <span className="text-sm font-medium">Déconnexion</span>}
              {isCollapsed && hoveredItem === "logout" && (
                <div className="fixed left-14 ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded z-50 whitespace-nowrap">
                  Déconnexion
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
          isMobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-200 ${
            isMobileMenuOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Logo mobile agrandi */}
            <div className="p-6 border-b">
              <div className="flex flex-col items-center gap-3">
                <img 
                  src={logo} 
                  alt="Logo Don Bosco" 
                  className="w-24 h-24 object-contain rounded-xl" 
                />
                <div className="text-center">
                  <h1 className="text-lg font-bold text-gray-800">DON BOSCO</h1>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Centre de Formation Professionnelle
                  </p>
                </div>
              </div>
            </div>

            {/* Menu mobile */}
            <nav className="flex-1 p-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-colors duration-200
                    ${
                      isActive(item.path)
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  <item.icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Footer mobile */}
            <div className="p-3 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}