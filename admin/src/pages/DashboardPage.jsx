import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { admin } = useAuth();
  const [data, setData] = useState(null);
  
  // Create Sub Admin State
  const [newSubAdmin, setNewSubAdmin] = useState({
    name: '',
    username: '',
    password: '',
    access: []
  });
  const [createMsg, setCreateMsg] = useState('');

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/data');
      const res = await response.json();
      if (res.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAccessToggle = (module) => {
    if (newSubAdmin.access.includes(module)) {
      setNewSubAdmin({ ...newSubAdmin, access: newSubAdmin.access.filter(m => m !== module) });
    } else {
      setNewSubAdmin({ ...newSubAdmin, access: [...newSubAdmin.access, module] });
    }
  };

  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/create-subadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubAdmin)
      });
      const res = await response.json();
      if (res.success) {
        setCreateMsg('Sub Admin created successfully!');
        setNewSubAdmin({ name: '', username: '', password: '', access: [] });
        setTimeout(() => setCreateMsg(''), 3000);
      } else {
        alert(res.message);
      }
    } catch (e) {
      alert('Error creating Sub Admin');
    }
  };

  if (!data) return <div style={styles.loading}>Loading Dashboard...</div>;

  const accessOptions = [
    { id: 'users', label: 'App Users Management' },
    { id: 'partners', label: 'Partner Approvals (FOCO/Hubs)' },
    { id: 'riders', label: 'Delivery Fleet Management' },
    { id: 'jobs', label: 'HR / Candidate Recruitment' }
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome back, {admin.name}</h1>
        <p style={styles.subtitle}>Here's an overview of the Farmart Ecosystem.</p>
      </header>

      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>App Users</div>
          <div style={styles.metricValue}>{data.users.length}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Partner Apps</div>
          <div style={styles.metricValue}>{data.applications.length}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Job Candidates</div>
          <div style={styles.metricValue}>{data.jobApplications.length}</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Inquiries</div>
          <div style={styles.metricValue}>{data.contactInquiries.length}</div>
        </div>
      </div>

      {/* Super Admin Only: Manage Staff */}
      {admin.role === 'superadmin' && (
        <div style={styles.adminControlPanel}>
          <div style={styles.panelHeader}>
            <ShieldCheck size={24} color="#10b981" />
            <h2 style={styles.panelTitle}>Super Admin Control: Create Sub Admin</h2>
          </div>
          
          <form onSubmit={handleCreateSubAdmin} style={styles.form}>
            {createMsg && <div style={styles.successMsg}><CheckCircle2 size={16} /> {createMsg}</div>}
            
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input required type="text" style={styles.input} value={newSubAdmin.name} onChange={e => setNewSubAdmin({...newSubAdmin, name: e.target.value})} placeholder="e.g. Rahul Manager" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Login Username</label>
                <input required type="text" style={styles.input} value={newSubAdmin.username} onChange={e => setNewSubAdmin({...newSubAdmin, username: e.target.value})} placeholder="e.g. rahul_hr" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Login Password</label>
                <input required type="text" style={styles.input} value={newSubAdmin.password} onChange={e => setNewSubAdmin({...newSubAdmin, password: e.target.value})} placeholder="Set password" />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Assign Departments (Access Control)</label>
              <div style={styles.checkboxGrid}>
                {accessOptions.map(opt => (
                  <label key={opt.id} style={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={newSubAdmin.access.includes(opt.id)}
                      onChange={() => handleAccessToggle(opt.id)}
                      style={styles.checkbox}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" style={styles.submitBtn}>
              <Plus size={18} />
              <span>Create Sub Admin Account</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' },
  loading: { padding: '40px', fontSize: '18px', color: '#64748b' },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '15px', color: '#64748b', marginTop: '8px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' },
  metricCard: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' },
  metricLabel: { fontSize: '13px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  metricValue: { fontSize: '36px', fontWeight: '800', color: '#0f172a', marginTop: '8px' },
  adminControlPanel: { backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' },
  panelHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' },
  panelTitle: { fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  successMsg: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '8px', fontSize: '14px', fontWeight: '600' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#334155' },
  input: { padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none' },
  checkboxGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#475569', cursor: 'pointer', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  checkbox: { width: '18px', height: '18px', accentColor: '#10b981' },
  submitBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', color: '#ffffff', padding: '14px 24px', borderRadius: '8px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '8px' }
};
