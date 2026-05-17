// components/Navbar.jsx - Version sans authentification
import { Bell, User } from "lucide-react";

export default function Navbar() {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Bienvenue</h2>
          <p className="text-sm text-gray-500">CFP Don Bosco - Système de Gestion Scolaire</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={20} className="text-gray-500" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">Administrateur</p>
              <p className="text-xs text-gray-500">admin@donbosco.mg</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              AD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}