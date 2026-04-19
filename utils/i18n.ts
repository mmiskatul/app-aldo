import { useAppStore } from '../store/useAppStore';

const translations = {
  en: {
    // General
    english: "English",
    italian: "Italian",
    // Home Header
    greeting: "Good Morning,",
    restaurant_name_fallback: "THE GOLDEN BISTRO",
    // Settings
    settings_title: "Settings",
    language_title: "Language",
    language_subtitle: "Choose your preferred language",
    notifications: "Notifications",
    security: "Security",
    help_support: "Help & Support",
    about: "About",
    sign_out: "Sign Out",
    // Settings Sections
    account_settings: "ACCOUNT SETTINGS",
    manage_subscription: "Manage Subscription",
    notification_settings: "Notification Settings",
    change_password: "Change Password",
    two_factor_auth: "Two-Factor Authentication",
    support_legal: "SUPPORT & LEGAL",
    terms_conditions: "Terms & Conditions",
    privacy_policy: "Privacy Policy",
    help_center: "Help Center",
    // Documents
    documents_title: "Documents",
    upload_invoice: "Upload Invoice",
    recent_documents: "Recent Documents",
    review: "Review",
    view: "View",
    no_documents: "No documents found",
    no_documents_subtext: "Upload an invoice to get started",
    items: "ITEMS",
    status_processed: "Processed",
    status_pending: "Pending Review",
    // Chat
    chat_title: "AI Chat",
    chat_placeholder: "Ask AI about your restaurant business...",
    // Period Dropdown
    weekly: "Weekly",
    monthly: "Monthly",
    export_data: "Export Data",
    // Home Actions
    add_expense: "Add Expense",
    scan_invoice: "Scan Invoice",
    new_report: "New Report",
    invite_staff: "Invite Staff",
    // Quick Actions
    quick_actions: "Quick Actions",
    // Recent Activity
    recent_activity: "Recent Activity",
    see_all: "See All",
    // Cash Management
    cash_management: "Cash Management",
    cash_available: "Cash Available",
    withdrawals: "Withdrawals",
    bank_deposits: "Bank Deposits",
    total_collected: "Total Collected",
    recent_deposits: "Recent Deposits",
    // VAT Balance
    estimated_vat: "Estimated VAT Balance",
    vat_payable: "VAT Payable",
    vat_receivable: "VAT Receivable",
    // Charts
    revenue_trends: "Revenue Trends",
    // AI Insight
    ai_insights: "AI Insights",
  },
  it: {
    // General
    english: "Inglese",
    italian: "Italiano",
    // Home Header
    greeting: "Buongiorno,",
    restaurant_name_fallback: "IL BISTRO D'ORO",
    // Settings
    settings_title: "Impostazioni",
    language_title: "Lingua",
    language_subtitle: "Scegli la tua lingua preferita",
    notifications: "Notifiche",
    security: "Sicurezza",
    help_support: "Aiuto e Supporto",
    about: "Informazioni",
    sign_out: "Esci",
    // Settings Sections
    account_settings: "IMPOSTAZIONI ACCOUNT",
    manage_subscription: "Gestisci Abbonamento",
    notification_settings: "Impostazioni Notifiche",
    change_password: "Cambia Password",
    two_factor_auth: "Autenticazione a Due Fattori",
    support_legal: "SUPPORTO E LEGALE",
    terms_conditions: "Termini e Condizioni",
    privacy_policy: "Normativa sulla Privacy",
    help_center: "Centro Assistenza",
    // Documents
    documents_title: "Documenti",
    upload_invoice: "Carica Fattura",
    recent_documents: "Documenti Recenti",
    review: "Revisiona",
    view: "Visualizza",
    no_documents: "Nessun documento trovato",
    no_documents_subtext: "Carica una fattura per iniziare",
    items: "ARTICOLI",
    status_processed: "Elaborato",
    status_pending: "In Revisione",
    // Chat
    chat_title: "Chat AI",
    chat_placeholder: "Chiedi all'IA del tuo ristorante...",
    // Period Dropdown
    weekly: "Settimanale",
    monthly: "Mensile",
    export_data: "Esporta Dati",
    // Home Actions
    add_expense: "Aggiungi Spesa",
    scan_invoice: "Scansiona Fattura",
    new_report: "Nuovo Report",
    invite_staff: "Invita Staff",
    // Quick Actions
    quick_actions: "Azioni Rapide",
    // Recent Activity
    recent_activity: "Attività Recenti",
    see_all: "Vedi Tutti",
    // Cash Management
    cash_management: "Gestione Cassa",
    cash_available: "Cassa Disponibile",
    withdrawals: "Prelievi",
    bank_deposits: "Depositi Bancari",
    total_collected: "Totale Incassato",
    recent_deposits: "Depositi Recenti",
    // VAT Balance
    estimated_vat: "Bilancio IVA Stimato",
    vat_payable: "IVA a Debito",
    vat_receivable: "IVA a Credito",
    // Charts
    revenue_trends: "Tendenze delle Entrate",
    // AI Insight
    ai_insights: "Approfondimenti AI",
  }
};

export type TranslationKey = keyof typeof translations.en;

export const t = (key: TranslationKey): string => {
  const language = useAppStore.getState().appLanguage || 'en';
  return translations[language]?.[key] || translations.en[key] || key;
};

export const useTranslation = () => {
  const language = useAppStore((state) => state.appLanguage) || 'en';
  
  const tHook = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };
  
  return { t: tHook };
};
