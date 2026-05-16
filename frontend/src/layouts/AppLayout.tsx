import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Bot, BarChart3, AlertTriangle, Settings, LogOut, History, MessageSquare } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { useAuth } from "../contexts/AuthContext";

export function AppLayout() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Invoices", path: "/invoices", icon: FileText },
    { label: "Agent", path: "/agent", icon: Bot },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "DLQ", path: "/dlq", icon: AlertTriangle }] : []),
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "Disputes", path: "/disputes", icon: MessageSquare }] : []),
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "Payment Plans", path: "/payment-plans", icon: FileText }] : []),
    ...((user?.role === 'admin' || user?.role === 'manager') ? [{ label: "Activity Log", path: "/activity-log", icon: History }] : []),
    ...(user?.role !== 'viewer' ? [{ label: "Settings", path: "/settings", icon: Settings }] : []),
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentNavItem = navItems.find(item => 
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );
  const breadcrumb = currentNavItem ? currentNavItem.label : "Dashboard";

  const initials = user?.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex h-screen w-full bg-[#010102] text-[#f7f8f8] overflow-hidden">
      <aside 
        style={{ width: isMobile ? undefined : sidebarWidth }}
        className={`relative flex flex-col border-r border-[#23252a] bg-[#0f1011] text-[#8a8f98] z-20 flex-shrink-0 ${isMobile ? 'w-16' : ''} ${!isResizing ? 'transition-all duration-300' : ''}`}
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

        <div className="border-t border-[#23252a]/70 p-2 md:p-3">
          <button 
            onClick={() => logout()}
            className="flex w-full items-center justify-center md:justify-start rounded-md p-2 md:px-3 md:py-1.5 text-xs font-medium text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8] transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="hidden md:block ml-2.5 truncate">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[#010102] w-full">
        <header className="flex h-14 items-center justify-between border-b border-[#23252a] bg-[#010102] px-4 md:px-6 flex-shrink-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8a8f98]">
            {breadcrumb}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-1 focus:ring-[#5e69d1]"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                <div className="h-7 w-7 rounded-full bg-[#141516] border border-[#23252a] flex items-center justify-center text-[#5e6ad2] font-semibold text-xs hover:border-[#34343a] transition-colors">
                  {initials}
                </div>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#0f1011] border border-[#23252a] shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="px-4 py-3 border-b border-[#23252a]/70">
                    <p className="text-xs font-medium text-[#f7f8f8] truncate">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-[#8a8f98] truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={() => logout()}
                      className="flex w-full items-center px-4 py-2 text-xs text-red-400 hover:bg-[#141516] transition-colors"
                    >
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <div className="flex-1 min-h-0 p-4 md:p-6 overflow-auto bg-[#010102]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

