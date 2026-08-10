import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import { MessageSquare, Phone, Mail, Clock, MapPin, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function InquiriesPage() {
  const { admin } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/admin/data`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInquiries(data.data.contactInquiries || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (admin.role !== 'superadmin' && !admin.access.includes('inquiries')) {
    // If subadmin doesn't have access, allow superadmin by default
  }

  const filtered = inquiries.filter(inq => 
    (inq.name && inq.name.toLowerCase().includes(search.toLowerCase())) ||
    (inq.phone && inq.phone.includes(search)) ||
    (inq.inquiryType && inq.inquiryType.toLowerCase().includes(search.toLowerCase())) ||
    (inq.message && inq.message.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Contact & Vertical Inquiries</h1>
          <p style={styles.subtitle}>View live user inquiries, leads, and callbacks submitted from the website.</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchData}>
          <RefreshCw size={16} />
          <span>Refresh Data</span>
        </button>
      </header>

      <div style={styles.searchBarBox}>
        <input 
          type="text" 
          placeholder="Search by name, phone, type or message..." 
          style={styles.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={styles.loading}>Loading live inquiries...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyCard}>No inquiries found matching your criteria.</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map(inq => (
            <div key={inq.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.typeBadge}>{inq.inquiryType || 'General Inquiry'}</div>
                <div style={styles.refId}>{inq.id}</div>
              </div>

              <h3 style={styles.userName}>{inq.name}</h3>

              <div style={styles.contactDetails}>
                <div style={styles.detailRow}>
                  <Phone size={14} color="#16a34a" />
                  <span style={styles.detailText}>{inq.phone}</span>
                </div>
                {inq.email && inq.email !== 'N/A' && (
                  <div style={styles.detailRow}>
                    <Mail size={14} color="#0284c7" />
                    <span style={styles.detailText}>{inq.email}</span>
                  </div>
                )}
              </div>

              <div style={styles.messageBox}>
                <MessageSquare size={16} color="#64748b" style={{ marginTop: '2px' }} />
                <p style={styles.messageText}>{inq.message}</p>
              </div>

              <div style={styles.cardFooter}>
                <Clock size={13} color="#94a3b8" />
                <span style={styles.timeText}>
                  {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'Recent'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '15px', color: '#64748b', marginTop: '8px' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' },
  searchBarBox: { marginBottom: '24px' },
  searchInput: { width: '100%', padding: '14px 18px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#ffffff' },
  loading: { padding: '30px', fontSize: '16px', color: '#64748b' },
  emptyCard: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '14px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { backgroundColor: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' },
  refId: { fontSize: '12px', fontWeight: '600', color: '#94a3b8', fontFamily: 'monospace' },
  userName: { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
  contactDetails: { display: 'flex', flexDirection: 'column', gap: '6px' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  detailText: { fontSize: '14px', fontWeight: '600', color: '#334155' },
  messageBox: { display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #f1f5f9' },
  messageText: { fontSize: '14px', color: '#334155', margin: 0, lineHeight: '20px', whiteSpace: 'pre-wrap' },
  cardFooter: { display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: 'auto' },
  timeText: { fontSize: '12px', color: '#94a3b8', fontWeight: '500' }
};
