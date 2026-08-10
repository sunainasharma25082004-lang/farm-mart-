import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { MessageSquare, Phone, Mail, Clock, RefreshCw, Filter, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function InquiriesPage() {
  const { admin } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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

  const categories = [
    { id: 'ALL', label: 'All Inquiries' },
    { id: 'General Inquiry', label: 'General' },
    { id: 'Village Hub Partner', label: 'Village Hub' },
    { id: 'Farmer Group / FPO', label: 'Farmer FPO' },
    { id: 'FOCO Franchise', label: 'FOCO Franchise' },
    { id: 'Bulk B2B Procurement', label: 'Bulk B2B' },
    { id: 'Media / Press', label: 'Media / Press' }
  ];

  const filtered = inquiries.filter(inq => {
    const matchesSearch = 
      (inq.name && inq.name.toLowerCase().includes(search.toLowerCase())) ||
      (inq.phone && inq.phone.includes(search)) ||
      (inq.inquiryType && inq.inquiryType.toLowerCase().includes(search.toLowerCase())) ||
      (inq.message && inq.message.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || (inq.inquiryType && inq.inquiryType.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={styles.page} className="responsive-page-padding">
      <header style={styles.header} className="responsive-flex-header">
        <div>
          <h1 style={styles.title}>Live Website Inquiries & Leads</h1>
          <p style={styles.subtitle}>Manage real-time customer inquiries, partner requests, and regional callbacks.</p>
        </div>
        <button style={styles.refreshBtn} onClick={fetchData}>
          <RefreshCw size={16} />
          <span>Refresh Leads ({inquiries.length})</span>
        </button>
      </header>

      {/* Filter Tabs */}
      <div style={styles.filterRow}>
        <div style={styles.categoryTabs}>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                ...styles.catTab,
                backgroundColor: selectedCategory === cat.id ? '#0f172a' : '#ffffff',
                color: selectedCategory === cat.id ? '#ffffff' : '#64748b',
                borderColor: selectedCategory === cat.id ? '#0f172a' : '#cbd5e1'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.searchBarBox}>
        <input 
          type="text" 
          placeholder="Search by candidate name, phone number, location, or message..." 
          style={styles.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={styles.loading}>Fetching live lead submissions from database...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyCard}>
          <MessageSquare size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>No inquiries found</h3>
          <p style={{ margin: 0, color: '#64748b' }}>Try adjusting your search query or category filter above.</p>
        </div>
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
                <a href={`tel:${inq.phone}`} style={styles.detailRowLink}>
                  <Phone size={15} color="#16a34a" />
                  <span style={styles.detailTextPhone}>{inq.phone}</span>
                </a>
                {inq.email && inq.email !== 'N/A' && (
                  <a href={`mailto:${inq.email}`} style={styles.detailRowLink}>
                    <Mail size={15} color="#0284c7" />
                    <span style={styles.detailTextEmail}>{inq.email}</span>
                  </a>
                )}
              </div>

              <div style={styles.messageBox}>
                <MessageSquare size={16} color="#64748b" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={styles.messageText}>{inq.message}</p>
              </div>

              <div style={styles.cardFooter}>
                <div style={styles.timeWrapper}>
                  <Clock size={13} color="#94a3b8" />
                  <span style={styles.timeText}>
                    {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'Recent'}
                  </span>
                </div>
                <a href={`tel:${inq.phone}`} style={styles.callBtn}>
                  <Phone size={14} />
                  <span>Call Back</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '40px', maxWidth: '1280px', margin: '0 auto', width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '15px', color: '#64748b', marginTop: '6px' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  filterRow: { marginBottom: '20px' },
  categoryTabs: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  catTab: { padding: '8px 16px', borderRadius: '20px', border: '1px solid', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s ease' },
  searchBarBox: { marginBottom: '24px' },
  searchInput: { width: '100%', padding: '14px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  loading: { padding: '40px', fontSize: '16px', color: '#64748b', textAlign: 'center', fontWeight: '600' },
  emptyCard: { backgroundColor: '#ffffff', padding: '60px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '14px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { backgroundColor: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: '800', padding: '4px 12px', borderRadius: '20px' },
  refId: { fontSize: '12px', fontWeight: '700', color: '#94a3b8', fontFamily: 'monospace' },
  userName: { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 },
  contactDetails: { display: 'flex', flexDirection: 'column', gap: '8px' },
  detailRowLink: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  detailTextPhone: { fontSize: '15px', fontWeight: '700', color: '#16a34a' },
  detailTextEmail: { fontSize: '14px', fontWeight: '600', color: '#0284c7' },
  messageBox: { display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #f1f5f9' },
  messageText: { fontSize: '14px', color: '#334155', margin: 0, lineHeight: '20px', whiteSpace: 'pre-wrap', fontWeight: '500' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: 'auto' },
  timeWrapper: { display: 'flex', alignItems: 'center', gap: '6px' },
  timeText: { fontSize: '12px', color: '#94a3b8', fontWeight: '600' },
  callBtn: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#16a34a', color: '#ffffff', padding: '8px 14px', borderRadius: '20px', textDecoration: 'none', fontSize: '12px', fontWeight: '700' }
};
