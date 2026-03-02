import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "fr";

interface Translations {
  [key: string]: { en: string; fr: string };
}

const translations: Translations = {
  // Nav
  "nav.home": { en: "Home", fr: "Accueil" },
  "nav.jobSeekers": { en: "Job Seekers", fr: "Chercheurs d'emploi" },
  "nav.employers": { en: "Employers", fr: "Employeurs" },
  "nav.about": { en: "About Us", fr: "À propos" },
  "nav.contact": { en: "Contact", fr: "Contact" },

  // Top bar
  "topbar.license": { en: "License", fr: "Permis" },
  "topbar.address": { en: "Laval, QC, Canada", fr: "Laval, QC, Canada" },
  "topbar.hrServices": { en: "HR Services 24/7", fr: "Services RH 24/7" },

  // Hero
  "hero.headline": {
    en: "Your Trusted Recruitment Partner in Canada",
    fr: "Votre partenaire de recrutement de confiance au Canada",
  },
  "hero.subheadline": {
    en: "Connecting top talent with leading employers across Quebec and beyond. Professional staffing solutions tailored to your needs.",
    fr: "Connecter les meilleurs talents aux employeurs de premier plan au Québec et au-delà. Des solutions de dotation professionnelles adaptées à vos besoins.",
  },
  "hero.findJob": { en: "Find a Job", fr: "Trouver un emploi" },
  "hero.postJob": { en: "Post a Job", fr: "Publier un emploi" },

  // Footer
  "footer.about": {
    en: "Inal Resources is a licensed recruitment agency based in Laval, Quebec, specializing in connecting qualified professionals with top employers across Canada.",
    fr: "Inal Resources est une agence de recrutement agréée basée à Laval, Québec, spécialisée dans la mise en relation de professionnels qualifiés avec les meilleurs employeurs au Canada.",
  },
  "footer.quickLinks": { en: "Quick Links", fr: "Liens rapides" },
  "footer.contactUs": { en: "Contact Us", fr: "Contactez-nous" },
  "footer.hours": { en: "Business Hours", fr: "Heures d'ouverture" },
  "footer.weekdays": { en: "Mon - Fri: 8:00 AM - 6:00 PM", fr: "Lun - Ven: 8h00 - 18h00" },
  "footer.weekend": { en: "Sat - Sun: By appointment", fr: "Sam - Dim: Sur rendez-vous" },
  "footer.emergency": { en: "24/7 Emergency HR Line", fr: "Ligne RH d'urgence 24/7" },
  "footer.rights": {
    en: "All rights reserved.",
    fr: "Tous droits réservés.",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
