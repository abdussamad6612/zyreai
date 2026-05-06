import { json, redirect, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Link, Outlet, useLocation, useLoaderData } from '@remix-run/react';
import {
  LayoutDashboard, Users, FolderOpen, Brain, Rocket, CreditCard,
  BarChart3, Settings, Menu, Bell, Shield, ChevronRight,
  Zap, Terminal, LogOut, X, BookOpen,
  Globe, Bot, Flag, Mail, MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { isAdminAuthenticated } from '~/lib/admin/session.server';
import { getSettings } from '~/lib/admin/data.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const authenticated = await isAdminAuthenticated(request);
  if (!authenticated) {
    const url = new URL(request.url);
    throw redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
  }
  const s = getSettings();
  return json({ logoUrl: s.logoUrl, siteName: s.siteName, adminName: s.adminName });
}

function isHiddenAdminLink(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Projects', href: '/admin/projects', icon: FolderOpen },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Website',
    items: [
      { label: 'Content Editor', href: '/admin/content', icon: Globe },
      { label: 'AI Agents', href: '/admin/agents', icon: Bot },
      { label: 'Blog Manager', href: '/admin/blog', icon: BookOpen },
    ],
  },

  {
    label: 'Platform',
    items: [
      { label: 'AI Engine', href: '/admin/ai', icon: Brain },
      { label: 'Feature Flags', href: '/admin/features', icon: Flag },
      { label: 'Deploy & Hosting', href: '/admin/deploy', icon: Rocket },
      { label: 'Billing & Payments', href: '/admin/billing', icon: CreditCard },
      { label: 'Tools & API', href: '/admin/tools', icon: Terminal },
    ],
  },
  {
    label: 'Communications',
    items: [
      { label: 'Notifications', href: '/admin/notifications', icon: Mail },
      { label: 'Support Tickets', href: '/admin/support', icon: MessageSquare },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  const { logoUrl, siteName, adminName } = useLoaderData<typeof loader>();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(href);
  const allItems = NAV_SECTIONS.flatMap(s => s.items);
  const activeLabel = allItems.find(n => isHiddenAdminLink(n.href, location.pathname))?.label || 'Admin';
  const visibleSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => item.href.split('/').filter(Boolean).length <= 2),
  })).filter(section => section.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex" style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-30 flex flex-col shadow-sm transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {logoUrl
              ? <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              : <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm"><Zap className="w-4 h-4 text-white" /></div>}
            <div>
              <p className="text-sm font-bold text-slate-900">{siteName || 'ZYREAI'}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>

        <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
          {visibleSections.map(section => (
            <div key={section.label}>
              <div className="px-3 mb-1 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.label}</span>
                {section.label === 'Prompt Engine' && (
                  <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">New</span>
                )}
                {section.label === 'Communications' && (
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">New</span>
                )}
              </div>
              <div className="space-y-0.5">
                {section.items.map(({ label, href, icon: Icon }) => (
                  <Link key={href} to={href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(href) ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                    {isActive(href) && <ChevronRight className="w-3 h-3 ml-auto text-blue-500" />}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{(adminName || 'A')[0].toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{adminName || 'Admin'}</p>
              <p className="text-[10px] text-slate-400">Super Admin</p>
            </div>
            <Shield className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <Link to="/admin/logout" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-red-500 hover:text-red-700 hover:bg-red-50 transition-all font-medium">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Link>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 lg:px-6 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><Menu className="w-5 h-5" /></button>
            <div>
              <p className="text-sm font-bold text-slate-900">{activeLabel}</p>
              <p className="text-xs text-slate-400 hidden sm:block">{new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
              <Zap className="w-3 h-3" /> View Site
            </Link>
            <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">{(adminName || 'A')[0].toUpperCase()}</div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{adminName || 'Admin'}</p>
                <p className="text-[10px] text-slate-400">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
