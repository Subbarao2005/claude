import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { 
  Bell, 
  Search, 
  ChevronDown, 
  User,
  ExternalLink,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/orders/admin/all?status=Pending');
        setPendingCount(res.data.count || 0);
      } catch (err) {
        console.error('Failed to fetch pending count');
      }
    };
    fetchPending();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FDFCFB]"> {/* Ultra light warm paper background */}
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Sidebar - Mobile */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-slate-950 animate-in slide-in-from-left duration-300">
            <AdminSidebar />
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-6 -right-12 p-2 bg-white rounded-full shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 lg:h-24 bg-white/70 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50">
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2.5 bg-slate-50 rounded-xl text-slate-600"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 group focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
              <Search size={18} className="group-focus-within:text-amber-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 placeholder:text-slate-300 w-64" 
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Live Status */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Systems Live
            </div>

            {/* Notifications */}
            <button className="relative p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-amber-600 hover:border-amber-100 hover:bg-amber-50 transition-all">
              <Bell size={20} />
              {pendingCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.name || 'Admin User'}</p>
                <div className="flex items-center justify-end gap-1.5">
                  <ShieldCheck size={12} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Master Admin</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl shadow-slate-200">
                {(user?.name || 'A').charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 gpu">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
