import React from "react";
import { Users, CreditCard, Tags, LogOut, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItemClass = (path) => `
        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition 
        ${
          isActive(path)
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }
    `;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 p-6 flex flex-col h-screen">
      <h1 className="text-xl font-extrabold text-white mb-2 tracking-tight">
        PERC <span className="text-blue-500">ADMIN</span>
      </h1>
      {/* <p className="text-xs text-gray-500 mb-8">v2.5.0 • Supabase</p> */}

      <nav className="space-y-2 flex-grow">
        <button
          onClick={() => navigate("/users")}
          className={navItemClass("/users")}
        >
          <Users className="w-5 h-5" /> Users
        </button>
        <button
          onClick={() => navigate("/pricing")}
          className={navItemClass("/pricing")}
        >
          <CreditCard className="w-5 h-5" /> Pricing & Costs
        </button>
        <button
          onClick={() => navigate("/purchase-plans")}
          className={navItemClass("/purchase-plans")}
        >
          <ShoppingBag className="w-5 h-5" /> Point Packages
        </button>
        <button
          onClick={() => navigate("/discounts")}
          className={navItemClass("/discounts")}
        >
          <Tags className="w-5 h-5" /> Discounts
        </button>
      </nav>

      <div className="pt-6 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white">
            {user?.email?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              Administrator
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 px-4 py-2 rounded-lg text-sm transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
