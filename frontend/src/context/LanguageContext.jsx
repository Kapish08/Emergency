/**
 * Language / i18n Context — basic multi-language support
 */
import React, { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    appName: 'Emergency Hospital Finder',
    tagline: 'Find nearest hospital instantly',
    findHospitals: 'Find Hospitals',
    nearestHospitals: 'Nearest Hospitals',
    icuBeds: 'ICU Beds',
    generalBeds: 'General Beds',
    emergencyBeds: 'Emergency Beds',
    available: 'Available',
    distance: 'Distance',
    waitTime: 'Wait Time',
    getDirections: 'Get Directions',
    callEmergency: 'Call Emergency',
    aiRecommended: 'AI Recommended',
    loading: 'Searching...',
    noHospitalsFound: 'No hospitals found nearby',
    emergencyType: 'Emergency Type',
    general: 'General',
    cardiac: 'Cardiac',
    trauma: 'Trauma',
    minor: 'Minor',
    callAmbulance: 'Call Ambulance',
    sos: 'SOS',
    dashboard: 'Dashboard',
    hospitals: 'Hospitals',
    healthMonitor: 'Health Monitor',
    ambulanceTracker: 'Ambulance Tracker',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    mins: 'mins',
    km: 'km',
    miles: 'mi',
  },
  hi: {
    appName: 'आपातकालीन अस्पताल खोजक',
    tagline: 'तुरंत निकटतम अस्पताल खोजें',
    findHospitals: 'अस्पताल खोजें',
    nearestHospitals: 'निकटतम अस्पताल',
    icuBeds: 'आईसीयू बेड',
    generalBeds: 'सामान्य बेड',
    emergencyBeds: 'आपातकालीन बेड',
    available: 'उपलब्ध',
    distance: 'दूरी',
    waitTime: 'प्रतीक्षा समय',
    getDirections: 'दिशाएं पाएं',
    callEmergency: 'आपातकाल काल',
    aiRecommended: 'एआई अनुशंसित',
    loading: 'खोज रहे हैं...',
    noHospitalsFound: 'निकट कोई अस्पताल नहीं मिला',
    emergencyType: 'आपातकाल प्रकार',
    general: 'सामान्य',
    cardiac: 'हृदय',
    trauma: 'आघात',
    minor: 'मामूली',
    callAmbulance: 'एम्बुलेंस बुलाएं',
    sos: 'एसओएस',
    dashboard: 'डैशबोर्ड',
    hospitals: 'अस्पताल',
    healthMonitor: 'स्वास्थ्य मॉनिटर',
    ambulanceTracker: 'एम्बुलेंस ट्रैकर',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    login: 'लॉग इन',
    signup: 'साइन अप',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'पूरा नाम',
    mins: 'मिनट',
    km: 'किमी',
    miles: 'मील',
  },
  es: {
    appName: 'Buscador de Hospitales de Emergencia',
    tagline: 'Encuentra el hospital más cercano al instante',
    findHospitals: 'Buscar Hospitales',
    nearestHospitals: 'Hospitales Más Cercanos',
    icuBeds: 'Camas UCI',
    generalBeds: 'Camas Generales',
    emergencyBeds: 'Camas de Emergencia',
    available: 'Disponibles',
    distance: 'Distancia',
    waitTime: 'Tiempo de Espera',
    getDirections: 'Obtener Ruta',
    callEmergency: 'Llamar Emergencia',
    aiRecommended: 'Recomendado por IA',
    loading: 'Buscando...',
    noHospitalsFound: 'No se encontraron hospitales cercanos',
    emergencyType: 'Tipo de Emergencia',
    general: 'General',
    cardiac: 'Cardíaco',
    trauma: 'Trauma',
    minor: 'Menor',
    callAmbulance: 'Llamar Ambulancia',
    sos: 'SOS',
    dashboard: 'Panel',
    hospitals: 'Hospitales',
    healthMonitor: 'Monitor de Salud',
    ambulanceTracker: 'Rastreo de Ambulancia',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    name: 'Nombre Completo',
    mins: 'min',
    km: 'km',
    miles: 'mi',
  },
  fr: {
    appName: "Finder d'Hôpitaux d'Urgence",
    tagline: "Trouvez l'hôpital le plus proche instantanément",
    findHospitals: 'Trouver des Hôpitaux',
    nearestHospitals: 'Hôpitaux les Plus Proches',
    icuBeds: 'Lits USI',
    generalBeds: 'Lits Généraux',
    emergencyBeds: "Lits d'Urgence",
    available: 'Disponibles',
    distance: 'Distance',
    waitTime: "Temps d'Attente",
    getDirections: 'Obtenir un Itinéraire',
    callEmergency: "Appeler Urgence",
    aiRecommended: 'Recommandé par IA',
    loading: 'Recherche...',
    noHospitalsFound: "Aucun hôpital trouvé à proximité",
    emergencyType: "Type d'Urgence",
    general: 'Général',
    cardiac: 'Cardiaque',
    trauma: 'Traumatisme',
    minor: 'Mineur',
    callAmbulance: 'Appeler Ambulance',
    sos: 'SOS',
    dashboard: 'Tableau de Bord',
    hospitals: 'Hôpitaux',
    healthMonitor: 'Moniteur de Santé',
    ambulanceTracker: "Suivi d'Ambulance",
    settings: 'Paramètres',
    logout: 'Déconnexion',
    login: 'Connexion',
    signup: "S'inscrire",
    email: 'Email',
    password: 'Mot de Passe',
    name: 'Nom Complet',
    mins: 'min',
    km: 'km',
    miles: 'mi',
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('ehf_lang') || 'en');

  const t = (key) => translations[lang]?.[key] || translations['en'][key] || key;

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('ehf_lang', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, changeLanguage, availableLanguages: Object.keys(translations) }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
};
