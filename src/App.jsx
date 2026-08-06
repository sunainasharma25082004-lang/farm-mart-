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

export default function App() {
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
      {/* Header & Navigation */}
      {currentView !== 'admin' && (
        <Navbar
          currentView={currentView}
          onNavClick={handleNavClick}
          onOpenContact={handleOpenContact}
          onOpenAdmin={handleOpenAdmin}
        />
      )}

      {/* Main Content Area */}
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
            {/* Full Width Hero */}
            <Hero
              onExploreClick={handleExploreClick}
              onOpenShowcase={() => setShowServicesShowcase(true)}
            />

            {/* High-Definition Visual Topic Gallery */}
            <VisualGallerySection
              onSelectCategory={handleSelectCategory}
            />

            {/* Real Employment & How People Work Stories */}
            <PartnerSuccessStoriesSection
              onSelectCategory={handleSelectCategory}
              onOpenContact={handleOpenContact}
            />

            {/* 8 Verticals Category Grid */}
            <EcosystemGrid
              categories={categoriesData}
              onSelectCategory={handleSelectCategory}
            />

            {/* Purpose & Values Overview */}
            <AboutSection />

            {/* Earnings & Community Impact Calculator */}
            <ImpactCalculator
              onOpenCategoryModal={handleOpenCategoryById}
            />

            {/* Careers Openings */}
            <CareersSection />

            {/* Contact & Inquiry Form */}
            <ContactSection />
          </>
        )}
      </main>

      {/* Sleek Floating Dock Navigation */}
      {currentView !== 'admin' && (
        <FloatingQuickNav
          currentView={currentView}
          onNavClick={handleNavClick}
          onOpenShowcase={() => setShowServicesShowcase(true)}
        />
      )}

      {/* Footer */}
      {currentView !== 'admin' && <Footer />}

      {/* Interactive Services & Offerings Showcase Modal */}
      <ServicesShowcaseModal
        isOpen={showServicesShowcase}
        onClose={() => setShowServicesShowcase(false)}
        onSelectCategory={handleSelectCategory}
      />

      {/* Category Detail View Drawer */}
      {selectedCategory && (
        <CategoryDetailModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}
