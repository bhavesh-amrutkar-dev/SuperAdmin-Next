import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FolderGit2, 
  Users, 
  ActivitySquare, 
  Settings, 
  Command,
  ChevronDown,
  Moon,
  Sun
} from "lucide-react";
import { useEffect, useState } from "react";
import { useHealthCheck } from "@workspace/api-client-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setTheme(isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/projects", icon: FolderGit2, label: "Projects" },
    { href: "/users", icon: Users, label: "Users" },
    { href: "/activity", icon: ActivitySquare, label: "Activity" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col transition-all duration-300">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Command className="w-5 h-5 text-primary mr-2" />
          <span className="font-semibold text-sm uppercase tracking-wider">SuperAdmin</span>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border flex flex-col gap-2">
           <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
             <span className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
               API Status
             </span>
             <span>{health?.status || 'checking...'}</span>
           </div>
           
           <button onClick={toggleTheme} className="flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors w-full text-left">
             {theme === 'dark' ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
             {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="h-14 border-b border-border flex items-center px-6 bg-card shrink-0 shadow-sm z-10">
          <div className="text-sm font-medium text-muted-foreground flex items-center">
            {navItems.find(n => location === n.href || (n.href !== "/" && location.startsWith(n.href)))?.label || "Command Center"}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}
