import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileText, Users, BookOpen, Mail, Menu, ChevronLeft, ChevronRight, ExternalLink, Calendar, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved === 'true';
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/lab-info', icon: Settings, label: 'Lab Info & Settings' },
    { path: '/admin/research-areas', icon: FileText, label: 'Research Areas' },
    { path: '/admin/team-members', icon: Users, label: 'Team Members' },
    { path: '/admin/publications', icon: BookOpen, label: 'Publications' },
    { path: '/admin/timeline', icon: Calendar, label: 'Timeline' },
    { path: '/admin/contact-submissions', icon: Mail, label: 'Contact Submissions' },
  ];

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', isDesktopSidebarCollapsed.toString());
  }, [isDesktopSidebarCollapsed]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileSidebarOpen(false);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
  };

  // Sidebar Navigation Component
  const SidebarNav = ({ 
    onNavigate, 
    isCollapsed = false 
  }: { 
    onNavigate?: (path: string) => void;
    isCollapsed?: boolean;
  }) => (
    <nav className="p-4 space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => onNavigate ? onNavigate(item.path) : navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <Icon className={`w-5 h-5 ${isCollapsed ? 'shrink-0' : ''}`} />
            {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Desktop Sidebar Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex p-2"
              onClick={toggleDesktopSidebar}
              title={isDesktopSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isDesktopSidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </Button>

            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm md:text-base">K</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-gray-900 text-base md:text-lg">King's Lab Admin</h1>
              <p className="text-gray-500 text-xs md:text-sm hidden md:block">Content Management System</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-gray-900 text-sm">Admin</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden md:block">
              <p className="text-gray-900 text-sm">{user?.name}</p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs md:text-sm"
              onClick={() => window.open('/', '_blank')}
            >
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">View Site</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-xs md:text-sm"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside 
          className={`hidden lg:block bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto transition-all duration-300 ${
            isDesktopSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <SidebarNav isCollapsed={isDesktopSidebarCollapsed} />
        </aside>

        {/* Mobile Sidebar (Sheet) */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-[280px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white">K</span>
                </div>
                <div>
                  <div className="text-left text-base">King's Lab Admin</div>
                  <div className="text-left text-xs text-gray-500 font-normal">Navigation</div>
                </div>
              </SheetTitle>
            </SheetHeader>
            <SidebarNav onNavigate={handleNavigate} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
