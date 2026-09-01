import { useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, FileText, Bot, BarChart3, Settings, History, MessageSquare, CreditCard } from "lucide-react";
import jaktraLogo from "../assets/jaktra_svg.svg";
import { useAuth } from "../contexts/AuthContext";

interface NavGroup {
  title?: string;
  items: {
    label: string;
    path: string;
    icon: React.ElementType;
    visible?: boolean;
  }[];
}

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';
  const isNotViewer = user?.role !== 'viewer';

  const navGroups: NavGroup[] = [
    {
      items: [
        { label: "Home", path: "/", icon: Home, visible: true },
        { label: "Invoices", path: "/invoices", icon: FileText, visible: true },
        { label: "Autopilot", path: "/agent", icon: Bot, visible: true },
      ],
    },
    {
      title: "WORKSPACE",
      items: [
        { label: "Payment Plans", path: "/payment-plans", icon: CreditCard, visible: isAdminOrManager },
        { label: "Inquiries", path: "/disputes", icon: MessageSquare, visible: isAdminOrManager },
      ],
    },
    {
      title: "INSIGHTS",
      items: [
        { label: "Analytics", path: "/analytics", icon: BarChart3, visible: true },
        { label: "Activity Log", path: "/activity-log", icon: History, visible: isAdminOrManager },
      ],
    },
  ];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#010102] text-[#f7f8f8] overflow-hidden select-none">
      <aside className="w-14 md:w-44 flex flex-col border-r border-[#23252a] bg-[#010102] flex-shrink-0">
        <div className="flex h-13 items-center justify-between px-3 md:px-3.5 border-b border-[#23252a]/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-7.5 w-7.5 rounded-lg bg-[#0f1011] border border-[#23252a] flex items-center justify-center flex-shrink-0 p-1">
              <img src={jaktraLogo} alt="Jaktra Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-[15px] font-semibold text-[#f7f8f8] tracking-tight hidden md:block truncate">
              Jaktra
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-4 px-2 py-3 overflow-y-auto overflow-x-hidden thin-scrollbar">
          {navGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) => item.visible !== false);
            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-0.5">
                {group.title && (
                  <div className="px-2.5 pt-2 pb-1 hidden md:block">
                    <span className="text-[11px] font-semibold text-[#62666d] tracking-wider uppercase">
                      {group.title}
                    </span>
                  </div>
                )}
                {group.title && groupIdx > 0 && (
                  <div className="md:hidden my-2 border-t border-[#23252a]/40" />
                )}

                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      className={({ isActive }) =>
                        `flex items-center justify-center md:justify-start rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-all duration-150 ${
                          isActive
                            ? "bg-[#18191c] text-[#f7f8f8] shadow-xs border border-[#26282e]"
                            : "text-[#8a8f98] hover:bg-[#121316] hover:text-[#f7f8f8]"
                        }`
                      }
                      title={item.label}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 stroke-[1.8]" />
                      <span className="hidden md:block ml-2.5 truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {isNotViewer && (
          <div className="p-2 border-t border-[#23252a]/60">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center justify-center md:justify-start rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#18191c] text-[#f7f8f8] shadow-xs border border-[#26282e]"
                    : "text-[#8a8f98] hover:bg-[#121316] hover:text-[#f7f8f8]"
                }`
              }
              title="Settings"
            >
              <Settings className="h-4 w-4 flex-shrink-0 stroke-[1.8]" />
              <span className="hidden md:block ml-2.5 truncate">Settings</span>
            </NavLink>
          </div>
        )}
      </aside>

      <main className={`flex-1 min-h-0 overflow-hidden flex flex-col w-full ${
        isHomePage ? "bg-[#010102]" : "bg-[#010102]"
      }`}>
        <div className="flex-1 min-h-0 h-full p-4 md:p-6 overflow-auto flex flex-col bg-transparent">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}

