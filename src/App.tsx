import React, { useState, useEffect } from 'react';
import {
  Organization,
  Subscription,
  Quote,
  ProductService,
  SubscriptionPlan,
  DashboardTheme,
  User,
} from './types.ts';
import {
  initialOrganization,
  initialSubscription,
  initialQuotes,
  initialCatalog,
  initialUser,
} from './data/mockData.ts';
import { Header } from './components/Header.tsx';
import { QuotesList } from './components/QuotesList.tsx';
import { QuoteBuilder } from './components/QuoteBuilder.tsx';
import { PublicQuoteView } from './components/PublicQuoteView.tsx';
import { CatalogManager } from './components/CatalogManager.tsx';
import { CompanySettingsModal } from './components/CompanySettingsModal.tsx';
import { RevolutCheckoutModal } from './components/RevolutCheckoutModal.tsx';
import { ThemeSelectorModal } from './components/ThemeSelectorModal.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { LegalModal, LegalTab } from './components/LegalModal.tsx';
import { getThemeClasses } from './lib/themes.ts';

export function App() {
  // Stare Utilizator Autentificat
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('offerflow_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [organization, setOrganization] = useState<Organization>(() => {
    try {
      const saved = localStorage.getItem('offerflow_org');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialOrganization;
  });

  const [currentTheme, setCurrentTheme] = useState<DashboardTheme>(() => {
    try {
      const saved = localStorage.getItem('offerflow_dashboard_theme');
      if (saved) return saved as DashboardTheme;
    } catch (e) {
      console.error(e);
    }
    return 'slate'; // Nuanță odihnitoare gri-ardezie modernă implicită
  });

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('offerflow_dashboard_theme', currentTheme);
    } catch (e) {
      console.error(e);
    }
  }, [currentTheme]);

  const [subscription, setSubscription] = useState<Subscription>(() => {
    try {
      const saved = localStorage.getItem('offerflow_subscription');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialSubscription;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    try {
      const saved = localStorage.getItem('offerflow_quotes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialQuotes;
  });

  const [catalog, setCatalog] = useState<ProductService[]>(() => {
    try {
      const saved = localStorage.getItem('offerflow_catalog');
      if (saved) {
        const parsed: ProductService[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => {
            const template = initialCatalog.find((t) => t.id === item.id || t.cod_articol === item.cod_articol);
            const inferredType =
              item.tip_articol ||
              template?.tip_articol ||
              (item.um === 'buc' || item.um === 'ml' || item.um === 'mp' || item.um === 'mc' || item.um === 'kg'
                ? 'produs'
                : item.um === 'kit'
                ? 'pachet'
                : item.um === 'luni'
                ? 'abonament'
                : 'serviciu');

            return {
              ...item,
              tip_articol: inferredType,
              cod_articol: item.cod_articol || template?.cod_articol || `SKU-${100 + idx}`,
              producator: item.producator || template?.producator || '',
              categorie: item.categorie || template?.categorie || 'General',
              pret_cost: item.pret_cost ?? template?.pret_cost ?? 0,
              termen_livrare: item.termen_livrare || template?.termen_livrare || 'La comandă',
              este_activ: item.este_activ ?? template?.este_activ ?? true,
              um: item.um || template?.um || 'buc',
              cota_tva: item.cota_tva ?? template?.cota_tva ?? 19,
              moneda: item.moneda || template?.moneda || 'RON',
            };
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
    return initialCatalog;
  });

  // Salvare automată în localStorage
  useEffect(() => {
    try {
      localStorage.setItem('offerflow_quotes', JSON.stringify(quotes));
    } catch (e) {
      console.error(e);
    }
  }, [quotes]);

  useEffect(() => {
    try {
      localStorage.setItem('offerflow_org', JSON.stringify(organization));
    } catch (e) {
      console.error(e);
    }
  }, [organization]);

  useEffect(() => {
    try {
      localStorage.setItem('offerflow_subscription', JSON.stringify(subscription));
    } catch (e) {
      console.error(e);
    }
  }, [subscription]);

  useEffect(() => {
    try {
      localStorage.setItem('offerflow_catalog', JSON.stringify(catalog));
    } catch (e) {
      console.error(e);
    }
  }, [catalog]);

  // Sincronizare automată între tab-uri / ferestre când clientul semnează
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'offerflow_quotes' && e.newValue) {
        try {
          const updatedQuotes: Quote[] = JSON.parse(e.newValue);
          setQuotes(updatedQuotes);
          setActiveQuoteForView((current) => {
            if (!current) return null;
            return updatedQuotes.find((q) => q.id === current.id) || current;
          });
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Navigare & View-uri: LANDING (implicit ptr vizitatori), DASHBOARD, BUILDER, PUBLIC_VIEW
  const [activeTab, setActiveTab] = useState<'QUOTES' | 'CATALOG'>('QUOTES');
  const [currentView, setCurrentView] = useState<'LANDING' | 'DASHBOARD' | 'BUILDER' | 'PUBLIC_VIEW'>(() => {
    // Dacă URL-ul conține un token de ofertă publică, deschidem direct vizualizarea clientului
    const path = window.location.pathname;
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    if (path.includes('/view/') || hash.includes('/view/') || searchParams.has('token') || searchParams.has('view')) {
      return 'PUBLIC_VIEW';
    }
    // Altfel, dacă utilizatorul este deja logat, intră direct în Dashboard
    try {
      const savedUser = localStorage.getItem('offerflow_current_user');
      if (savedUser) return 'DASHBOARD';
    } catch (e) {}
    // Vizitatorii neautentificați văd Landing Page-ul clasic B2B SaaS
    return 'LANDING';
  });
  
  // Stări pentru elementele selectate
  const [activeQuoteForView, setActiveQuoteForView] = useState<Quote | null>(null);
  const [activeQuoteForEdit, setActiveQuoteForEdit] = useState<Quote | null>(null);
  const [isClientRoute, setIsClientRoute] = useState(false);

  // Modale de sistem
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRevolutCheckoutOpen, setIsRevolutCheckoutOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlan>('STARTER');

  // Modal Autentificare & Modal Legal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<LegalTab>('TERMS');

  // Verificare URL hash, searchParams sau path token la încărcare
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    let token = searchParams.get('token') || searchParams.get('view') || '';

    if (!token && path.includes('/view/')) {
      token = path.split('/view/')[1]?.split('/')[0]?.split('?')[0] || '';
    } else if (!token && hash.includes('/view/')) {
      token = hash.split('/view/')[1]?.split('/')[0]?.split('?')[0] || '';
    }

    if (token) {
      const found = quotes.find((q) => q.public_token === token) || quotes[0];
      if (found) {
        setActiveQuoteForView(found);
        setCurrentView('PUBLIC_VIEW');
        setIsClientRoute(true);
      }
    }
  }, [quotes]);

  // Autentificare reușită
  const handleSuccessLogin = (user: User, orgName?: string, orgCui?: string) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('offerflow_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }

    if (orgName || orgCui) {
      setOrganization((prev) => ({
        ...prev,
        nume: orgName || prev.nume,
        cui: orgCui || prev.cui,
      }));
    }

    setIsAuthModalOpen(false);
    setCurrentView('DASHBOARD');
  };

  // Deconectare
  const handleLogout = () => {
    try {
      localStorage.removeItem('offerflow_current_user');
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setCurrentView('LANDING');
  };

  // Explorare demo din Landing Page
  const handleExploreDemo = () => {
    if (!currentUser) {
      setCurrentUser(initialUser);
      try {
        localStorage.setItem('offerflow_current_user', JSON.stringify(initialUser));
      } catch (e) {}
    }
    setCurrentView('DASHBOARD');
  };

  // Deschiderea modalului de autentificare
  const handleOpenAuth = (mode: 'LOGIN' | 'REGISTER') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Deschiderea modalului legal
  const handleOpenLegal = (tab: LegalTab) => {
    setActiveLegalTab(tab);
    setIsLegalModalOpen(true);
  };

  // Comutare rapidă plan FREE <-> STARTER <-> CLASIC pentru testare imediată
  const handleTogglePlan = () => {
    const nextPlan: SubscriptionPlan =
      subscription.plan === 'FREE'
        ? 'STARTER'
        : subscription.plan === 'STARTER'
        ? 'CLASIC'
        : 'FREE';

    setSubscription({
      ...subscription,
      plan: nextPlan,
    });
  };

  // Salvare sau actualizare ofertă din Builder
  const handleSaveQuote = (savedQuote: Quote) => {
    const exists = quotes.some((q) => q.id === savedQuote.id);
    if (exists) {
      setQuotes(quotes.map((q) => (q.id === savedQuote.id ? savedQuote : q)));
    } else {
      const maxQuotes = subscription.plan === 'FREE' ? 2 : subscription.plan === 'STARTER' ? 5 : 30;
      if (quotes.length >= maxQuotes) {
        setSelectedPlanForUpgrade(subscription.plan === 'FREE' ? 'STARTER' : 'CLASIC');
        setIsRevolutCheckoutOpen(true);
        return;
      }
      setQuotes([savedQuote, ...quotes]);
    }
    setCurrentView('DASHBOARD');
    setActiveQuoteForEdit(null);
  };

  // Previzualizare din Builder
  const handlePreviewQuote = (quoteToPreview: Quote) => {
    setActiveQuoteForView(quoteToPreview);
    setCurrentView('PUBLIC_VIEW');
  };

  // Actualizare ofertă (din vederea publică de exemplu când se bifează opționale sau se semnează)
  const handleUpdateQuote = (updatedQuote: Quote) => {
    setQuotes(quotes.map((q) => (q.id === updatedQuote.id ? updatedQuote : q)));
    if (activeQuoteForView?.id === updatedQuote.id) {
      setActiveQuoteForView(updatedQuote);
    }
  };

  // Ștergere ofertă
  const handleDeleteQuote = (quoteId: string) => {
    setQuotes(quotes.filter((q) => q.id !== quoteId));
  };

  // Upgrade prin Revolut
  const handleSuccessUpgrade = (upgradedPlan: SubscriptionPlan) => {
    setSubscription({
      ...subscription,
      plan: upgradedPlan,
      status: 'ACTIVE',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Dacă utilizatorul a făcut upgrade din Landing Page, îl autentificăm și îl trecem în Dashboard
    if (!currentUser) {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        organizationId: organization.id || 'org_1',
        nume: organization.nume || 'Administrator',
        email: organization.email || 'client@exemplu.ro',
        rol: 'ADMIN',
        created_at: new Date().toISOString(),
      };
      setCurrentUser(newUser);
      try {
        localStorage.setItem('offerflow_current_user', JSON.stringify(newUser));
      } catch (e) {}
    }
    setCurrentView('DASHBOARD');
    // Modalul rămâne deschis la pasul SUCCESS pentru ca utilizatorul să vadă confirmarea și să descarce factura proformă!
  };

  // Management Catalog Articole
  const handleAddCatalogProduct = (product: ProductService) => {
    setCatalog([...catalog, product]);
  };

  const handleUpdateCatalogProduct = (product: ProductService) => {
    setCatalog(catalog.map((p) => (p.id === product.id ? product : p)));
  };

  const handleDeleteCatalogProduct = (productId: string) => {
    setCatalog(catalog.filter((p) => p.id !== productId));
  };

  const themeStyles = getThemeClasses(currentTheme);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${themeStyles.bg}`}>
      {/* 1. VEDERE LANDING PAGE PENTRU VIZITATORI / PREZENTARE */}
      {currentView === 'LANDING' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onExploreDemo={handleExploreDemo}
          onOpenLegal={handleOpenLegal}
          onSelectPlanUpgrade={(plan) => {
            setSelectedPlanForUpgrade(plan);
            setIsRevolutCheckoutOpen(true);
          }}
        />
      ) : (
        <>
          {/* Header-ul aplicației (vizibil în panoul admin, ascuns în public view) */}
          {currentView !== 'PUBLIC_VIEW' && (
            <Header
              organization={organization}
              currentPlan={subscription.plan}
              currentTheme={currentTheme}
              currentUser={currentUser}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenThemeSelector={() => setIsThemeModalOpen(true)}
              onOpenRevolutCheckout={() => {
                setSelectedPlanForUpgrade('STARTER');
                setIsRevolutCheckoutOpen(true);
              }}
              onTogglePlan={handleTogglePlan}
              onViewLanding={() => setCurrentView('LANDING')}
              onLogout={handleLogout}
            />
          )}

          {/* Conținut Principal */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {/* VEDERE 2: Panou Principal (Dashboard) */}
            {currentView === 'DASHBOARD' && activeTab === 'QUOTES' && (
              <QuotesList
                quotes={quotes}
                subscriptionPlan={subscription.plan}
                currentTheme={currentTheme}
                onSelectQuoteToView={(quote) => {
                  setActiveQuoteForView(quote);
                  setCurrentView('PUBLIC_VIEW');
                }}
                onSelectQuoteToEdit={(quote) => {
                  setActiveQuoteForEdit(quote);
                  setCurrentView('BUILDER');
                }}
                onCreateNewQuote={() => {
                  setActiveQuoteForEdit(null);
                  setCurrentView('BUILDER');
                }}
                onDeleteQuote={handleDeleteQuote}
                onUpgradeToStarter={() => {
                  setSelectedPlanForUpgrade('STARTER');
                  setIsRevolutCheckoutOpen(true);
                }}
              />
            )}

            {/* VEDERE 3: Catalog Produse & Servicii */}
            {currentView === 'DASHBOARD' && activeTab === 'CATALOG' && (
              <CatalogManager
                catalog={catalog}
                currentTheme={currentTheme}
                onAddProduct={handleAddCatalogProduct}
                onUpdateProduct={handleUpdateCatalogProduct}
                onDeleteProduct={handleDeleteCatalogProduct}
                onBatchUpdateCatalog={(updated) => setCatalog(updated)}
                organizationId={organization.id}
              />
            )}

            {/* VEDERE 4: Builder de Oferte */}
            {currentView === 'BUILDER' && (
              <QuoteBuilder
                initialQuote={activeQuoteForEdit}
                catalog={catalog}
                organization={organization}
                onSaveQuote={handleSaveQuote}
                onPreviewQuote={handlePreviewQuote}
                onCancel={() => {
                  setCurrentView('DASHBOARD');
                  setActiveQuoteForEdit(null);
                }}
              />
            )}

            {/* VEDERE 5: Pagina Publică a Ofertei (/view/[token]) */}
            {currentView === 'PUBLIC_VIEW' && activeQuoteForView && (
              <PublicQuoteView
                quote={activeQuoteForView}
                subscriptionPlan={subscription.plan}
                onUpdateQuote={handleUpdateQuote}
                onBackToDashboard={
                  isClientRoute ? undefined : () => setCurrentView(currentUser ? 'DASHBOARD' : 'LANDING')
                }
                isClientView={isClientRoute}
              />
            )}
          </main>
        </>
      )}

      {/* MODALE GLOBALE */}
      {/* 1. Modal Autentificare & Înregistrare */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={handleSuccessLogin}
        onOpenLegalModal={(tab) => handleOpenLegal(tab as LegalTab)}
      />

      {/* 2. Modal Legal & GDPR & Cookies */}
      <LegalModal
        isOpen={isLegalModalOpen}
        initialTab={activeLegalTab}
        onClose={() => setIsLegalModalOpen(false)}
      />

      {/* 3. Modal Setări Companie, Culori & Abonament */}
      {isSettingsOpen && (
        <CompanySettingsModal
          organization={organization}
          onSave={setOrganization}
          onClose={() => setIsSettingsOpen(false)}
          isStarterPlan={subscription.plan !== 'FREE'}
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
          onOpenRevolutCheckout={() => {
            setSelectedPlanForUpgrade('STARTER');
            setIsRevolutCheckoutOpen(true);
          }}
        />
      )}

      {/* 4. Modal Checkout Revolut */}
      {isRevolutCheckoutOpen && (
        <RevolutCheckoutModal
          organization={organization}
          currentPlan={subscription.plan}
          initialSelectedPlan={selectedPlanForUpgrade}
          onClose={() => setIsRevolutCheckoutOpen(false)}
          onSuccessUpgrade={handleSuccessUpgrade}
        />
      )}

      {/* 5. Modal Selector Teme / Culori */}
      {isThemeModalOpen && (
        <ThemeSelectorModal
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
