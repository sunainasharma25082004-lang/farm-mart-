import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  X,
  Upload,
  Search,
  Building2,
  TrendingUp,
  Award,
  Heart,
  User,
  Mail,
  Phone,
  Globe,
  Sparkles,
  GraduationCap,
  FileText,
  DollarSign,
  ShieldCheck,
  Check
} from 'lucide-react';
import './CareersPage.css';

export default function CareersPage({ onOpenContact }) {
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [jobFormData, setJobFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    qualification: '',
    linkedin: '',
    notes: ''
  });

  const [promoterFormData, setPromoterFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    selectedRole: '', // Dropdown for role
    experience: ''
  });
  const [promoterSubmitted, setPromoterSubmitted] = useState(false);

  // 6 Hiring Category Openings
  const jobRoles = [
    {
      id: 'job-3',
      title: 'Cluster Operations Manager — Village Hubs',
      category: 'Ground Operations',
      location: 'Lucknow / Bhopal / Indore / Patna',
      type: 'Full-Time (Ground Operations)',
      exp: '4+ Years',
      salary: '₹6.5 - ₹9.5 LPA + Incentives',
      coverImg: '/village_hub.png',
      desc: 'Lead multi-Panchayat Gram Panchayat aggregation centers, manage morning crop weighing logistics, oversee 24-hr payouts, and coordinate with 50+ local Village Hub leaders.',
      skills: ['Rural Ground Operations', 'Gram Panchayat Network', 'Crop Quality Assurance', 'Logistics Dispatch'],
      responsibilities: [
        'Establish and monitor 50+ Gram Panchayat Village Hub centers across designated ground clusters.',
        'Ensure 100% digital weighment accuracy and 12-hour direct farm-gate procurement turnaround.',
        'Conduct weekly onboarding & ground training workshops for Village Hub coordinators.',
        'Coordinate zero-loss cold-chain dispatch to city wholesale supermarts and FOCO stores.'
      ]
    },
    {
      id: 'job-1',
      title: 'Regional Growth Director',
      category: 'Leadership Opportunities',
      location: 'Bengaluru / Pune (Hybrid)',
      type: 'Full-Time',
      exp: '7+ Years',
      salary: '₹18 - ₹25 LPA + ESOPs',
      coverImg: '/farmart_store_hero.jpg',
      desc: 'Lead multi-district business growth, B2B procurement scaling, and regional cluster leadership across India.',
      skills: ['Territory Management', 'Agri Supply Chain', 'Strategic Partnerships'],
      responsibilities: [
        'Drive multi-district expansion across 5,000+ new Village Hub locations.',
        'Manage regional P&L and partner directly with FPO state leadership.',
        'Scale city-level wholesale supermarts and FOCO retail distribution.'
      ]
    },
    {
      id: 'job-2',
      title: 'City Business Development Lead',
      category: 'Business Opportunities',
      location: 'Nashik / Patna / Chandigarh',
      type: 'Full-Time',
      exp: '3+ Years',
      salary: '₹5.5 - ₹8.0 LPA + Commission',
      coverImg: '/dmart_hero.png',
      desc: 'Expand Digital Partner and FOCO Franchise networks across tier-2 & tier-3 urban retail markets.',
      skills: ['B2B Sales', 'Franchise Onboarding', 'Vendor Management'],
      responsibilities: [
        'Identify premium retail locations for FOCO franchise expansion.',
        'Onboard 200+ Digital Business Partners monthly.',
        'Drive localized community marketing campaigns.'
      ]
    },
    {
      id: 'job-4',
      title: 'Senior Agri-Tech Software Engineer',
      category: 'Corporate Roles',
      location: 'Bengaluru, KA',
      type: 'Full-Time',
      exp: '4+ Years',
      salary: '₹14 - ₹22 LPA',
      coverImg: '/hero.png',
      desc: 'Architect Kisan App IoT sensor software, automated pricing APIs, and logistics dispatch engines.',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Cloud Infrastructure'],
      responsibilities: [
        'Develop real-time Kisan App weighment & payout engine.',
        'Optimize low-latency offline sync for rural mobile networks.',
        'Build automated inventory ERP for FOCO supermarts.'
      ]
    },
    {
      id: 'job-5',
      title: 'District Nari Shakti Lead',
      category: 'Leadership Opportunities',
      location: 'Patna / Varanasi',
      type: 'Full-Time',
      exp: '5+ Years',
      salary: '₹8.0 - ₹12.0 LPA',
      coverImg: '/women_chef.png',
      desc: 'Drive enablement, micro-business training, and sales for 500+ Women Entrepreneurs & SHGs.',
      skills: ['SHG Management', 'Community Building', 'Financial Inclusion'],
      responsibilities: [
        'Train & mentor 500+ women home chefs and bakers.',
        'Facilitate SHG micro-credit access and FSSAI certifications.',
        'Expand regional Home Restro marketplace distribution.'
      ]
    },
    {
      id: 'job-6',
      title: 'Supply Chain & Cold Storage Officer',
      category: 'Ground Operations',
      location: 'Karnal / Nashik',
      type: 'Full-Time',
      exp: '2+ Years',
      salary: '₹4.0 - ₹6.5 LPA',
      coverImg: '/produce.png',
      desc: 'Manage temperature-controlled warehouses, batch traceability, and dry storage inventory.',
      skills: ['Cold Chain Logistics', 'Inventory ERP', 'Warehouse Audit'],
      responsibilities: [
        'Maintain zero-spoilage cold storage facilities for fresh produce.',
        'Manage fleet routing for 12-hour doorstep deliveries.',
        'Execute daily quality audits and RFID batch tagging.'
      ]
    }
  ];

  const whyJoinChecklist = [
    'Mission-Driven Work: Direct impact on 50,000+ smallholder farmers across Bharat.',
    'Fast-Track Career Growth: Rapid advancement opportunities in a high-growth agri-tech platform.',
    'Competitive Compensation: Industry-leading salaries, health insurance, and performance bonuses.',
    'Continuous Learning & Certification: Corporate training, agronomist masterclasses, and executive coaching.',
    'Inclusive & Empowering Culture: Equal opportunity workplace celebrating diversity and community trust.',
    'Modern Tech Infrastructure: Exposure to IoT, AI harvest grading, and enterprise cloud software.'
  ];

  const hiringSteps = [
    { step: '01', title: 'Online Application', desc: 'Submit your resume and details online.' },
    { step: '02', title: 'Profile Screening', desc: 'HR team reviews candidate fit & background.' },
    { step: '03', title: 'Interview', desc: 'Technical & cultural alignment discussions.' },
    { step: '04', title: 'Training', desc: 'Comprehensive onboarding & domain orientation.' },
    { step: '05', title: 'Joining', desc: 'Welcome to the Farmart family!' }
  ];

  const filteredJobs = jobRoles.filter((j) => {
    const matchesTab = activeCategoryTab === 'all' || j.category === activeCategoryTab;
    const matchesSearch =
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/apply-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          jobTitle: selectedJob.title,
          ...jobFormData,
          resumeName
        })
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.message || 'Something went wrong while submitting.');
      }
    } catch (error) {
      console.error(error);
      alert('Could not connect to server. Ensure backend is running.');
    }
  };

  const handlePromoterSubmit = async (e) => {
    e.preventDefault();
    if (!promoterFormData.selectedRole) {
      alert("Please select a role you are applying for.");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/apply-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: 'promoter-01',
          jobTitle: `Growth Promoter - ${promoterFormData.selectedRole}`,
          fullName: promoterFormData.fullName,
          phone: promoterFormData.phone,
          location: promoterFormData.location,
          experience: promoterFormData.experience,
          email: 'N/A', // email not required in this quick form
          resumeName: 'Will provide later'
        })
      });
      const data = await response.json();
      if (data.success) {
        setPromoterSubmitted(true);
      } else {
        alert(data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error(error);
      alert('Could not connect to server.');
    }
  };

  return (
    <div className="careers-page-wrapper">
      {/* 1. Hero Banner */}
      <section className="careers-hero-section">
        <div className="container">
          <div className="careers-hero-card">
            <div className="careers-badge">
              <Briefcase size={16} />
              <span>Career Opportunities at Farmart</span>
            </div>
            <h1 className="careers-hero-title">Join Our Team. Build Your Future.</h1>
            <p className="careers-hero-desc">
              Be a catalyst for agricultural transformation. Join a passionate team empowering 50,000+ farmers and building Bharat's premier community commerce grid.
            </p>
          </div>
        </div>
      </section>

      {/* Embedded Promoter Form Section */}
      <section className="promoter-embedded-section section-padding" style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div className="promoter-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
            
            <div className="promoter-info">
              <div className="badge-tag" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0e7ff', color: '#4f46e5', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                <TrendingUp size={16} />
                <span>Premium Opportunity</span>
              </div>
              <h2 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '16px', lineHeight: '1.3' }}>Farmart Growth Development Promoter</h2>
              <p style={{ fontSize: '16px', color: '#475569', marginBottom: '24px', lineHeight: '1.6' }}>
                Join our elite owner-led hiring program. We are hiring Management Teams to oversee multiple fast-growing sectors across our ecosystem. Enjoy fixed salaries coupled with lucrative performance-based incentives.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, gap: '12px', display: 'flex', flexDirection: 'column', color: '#334155', fontSize: '15px' }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle2 size={18} color="#16a34a" /> Manage large-scale operations</li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle2 size={18} color="#16a34a" /> Fixed Salary + High Incentives</li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><CheckCircle2 size={18} color="#16a34a" /> Direct reporting to core leadership</li>
              </ul>
            </div>

            <div className="promoter-form-card" style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
              {promoterSubmitted ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <CheckCircle2 size={56} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>Application Received!</h3>
                  <p style={{ color: '#64748b' }}>We will review your profile and contact you soon.</p>
                </div>
              ) : (
                <form onSubmit={handlePromoterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>Apply Now</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Apply For Role *</label>
                    <select 
                      required 
                      value={promoterFormData.selectedRole}
                      onChange={(e) => setPromoterFormData({...promoterFormData, selectedRole: e.target.value})}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', color: '#0f172a', background: '#f8fafc' }}
                    >
                      <option value="" disabled>-- Select Management Role --</option>
                      <option value="Delivery Team Management">Delivery Team Management</option>
                      <option value="Village Hub Operations">Village Hub Operations</option>
                      <option value="B2B Supply Chain Leads">B2B Supply Chain Leads</option>
                      <option value="Franchise Growth Management">Franchise Growth Management</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Full Name *</label>
                      <input type="text" required placeholder="Ramesh Patel" value={promoterFormData.fullName} onChange={(e) => setPromoterFormData({...promoterFormData, fullName: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Phone *</label>
                      <input type="tel" required placeholder="9876543210" value={promoterFormData.phone} onChange={(e) => setPromoterFormData({...promoterFormData, phone: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>City *</label>
                      <input type="text" required placeholder="Lucknow" value={promoterFormData.location} onChange={(e) => setPromoterFormData({...promoterFormData, location: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Experience *</label>
                      <input type="text" required placeholder="e.g. 5 Years" value={promoterFormData.experience} onChange={(e) => setPromoterFormData({...promoterFormData, experience: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px' }} />
                    </div>
                  </div>

                  <button type="submit" style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
                    Submit Application
                  </button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      </section>

      {/* 2. We're Hiring (Filter Tabs & Search) */}
      <section className="hiring-categories-section section-padding">
        <div className="container">
          <div className="section-header">
            <div className="badge-tag">
              <Building2 size={16} />
              <span>Explore Divisions</span>
            </div>
            <h2>We're Hiring</h2>
            <p>Select a category or search for open opportunities across India.</p>
          </div>

          <div className="category-tabs-grid">
            <button
              className={`cat-tab-btn ${activeCategoryTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('all')}
            >
              All Openings ({jobRoles.length})
            </button>
            <button
              className={`cat-tab-btn ${activeCategoryTab === 'Ground Operations' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('Ground Operations')}
            >
              Ground Operations
            </button>
            <button
              className={`cat-tab-btn ${activeCategoryTab === 'Leadership Opportunities' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('Leadership Opportunities')}
            >
              Leadership Opportunities
            </button>
            <button
              className={`cat-tab-btn ${activeCategoryTab === 'Business Opportunities' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('Business Opportunities')}
            >
              Business Opportunities
            </button>
            <button
              className={`cat-tab-btn ${activeCategoryTab === 'Corporate Roles' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('Corporate Roles')}
            >
              Corporate & Tech
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="job-search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by role title (e.g. Cluster Operations Manager), city, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Jobs List Grid */}
          <div className="jobs-list-grid">
            {filteredJobs.map((job) => (
              <div key={job.id} className="job-opening-card">
                <div className="job-card-banner-img">
                  <img src={job.coverImg} alt={job.title} />
                  <span className="job-cat-badge">{job.category}</span>
                </div>

                <div className="job-card-content">
                  <h3 className="job-title">{job.title}</h3>
                  
                  <div className="job-meta-row">
                    <span className="meta-item"><MapPin size={14} /> {job.location}</span>
                    <span className="meta-item"><Clock size={14} /> {job.type}</span>
                    <span className="meta-item"><Briefcase size={14} /> {job.exp}</span>
                  </div>

                  <p className="job-desc">{job.desc}</p>

                  <div className="job-skills-row">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="skill-pill">{skill}</span>
                    ))}
                  </div>

                  <button
                    className="btn btn-earth apply-job-btn"
                    onClick={() => {
                      setSelectedJob(job);
                      setSubmitted(false);
                      setResumeName('');
                      setJobFormData({ fullName: '', email: '', phone: '', location: '', experience: '', qualification: '', linkedin: '', notes: '' });
                    }}
                  >
                    <span>Apply for this Position</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why Join Farmart */}
      <section className="why-join-section section-padding">
        <div className="container">
          <div className="section-header">
            <div className="badge-tag">
              <Award size={16} />
              <span>Culture & Benefits</span>
            </div>
            <h2>Why Join Farmart</h2>
            <p>Creating an empowering workplace where performance and community impact go hand in hand.</p>
          </div>

          <div className="why-join-grid">
            {whyJoinChecklist.map((item, idx) => (
              <div key={idx} className="why-join-card">
                <CheckCircle2 size={22} className="join-check" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Hiring Process */}
      <section className="hiring-process-section section-padding">
        <div className="container">
          <div className="section-header">
            <div className="badge-tag">
              <TrendingUp size={16} />
              <span>5-Step Selection</span>
            </div>
            <h2>Our Hiring Process</h2>
            <p>Transparent and structured recruitment journey from application to day one.</p>
          </div>

          <div className="process-timeline-row">
            {hiringSteps.map((step, idx) => (
              <div key={idx} className="process-step-box">
                <div className="process-step-num">{step.step}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ultra-Modern Split-Card Job Application Modal */}
      {selectedJob && (
        <div className="careers-modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="careers-modal-container split-modal-animated" onClick={(e) => e.stopPropagation()}>
            
            {/* Top Close Button */}
            <button className="split-modal-close" onClick={() => setSelectedJob(null)} aria-label="Close modal">
              <X size={22} />
            </button>

            {/* Split Grid: Left Role Info Panel & Right Form Panel */}
            <div className="split-modal-grid">
              
              {/* Left Panel: Role Showcase & Details */}
              <div className="split-left-panel">
                <div className="left-panel-badge">
                  <Briefcase size={14} />
                  <span>{selectedJob.category}</span>
                </div>

                <h2 className="left-job-title">{selectedJob.title}</h2>

                <div className="left-meta-list">
                  <div className="meta-pill"><MapPin size={14} /> {selectedJob.location}</div>
                  <div className="meta-pill"><Clock size={14} /> {selectedJob.type}</div>
                  <div className="meta-pill"><Briefcase size={14} /> {selectedJob.exp} Experience</div>
                  {selectedJob.salary && (
                    <div className="meta-pill salary-pill"><DollarSign size={14} /> {selectedJob.salary}</div>
                  )}
                </div>

                <div className="left-responsibilities-box">
                  <h4><ShieldCheck size={16} /> Key Responsibilities:</h4>
                  <ul>
                    {selectedJob.responsibilities ? (
                      selectedJob.responsibilities.map((resp, idx) => (
                        <li key={idx}><Check size={14} className="green-check" /> <span>{resp}</span></li>
                      ))
                    ) : (
                      <li><Check size={14} className="green-check" /> <span>{selectedJob.desc}</span></li>
                    )}
                  </ul>
                </div>

                <div className="left-footer-note">
                  <Sparkles size={16} />
                  <span>Farmart is an Equal Opportunity Employer • Fast-Track Hiring</span>
                </div>
              </div>

              {/* Right Panel: Application Form */}
              <div className="split-right-panel">
                {submitted ? (
                  <div className="split-success-box">
                    <div className="success-icon-ring">
                      <CheckCircle2 size={56} />
                    </div>
                    <h3>Candidate Application Received!</h3>
                    <p>
                      Thank you for applying for <strong>{selectedJob.title}</strong>. Our Talent Acquisition team will review your application and contact you within 2 business days.
                    </p>
                    <div className="split-ref-tag">Application Ref: FMT-JOB-{Math.floor(100000 + Math.random() * 900000)}</div>
                    <button className="btn btn-secondary" onClick={() => setSelectedJob(null)}>
                      Close Application
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleJobSubmit} className="split-app-form">
                    <div className="form-head-block">
                      <h3>Candidate Application</h3>
                      <p>Fill out your details below to apply for <strong>{selectedJob.title}</strong>.</p>
                    </div>

                    <div className="split-form-fields">
                      <div className="styled-input-box">
                        <label><User size={14} /> Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Patel"
                          value={jobFormData.fullName}
                          onChange={(e) => setJobFormData({ ...jobFormData, fullName: e.target.value })}
                        />
                      </div>

                      <div className="styled-input-box">
                        <label><Phone size={14} /> Mobile Number (WhatsApp) *</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={jobFormData.phone}
                          onChange={(e) => setJobFormData({ ...jobFormData, phone: e.target.value })}
                        />
                      </div>

                      <div className="styled-input-box">
                        <label><Mail size={14} /> Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. ramesh@example.com"
                          value={jobFormData.email}
                          onChange={(e) => setJobFormData({ ...jobFormData, email: e.target.value })}
                        />
                      </div>

                      <div className="styled-input-box">
                        <label><MapPin size={14} /> Current City / Location *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lucknow / Bhopal / Patna"
                          value={jobFormData.location}
                          onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                        />
                      </div>

                      <div className="styled-input-box">
                        <label><Briefcase size={14} /> Experience in Operations (Years) *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 4+ Years Operations"
                          value={jobFormData.experience}
                          onChange={(e) => setJobFormData({ ...jobFormData, experience: e.target.value })}
                        />
                      </div>

                      <div className="styled-input-box">
                        <label><GraduationCap size={14} /> Highest Degree / Qualification *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. B.Sc Agriculture / MBA / Graduate"
                          value={jobFormData.qualification}
                          onChange={(e) => setJobFormData({ ...jobFormData, qualification: e.target.value })}
                        />
                      </div>

                      {/* Resume Upload Box */}
                      <div className="styled-input-box full-width-box">
                        <label><Upload size={14} /> Upload CV / Resume (PDF / DOCX) *</label>
                        <div className="stylish-upload-zone">
                          <Upload size={26} className="upload-green-icon" />
                          <input
                            type="file"
                            accept=".pdf,.docx,.doc"
                            required
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                setResumeName(e.target.files[0].name);
                              }
                            }}
                          />
                          <span className="upload-text-label">
                            {resumeName ? `Selected CV: ${resumeName}` : '📄 Click to select CV or drag & drop file here'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-earth split-submit-btn">
                      <Send size={18} />
                      <span>Submit Candidate Application</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
