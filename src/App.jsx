import './App.css';

// ============================================================================
// FARMART WEBSITE - COMING SOON VIEW
// ============================================================================
export default function App() {
  return (
    <main className="coming-soon-wrapper" aria-label="Farmart Coming Soon">
      {/* Ambient background glows */}
      <div className="ambient-backdrop" aria-hidden="true">
        <div className="glow-orb orb-primary"></div>
        <div className="glow-orb orb-secondary"></div>
      </div>

      {/* Center Coming Soon Card */}
      <div className="coming-soon-card">
        <div className="brand-badge-container">
          <img
            src="/updated-logo.jpeg"
            alt="Farmart Logo"
            className="brand-logo-img"
          />
          <span className="live-status-pill">
            <span className="pulsing-dot"></span>
            COMING SOON
          </span>
        </div>

        <h1 className="coming-soon-headline">
          <span className="brand-name-accent">Farmart</span>
          <span className="status-text">Coming Soon</span>
        </h1>

        <p className="coming-soon-tagline">
          Empowering Farmers &bull; Building Communities &bull; Growing Bharat
        </p>

        <div className="coming-soon-divider"></div>

        <p className="coming-soon-subtext">
          Our digital platform is currently undergoing scheduled development and upgrades.
          <br />
          We will be launching soon with an enhanced experience!
        </p>

        <div className="coming-soon-footer">
          &copy; {new Date().getFullYear()} Farmart. All rights reserved.
        </div>
      </div>
    </main>
  );
}

/*
================================================================================
PREVIOUS WEBSITE CODE (PRESERVED & COMMENTED OUT AS REQUESTED)
================================================================================

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EcosystemGrid from './components/EcosystemGrid';
import CategoryDetailModal from './components/CategoryDetailModal';
import ServicesShowcaseModal from './components/ServicesShowcaseModal';
import VisualGallerySection from './components/VisualGallerySection';
import PartnerSuccessStoriesSection from './components/PartnerSuccessStoriesSection';
import FloatingQuickNav from './components/FloatingQuickNav';
import AboutSection from './components/AboutSection';
import AboutPage from './components/AboutPage';
import MissionVisionPage from './components/MissionVisionPage';
import EcosystemPage from './components/EcosystemPage';
import VillageHubPage from './components/VillageHubPage';
import GrowthPartnerPage from './components/GrowthPartnerPage';
import FarmerNetworkPage from './components/FarmerNetworkPage';
import WomenEntrepreneurPage from './components/WomenEntrepreneurPage';
import DigitalPartnerPage from './components/DigitalPartnerPage';
import HomeRestroPage from './components/HomeRestroPage';
import FocoFranchisePage from './components/FocoFranchisePage';
import DreamRewardsPage from './components/DreamRewardsPage';
import CareersPage from './components/CareersPage';
import FaqPage from './components/FaqPage';
import ContactPage from './components/ContactPage';
import AdminDashboardPage from './components/AdminDashboardPage';
import ImpactCalculator from './components/ImpactCalculator';
import CareersSection from './components/CareersSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import { categoriesData } from './data/categories';

export function OriginalFarmartWebsite() {
  const [currentView, setCurrentView] = useState('home'); 
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showServicesShowcase, setShowServicesShowcase] = useState(false);

  const handleExploreClick = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const ecosystemEl = document.getElementById('ecosystem');
        if (ecosystemEl) ecosystemEl.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const ecosystemEl = document.getElementById('ecosystem');
      if (ecosystemEl) ecosystemEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenContact = () => {
    setCurrentView('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (viewName, targetId) => {
    const pageViews = [
      'about',
      'mission',
      'ecosystem',
      'village-hub',
      'growth-partner',
      'farmer-network',
      'women-entrepreneur',
      'digital-partner',
      'home-restro',
      'foco-franchise',
      'dream-rewards',
      'careers',
      'faq',
      'contact',
      'admin'
    ];

    if (pageViews.includes(viewName)) {
      setCurrentView(viewName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleSelectCategory = (cat) => {
    const routeMap = {
      'village-hub': 'village-hub',
      'growth-partner': 'growth-partner',
      'farmer-network': 'farmer-network',
      'women-entrepreneur': 'women-entrepreneur',
      'digital-business-partner': 'digital-partner',
      'home-restro': 'home-restro',
      'foco-franchise': 'foco-franchise',
      'dream-rewards': 'dream-rewards'
    };

    const targetId = typeof cat === 'string' ? cat : cat.id;

    if (routeMap[targetId]) {
      setCurrentView(routeMap[targetId]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const found = categoriesData.find(c => c.id === targetId);
      if (found) {
        setSelectedCategory(found);
      }
    }
  };

  const handleOpenCategoryById = (categoryId) => {
    handleSelectCategory(categoryId);
  };

  return (
    <div className="farmart-app">
      {currentView !== 'admin' && (
        <Navbar
          currentView={currentView}
          onNavClick={handleNavClick}
          onOpenContact={handleOpenContact}
          onOpenAdmin={handleOpenAdmin}
        />
      )}

      <main>
        {currentView === 'admin' && (
          <AdminDashboardPage
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'about' && (
          <AboutPage
            onNavigateToHome={handleExploreClick}
            onOpenContact={handleOpenContact}
          />
        )}

        {currentView === 'mission' && (
          <MissionVisionPage
            onNavigateToHome={handleExploreClick}
            onOpenContact={handleOpenContact}
          />
        )}

        {currentView === 'ecosystem' && (
          <EcosystemPage
            categories={categoriesData}
            onSelectCategory={handleSelectCategory}
            onOpenContact={handleOpenContact}
          />
        )}

        {currentView === 'village-hub' && (
          <VillageHubPage
            onOpenContact={handleOpenContact}
            onBackToEcosystem={() => setCurrentView('ecosystem')}
          />
        )}

        {currentView === 'growth-partner' && (
          <GrowthPartnerPage
            onOpenContact={handleOpenContact}
            onBackToEcosystem={() => setCurrentView('ecosystem')}
          />
        )}

        {currentView === 'farmer-network' && (
          <FarmerNetworkPage
            onOpenContact={handleOpenContact}
            onBackToEcosystem={() => setCurrentView('ecosystem')}
          />
        )}

        {currentView === 'women-entrepreneur' && (
          <WomenEntrepreneurPage
            onOpenContact={handleOpenContact}
            onBackToEcosystem={() => setCurrentView('ecosystem')}
          />
        )}

        {currentView === 'digital-partner' && (
          <DigitalPartnerPage
            onOpenContact={handleOpenContact}
            onBackToEcosystem={() => setCurrentView('ecosystem')}
          />
        )}

        {currentView === 'home-restro' && (
          <HomeRestroPage
            onOpenContact={handleOpenContact}
            onBackToEcosystem={() => setCurrentView('ecosystem')}
          />
        )}

        {currentView === 'foco-franchise' && (
          <FocoFranchisePage
            onOpenContact={handleOpenContact}
            onBackToEcosystem={() => setCurrentView('ecosystem')}
          />
        )}

        {currentView === 'dream-rewards' && (
          <DreamRewardsPage
            onOpenContact={handleOpenContact}
            onBackToEcosystem={() => setCurrentView('ecosystem')}
          />
        )}

        {currentView === 'careers' && (
          <CareersPage
            onOpenContact={handleOpenContact}
          />
        )}

        {currentView === 'faq' && (
          <FaqPage
            onOpenContact={handleOpenContact}
          />
        )}

        {currentView === 'contact' && (
          <ContactPage />
        )}

        {currentView === 'home' && (
          <>
            <Hero
              onExploreClick={handleExploreClick}
              onOpenShowcase={() => setShowServicesShowcase(true)}
            />

            <VisualGallerySection
              onSelectCategory={handleSelectCategory}
            />

            <PartnerSuccessStoriesSection
              onSelectCategory={handleSelectCategory}
              onOpenContact={handleOpenContact}
            />

            <EcosystemGrid
              categories={categoriesData}
              onSelectCategory={handleSelectCategory}
            />

            <AboutSection />

            <ImpactCalculator
              onOpenCategoryModal={handleOpenCategoryById}
            />

            <CareersSection />

            <ContactSection />
          </>
        )}
      </main>

      {currentView !== 'admin' && (
        <FloatingQuickNav
          currentView={currentView}
          onNavClick={handleNavClick}
          onOpenShowcase={() => setShowServicesShowcase(true)}
        />
      )}

      {currentView !== 'admin' && <Footer />}

      <ServicesShowcaseModal
        isOpen={showServicesShowcase}
        onClose={() => setShowServicesShowcase(false)}
        onSelectCategory={handleSelectCategory}
      />

      {selectedCategory && (
        <CategoryDetailModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
================================================================================
*/
