import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Map,
  Home,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import logoSvg from "../favicon/favicon.svg";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const userId = localStorage.getItem("userId");

  const navItems = [
    { path: "/feed", label: "Feed", icon: Home },
    { path: "/search", label: "Search", icon: Map },
    { path: `/profile/${userId}`, label: "Profile", icon: User },
  ];

  const isActive = (path: string) => {
    if (path.includes("/profile") && location.pathname.includes("/profile")) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <nav className="backdrop-blur-xl bg-slate-900/50 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/search")}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/80 to-pink-500/80 backdrop-blur-sm rounded-full flex items-center justify-center p-1.5 shadow-lg border border-white/20">
              <img src={logoSvg} alt="Pizza Party" className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-bold text-white hidden sm:block">
              Pizza Party
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50"
                      : "text-white/60 hover:text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            className="md:hidden text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-6 py-4 space-y-2 bg-slate-900/30">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "text-white/60 hover:text-white/90 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <main>
        <Outlet />
      </main>

      <div className="fixed bottom-4 right-4 md:hidden">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-500/80 to-pink-500/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20 cursor-pointer hover:shadow-xl hover:from-purple-600/80 hover:to-pink-600/80 transition-all p-2.5">
          <img src={logoSvg} alt="Pizza Party" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
