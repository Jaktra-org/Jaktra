import { useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, FileText, Bot, BarChart3, AlertTriangle, Settings, History, MessageSquare } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { useAuth } from "../contexts/AuthContext";

export function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Invoices", path: "/invoices", icon: FileText },
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "Payment Plans", path: "/payment-plans", icon: FileText }] : []),
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "Inquiries", path: "/disputes", icon: MessageSquare }] : []),
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "DLQ", path: "/dlq", icon: AlertTriangle }] : []),
    { label: "Agent", path: "/agent", icon: Bot },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "Activity Log", path: "/activity-log", icon: History }] : []),
  ];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#08090a] text-[#f7f8f8] overflow-hidden">
      <aside 
        className="w-16 md:w-44 flex flex-col border-r border-[#222530] bg-gradient-to-b from-[#181a24] via-[#0d0e13] to-[#08090a] flex-shrink-0 select-none"
      >
        <div className="flex h-12 items-center justify-center md:justify-start px-3 md:px-4 border-b border-[#222530]">
          <div className="h-6 w-6 rounded-md bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center flex-shrink-0 p-1 overflow-hidden">
            <img src={jaktraLogo} alt="Jaktra Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-xs font-bold text-[#f7f8f8] tracking-tight hidden md:block ml-2 whitespace-nowrap">Jaktra</span>
        </div>
        
        <nav className="flex-1 space-y-0.5 px-1.5 md:px-2 py-2.5 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-center md:justify-start rounded-md p-1.5 md:px-2.5 md:py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#141516] text-[#5e6ad2] border border-[#23252a]"
                      : "text-[#8a8f98] hover:bg-[#141516]/60 hover:text-[#f7f8f8]"
                  }`
                }
                title={item.label}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:block ml-2 whitespace-nowrap">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {user?.role !== 'viewer' && (
          <div className="p-1.5 md:px-2 md:py-2 border-t border-[#222530]">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center justify-center md:justify-start rounded-md p-1.5 md:px-2.5 md:py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#141516] text-[#5e6ad2] border border-[#23252a]"
                    : "text-[#8a8f98] hover:bg-[#141516]/60 hover:text-[#f7f8f8]"
                }`
              }
              title="Settings"
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="hidden md:block ml-2 whitespace-nowrap">Settings</span>
            </NavLink>
          </div>
        )}
      </aside>

      <main className={`flex-1 min-h-0 overflow-hidden flex flex-col w-full ${
        isHomePage ? "bg-[#08090a]" : "bg-gradient-to-b from-[#181a24] via-[#0d0e13] to-[#08090a]"
      }`}>
        <div className={`flex-1 min-h-0 p-4 md:p-6 overflow-auto flex flex-col ${
          isHomePage ? "bg-[#08090a]" : "bg-transparent"
        }`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
