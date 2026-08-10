import React from 'react';
import { useAuth } from '../AuthContext';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Bike, 
  Briefcase, 
  LogOut,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

export default function AdminLayout() {
  const { admin, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, requiredAccess: 'all' },
    { name: 'Inquiries & Leads', path: '/inquiries', icon: MessageSquare, requiredAccess: 'all' },
    { name: 'App Users', path: '/users', icon: Users, requiredAccess: 'users' },
    { name: 'Partners & Vendors', path: '/partners', icon: Building2, requiredAccess: 'partners' },
    { name: 'Delivery Fleet', path: '/riders', icon: Bike, requiredAccess: 'riders' },
    { name: 'HR & Hiring', path: '/jobs', icon: Briefcase, requiredAccess: 'jobs' },
  ];

  const hasAccess = (requiredAccess) => {
    if (admin.role === 'superadmin') return true;
    if (requiredAccess === 'all') return true; // Dashboard is usually visible, but data inside is restricted
    return admin.access?.includes(requiredAccess);
  };

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <ShieldCheck size={28} color="#10b981" />
          <h2 style={styles.brand}>Farmart Central</h2>
        </div>

        <div style={styles.adminInfo}>
          <div style={styles.avatar}>{admin.name.charAt(0)}</div>
          <div>
            <div style={styles.adminName}>{admin.name}</div>
            <div style={styles.adminRole}>{admin.role === 'superadmin' ? 'Super Admin' : 'Sub Admin'}</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {navigation.map((item) => {
            if (!hasAccess(item.requiredAccess)) return null;
            return (
              <NavLink 
                key={item.name} 
                to={item.path}
                style={({isActive}) => ({
                  ...styles.navItem,
                  backgroundColor: isActive ? '#1e293b' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent'
                })}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <button onClick={logout} style={styles.logoutBtn}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'Inter, sans-serif'
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column'
  },
  sidebarHeader: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #1e293b'
  },
  brand: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0
  },
  adminInfo: {
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #1e293b'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700'
  },
  adminName: {
    fontSize: '14px',
    fontWeight: '600'
  },
  adminRole: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  nav: {
    padding: '16px 0',
    flex: 1
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 24px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: '0.2s'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderTop: '1px solid #1e293b',
    color: '#ef4444',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'left',
    transition: '0.2s'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  }
};
