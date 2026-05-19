import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Home, FileText, Bot, BarChart3, AlertTriangle, Settings, History, MessageSquare } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { useAuth } from "../contexts/AuthContext";

export function AppLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user } = useAuth();

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Invoices", path: "/invoices", icon: FileText },
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "Payment Plans", path: "/payment-plans", icon: FileText }] : []),
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "Disputes", path: "/disputes", icon: MessageSquare }] : []),
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "DLQ", path: "/dlq", icon: AlertTriangle }] : []),
    { label: "Agent", path: "/agent", icon: Bot },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "Activity Log", path: "/activity-log", icon: History }] : []),
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(e.clientX, 200), 500);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className="flex h-screen w-full bg-[#010102] text-[#f7f8f8] overflow-hidden">
      <aside 
        style={{ width: isMobile ? "auto" : `${sidebarWidth}px` }}
        className="relative flex flex-col border-r border-[#23252a] bg-[#010102] flex-shrink-0 transition-none select-none"
      >
        {!isMobile && (
          <div 
            onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
            className="absolute top-0 -right-2 w-4 h-full cursor-col-resize z-50 bg-transparent"
            title="Drag to resize"
          />
        )}
        
        <div className="flex h-14 items-center justify-center md:justify-start md:px-5 border-b border-[#23252a]/70">
          <div className="h-7 w-7 rounded-md bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 flex items-center justify-center flex-shrink-0 p-1 overflow-hidden">
            <img src={jaktraLogo} alt="Jaktra Logo" className="h-full w-full object-contain" />
          </div>
          <span className="text-sm font-semibold text-[#f7f8f8] tracking-tight hidden md:block ml-2.5 whitespace-nowrap overflow-hidden">Jaktra</span>
        </div>
        
        <nav className="flex-1 space-y-1 px-2 md:px-3 py-3 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-center md:justify-start rounded-md p-2 md:px-3 md:py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#141516] text-[#5e6ad2] border border-[#23252a]"
                      : "text-[#8a8f98] hover:bg-[#141516]/60 hover:text-[#f7f8f8]"
                  }`
                }
                title={item.label}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden md:block ml-2.5 truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {user?.role !== 'viewer' && (
          <div className="p-2 md:px-3 md:py-2.5 border-t border-[#23252a]/70">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center justify-center md:justify-start rounded-md p-2 md:px-3 md:py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#141516] text-[#5e6ad2] border border-[#23252a]"
                    : "text-[#8a8f98] hover:bg-[#141516]/60 hover:text-[#f7f8f8]"
                }`
              }
              title="Settings"
            >
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="hidden md:block ml-2.5 truncate">Settings</span>
            </NavLink>
          </div>
        )}
      </aside>

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#010102] w-full">
        <div className="flex-1 min-h-0 p-4 md:p-6 overflow-auto bg-[#010102]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

