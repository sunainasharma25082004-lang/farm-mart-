import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  UserCheck,
  Building2,
  Home,
  Utensils,
  Store,
  Briefcase,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import './AdminDashboardPage.css';

export default function AdminDashboardPage({ onNavigateHome }) {
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Initial Mock Submissions Database
  const [applications, setApplications] = useState([
    {
      id: 'FMT-HUB-849201',
      name: 'Ramesh Patel',
      phone: '9876543210',
      email: 'ramesh.patel@gmail.com',
      category: 'Village Hub',
      location: 'Nashik, Maharashtra',
      district: 'Nashik',
      state: 'Maharashtra',
      details: '150 sq.ft shop space available near Gram Panchayat office. 10 years farming background.',
      date: '2026-08-03 14:30',
      status: 'New',
      refCode: 'FMT-HUB-849201'
    },
    {
      id: 'FMT-JOB-918234',
      name: 'Anish Sharma',
      phone: '9812345678',
      email: 'anish.sharma@yahoo.com',
      category: 'Ground Operations',
      location: 'Lucknow, Uttar Pradesh',
      district: 'Lucknow',
      state: 'Uttar Pradesh',
      details: 'Cluster Operations Manager applicant. 5 years experience in rural logistics & FPO aggregation.',
      date: '2026-08-03 13:15',
      status: 'Under Review',
      refCode: 'FMT-JOB-918234'
    },
    {
      id: 'FMT-WOM-349012',
      name: 'Sunita Sharma',
      phone: '9765432109',
      email: 'sunita.patna@gmail.com',
      category: 'Home Restro & Sweets',
      location: 'Patna, Bihar',
      district: 'Patna',
      state: 'Bihar',
      details: 'Nari Shakti applicant. Home kitchen setup ready for traditional thalis & sweets catering.',
      date: '2026-08-03 11:45',
      status: 'Approved',
      refCode: 'FMT-WOM-349012'
    },
    {
      id: 'FMT-FOCO-582910',
      name: 'Amit Verma',
      phone: '9988776655',
      email: 'amit.verma@vermatraders.com',
      category: 'FOCO Franchise',
      location: 'Indore, Madhya Pradesh',
      district: 'Indore',
      state: 'Madhya Pradesh',
      details: '1,200 sq.ft commercial showroom space owned on main highway. Capital investment ready.',
      date: '2026-08-02 17:20',
      status: 'Approved',
      refCode: 'FMT-FOCO-582910'
    },
    {
      id: 'FMT-DIG-739182',
      name: 'Rahul Deshmukh',
      phone: '9123456789',
      email: 'rahul.deshmukh@gmail.com',
      category: 'Digital Partner',
      location: 'Pune, Maharashtra',
      district: 'Pune',
      state: 'Maharashtra',
      details: 'Smartphone digital business partner applicant. Connected with 150 local kirana stores.',
      date: '2026-08-02 15:10',
      status: 'New',
      refCode: 'FMT-DIG-739182'
    },
    {
      id: 'FMT-FAR-410293',
      name: 'Vikram Singh',
      phone: '9456789012',
      email: 'vikram.kisan@gmail.com',
      category: 'Farmer Network',
      location: 'Karnal, Haryana',
      district: 'Karnal',
      state: 'Haryana',
      details: '25-acre organic vegetable & wheat farm group leader. Seeking direct farm-gate procurement.',
      date: '2026-08-02 10:05',
      status: 'Contacted',
      refCode: 'FMT-FAR-410293'
    }
  ]);

  // Status Filter options
  const filterTabs = [
    { label: 'All Submissions', val: 'all' },
    { label: '🔴 New Inquiries', val: 'New' },
    { label: '⏳ Under Review', val: 'Under Review' },
    { label: '🟢 Approved Partners', val: 'Approved' },
    { label: '📞 Contacted', val: 'Contacted' }
  ];

  // Category Filter Options
  const categoriesList = [
    { label: 'All Categories', val: 'all' },
    { label: '🌾 Village Hub', val: 'Village Hub' },
    { label: '💼 Ground Operations', val: 'Ground Operations' },
    { label: '👩‍🍳 Home Restro & Sweets', val: 'Home Restro & Sweets' },
    { label: '🏪 FOCO Franchise', val: 'FOCO Franchise' },
    { label: '📲 Digital Partner', val: 'Digital Partner' },
    { label: '🚜 Farmer Network', val: 'Farmer Network' }
  ];

  // Filtered Logic
  const filteredApps = applications.filter((app) => {
    const matchesStatus = activeFilterTab === 'all' || app.status === activeFilterTab;
    const matchesCategory = activeCategoryFilter === 'all' || app.category === activeCategoryFilter;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Action handlers
  const handleUpdateStatus = (appId, newStatus) => {
    setApplications(
      applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    if (selectedApplication && selectedApplication.id === appId) {
      setSelectedApplication({ ...selectedApplication, status: newStatus });
    }
  };

  const handleSimulateNewApplication = () => {
    const randomId = 'FMT-HUB-' + Math.floor(100000 + Math.random() * 900000);
    const newApp = {
      id: randomId,
      name: 'Sunil Kumar',
      phone: '987' + Math.floor(1000000 + Math.random() * 9000000),
      email: 'sunil.kumar@gmail.com',
      category: 'Village Hub',
      location: 'Varanasi, Uttar Pradesh',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
      details: 'Gram Panchayat applicant with 180 sq.ft space available for local aggregation.',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'New',
      refCode: randomId
    };
    setApplications([newApp, ...applications]);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Phone,Email,Category,Location,Status,Date\n';
    const rows = applications
      .map((a) => `"${a.id}","${a.name}","${a.phone}","${a.email}","${a.category}","${a.location}","${a.status}","${a.date}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Farmart_Applications_Report_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Top Admin Navigation Header */}
      <header className="admin-header">
        <div className="container admin-header-container">
          <div className="admin-brand">
            <ShieldCheck size={28} className="admin-shield-icon" />
            <div>
              <h2 className="admin-brand-title">Farmart Central Admin Portal</h2>
              <span className="admin-brand-sub">Real-Time Inquiries & Applications Management</span>
            </div>
          </div>

          <div className="admin-top-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleSimulateNewApplication}>
              <Plus size={16} />
              <span>Simulate New Inquiry</span>
            </button>

            <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
              <Download size={16} />
              <span>Export CSV Report</span>
            </button>

            <button className="btn btn-earth btn-sm" onClick={onNavigateHome}>
              <span>Exit Admin Portal</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <main className="admin-main section-padding">
        <div className="container">
          {/* Key Metric Overview Cards */}
          <div className="admin-metrics-grid">
            <div className="admin-stat-card">
              <div className="stat-icon-circle green">
                <Users size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-val">{applications.length}</span>
                <span className="stat-lbl">Total Applications Received</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-circle red">
                <Clock size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-val">
                  {applications.filter((a) => a.status === 'New').length}
                </span>
                <span className="stat-lbl">New Action Required</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-circle green">
                <Home size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-val">
                  {applications.filter((a) => a.category === 'Village Hub').length}
                </span>
                <span className="stat-lbl">Village Hub Applications</span>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon-circle amber">
                <Store size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-val">
                  {applications.filter((a) => a.category === 'FOCO Franchise').length}
                </span>
                <span className="stat-lbl">FOCO Franchise Inquiries</span>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="admin-control-bar">
            {/* Status Tabs */}
            <div className="status-filter-tabs">
              {filterTabs.map((tab) => (
                <button
                  key={tab.val}
                  className={`status-tab-btn ${activeFilterTab === tab.val ? 'active' : ''}`}
                  onClick={() => setActiveFilterTab(tab.val)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category Select & Search */}
            <div className="bar-search-group">
              <select
                className="admin-select-filter"
                value={activeCategoryFilter}
                onChange={(e) => setActiveCategoryFilter(e.target.value)}
              >
                {categoriesList.map((cat) => (
                  <option key={cat.val} value={cat.val}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <div className="admin-search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search name, phone, district, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Applications Data Table */}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Application Ref ID</th>
                  <th>Applicant Name</th>
                  <th>Category / Vertical</th>
                  <th>Location & State</th>
                  <th>Mobile Number</th>
                  <th>Date & Time</th>
                  <th>Current Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-table-msg">
                      No applications found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="table-row-item">
                      <td>
                        <span className="table-ref-code">{app.id}</span>
                      </td>
                      <td>
                        <strong className="table-applicant-name">{app.name}</strong>
                      </td>
                      <td>
                        <span className="table-category-pill">{app.category}</span>
                      </td>
                      <td>
                        <span className="table-location"><MapPin size={13} /> {app.location}</span>
                      </td>
                      <td>
                        <span className="table-phone"><Phone size={13} /> {app.phone}</span>
                      </td>
                      <td>
                        <span className="table-date"><Calendar size={13} /> {app.date}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${app.status.toLowerCase().replace(' ', '-')}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-table-action"
                          onClick={() => setSelectedApplication(app)}
                        >
                          <Eye size={15} />
                          <span>View & Update</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Application Detail View & Status Update Modal */}
      {selectedApplication && (
        <div className="admin-modal-overlay" onClick={() => setSelectedApplication(null)}>
          <div className="admin-modal-container scale-up-animated" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="modal-ref-tag">{selectedApplication.id}</span>
                <h3>{selectedApplication.name} — {selectedApplication.category}</h3>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedApplication(null)}>
                <XCircle size={24} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Applicant Info Cards Grid */}
              <div className="modal-info-grid">
                <div className="info-box-item">
                  <span className="lbl"><UserCheck size={14} /> Full Name</span>
                  <strong className="val">{selectedApplication.name}</strong>
                </div>

                <div className="info-box-item">
                  <span className="lbl"><Phone size={14} /> Mobile Phone</span>
                  <strong className="val">{selectedApplication.phone}</strong>
                </div>

                <div className="info-box-item">
                  <span className="lbl"><Mail size={14} /> Email Address</span>
                  <strong className="val">{selectedApplication.email || 'N/A'}</strong>
                </div>

                <div className="info-box-item">
                  <span className="lbl"><MapPin size={14} /> District & State</span>
                  <strong className="val">{selectedApplication.location}</strong>
                </div>
              </div>

              {/* Form Input Details Box */}
              <div className="modal-details-card">
                <h4>Submission Details & Notes:</h4>
                <p>{selectedApplication.details || 'Basic partner registration form submitted via website portal.'}</p>
              </div>

              {/* Quick Status Update Bar */}
              <div className="modal-status-update-bar">
                <span className="update-lbl">Update Application Status:</span>
                <div className="status-btn-group">
                  <button
                    className={`status-action-btn btn-new ${selectedApplication.status === 'New' ? 'active-status' : ''}`}
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'New')}
                  >
                    🔴 New
                  </button>

                  <button
                    className={`status-action-btn btn-review ${selectedApplication.status === 'Under Review' ? 'active-status' : ''}`}
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'Under Review')}
                  >
                    ⏳ Under Review
                  </button>

                  <button
                    className={`status-action-btn btn-contacted ${selectedApplication.status === 'Contacted' ? 'active-status' : ''}`}
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'Contacted')}
                  >
                    📞 Contacted
                  </button>

                  <button
                    className={`status-action-btn btn-approve ${selectedApplication.status === 'Approved' ? 'active-status' : ''}`}
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'Approved')}
                  >
                    🟢 Approve Partner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
