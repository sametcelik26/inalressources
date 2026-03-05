import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "fr";

interface Translations {
  [key: string]: { en: string; fr: string };
}

const translations: Translations = {
  // Nav
  "nav.home": { en: "Home", fr: "Accueil" },
  "nav.jobs": { en: "Jobs", fr: "Emplois" },
  "nav.jobSeekers": { en: "Job Seekers", fr: "Chercheurs d'emploi" },
  "nav.employers": { en: "Employers", fr: "Employeurs" },
  "nav.about": { en: "About Us", fr: "À propos" },
  "nav.contact": { en: "Contact", fr: "Contact" },
  "nav.dashboard": { en: "Dashboard", fr: "Tableau de bord" },
  "nav.profile": { en: "Profile", fr: "Profil" },
  "nav.messages": { en: "Messages", fr: "Messages" },
  "nav.login": { en: "Login", fr: "Connexion" },
  "nav.logout": { en: "Logout", fr: "Déconnexion" },

  // Top bar
  "topbar.license": { en: "License", fr: "Permis" },
  "topbar.address": { en: "Laval, QC, Canada", fr: "Laval, QC, Canada" },
  "topbar.hrServices": { en: "HR Services 24/7", fr: "Services RH 24/7" },

  // Hero
  "hero.headline": { en: "Connecting Employers With The Right Talent", fr: "Connecter les employeurs avec les bons talents" },
  "hero.subheadline": { en: "Professional staffing solutions tailored to your needs across Quebec and beyond. Whether you're hiring or looking for your next opportunity, we're here to help.", fr: "Des solutions de dotation professionnelles adaptées à vos besoins au Québec et au-delà. Que vous recrutiez ou cherchiez votre prochaine opportunité, nous sommes là pour vous aider." },
  "hero.forEmployers": { en: "For Employers", fr: "Pour les employeurs" },
  "hero.forCandidates": { en: "For Candidates", fr: "Pour les candidats" },

  // Auth
  "auth.login": { en: "Login", fr: "Connexion" },
  "auth.signup": { en: "Sign Up", fr: "S'inscrire" },
  "auth.email": { en: "Email", fr: "Courriel" },
  "auth.password": { en: "Password", fr: "Mot de passe" },
  "auth.fullName": { en: "Full Name", fr: "Nom complet" },
  "auth.iAm": { en: "I am a...", fr: "Je suis un(e)..." },
  "auth.jobSeeker": { en: "Job Seeker", fr: "Chercheur d'emploi" },
  "auth.employer": { en: "Employer", fr: "Employeur" },
  "auth.forgotPassword": { en: "Forgot password?", fr: "Mot de passe oublié?" },
  "auth.loginSuccess": { en: "Welcome back!", fr: "Bienvenue!" },
  "auth.signupSuccess": { en: "Account created!", fr: "Compte créé!" },
  "auth.checkEmail": { en: "Check your email to verify your account.", fr: "Vérifiez votre courriel pour confirmer votre compte." },
  "auth.error": { en: "Error", fr: "Erreur" },
  "auth.backToLogin": { en: "Back to login", fr: "Retour à la connexion" },
  "auth.resetPassword": { en: "Reset Password", fr: "Réinitialiser le mot de passe" },
  "auth.resetEmailSent": { en: "Check your email for a password reset link.", fr: "Vérifiez votre courriel pour le lien de réinitialisation." },
  "auth.sendResetLink": { en: "Send Reset Link", fr: "Envoyer le lien" },
  "auth.setNewPassword": { en: "Set New Password", fr: "Définir un nouveau mot de passe" },
  "auth.newPassword": { en: "New password", fr: "Nouveau mot de passe" },
  "auth.updatePassword": { en: "Update Password", fr: "Mettre à jour" },
  "auth.passwordUpdated": { en: "Password updated!", fr: "Mot de passe mis à jour!" },
  "auth.loginRequired": { en: "Please log in to continue.", fr: "Veuillez vous connecter pour continuer." },

  // Jobs
  "jobs.title": { en: "Job Listings", fr: "Offres d'emploi" },
  "jobs.searchPlaceholder": { en: "Search by title or keyword...", fr: "Rechercher par titre ou mot-clé..." },
  "jobs.locationPlaceholder": { en: "Location...", fr: "Localisation..." },
  "jobs.filters": { en: "Filters", fr: "Filtres" },
  "jobs.jobType": { en: "Job Type", fr: "Type d'emploi" },
  "jobs.allTypes": { en: "All Types", fr: "Tous les types" },
  "jobs.experience": { en: "Experience", fr: "Expérience" },
  "jobs.allLevels": { en: "All Levels", fr: "Tous les niveaux" },
  "jobs.results": { en: "jobs found", fr: "emplois trouvés" },
  "jobs.loading": { en: "Loading...", fr: "Chargement..." },
  "jobs.noResults": { en: "No jobs found matching your criteria.", fr: "Aucun emploi trouvé correspondant à vos critères." },
  "jobs.saved": { en: "Job saved!", fr: "Emploi sauvegardé!" },
  "jobs.back": { en: "Back", fr: "Retour" },
  "jobs.description": { en: "Job Description", fr: "Description du poste" },
  "jobs.deadline": { en: "Deadline", fr: "Date limite" },
  "jobs.applyNow": { en: "Apply Now", fr: "Postuler maintenant" },
  "jobs.alreadyApplied": { en: "You have already applied", fr: "Vous avez déjà postulé" },
  "jobs.coverLetterPlaceholder": { en: "Write a cover letter (optional)...", fr: "Rédigez une lettre de motivation (optionnel)..." },
  "jobs.submitApplication": { en: "Submit Application", fr: "Soumettre la candidature" },
  "jobs.cancel": { en: "Cancel", fr: "Annuler" },
  "jobs.loginToApply": { en: "Login to Apply", fr: "Connectez-vous pour postuler" },
  "jobs.applicationSent": { en: "Application submitted!", fr: "Candidature soumise!" },
  "jobs.applicationConfirm": { en: "Thank you for your application. We will contact you soon.", fr: "Merci pour votre candidature. Nous vous contacterons bientôt." },
  "jobs.applyAgain": { en: "Submit Another Application", fr: "Soumettre une autre candidature" },

  // Dashboard
  "dashboard.seekerTitle": { en: "My Dashboard", fr: "Mon tableau de bord" },
  "dashboard.employerTitle": { en: "Employer Dashboard", fr: "Tableau de bord employeur" },
  "dashboard.adminTitle": { en: "Admin Dashboard", fr: "Tableau de bord admin" },
  "dashboard.applications": { en: "Applications", fr: "Candidatures" },
  "dashboard.savedJobs": { en: "Saved Jobs", fr: "Emplois sauvegardés" },
  "dashboard.shortlisted": { en: "Shortlisted", fr: "Présélectionné" },
  "dashboard.messages": { en: "Messages", fr: "Messages" },
  "dashboard.myApplications": { en: "My Applications", fr: "Mes candidatures" },
  "dashboard.noApplications": { en: "No applications yet.", fr: "Aucune candidature." },
  "dashboard.browseJobs": { en: "Browse jobs", fr: "Parcourir les emplois" },
  "dashboard.noSaved": { en: "No saved jobs.", fr: "Aucun emploi sauvegardé." },
  "dashboard.postJob": { en: "Post a Job", fr: "Publier un emploi" },
  "dashboard.createJob": { en: "Create Job Posting", fr: "Créer une offre d'emploi" },
  "dashboard.jobTitle": { en: "Job Title", fr: "Titre du poste" },
  "dashboard.jobDescription": { en: "Job Description", fr: "Description du poste" },
  "dashboard.location": { en: "Location", fr: "Localisation" },
  "dashboard.salaryMin": { en: "Min Salary", fr: "Salaire min" },
  "dashboard.salaryMax": { en: "Max Salary", fr: "Salaire max" },
  "dashboard.category": { en: "Category", fr: "Catégorie" },
  "dashboard.skillsComma": { en: "Skills (comma-separated)", fr: "Compétences (séparées par des virgules)" },
  "dashboard.publishJob": { en: "Publish Job", fr: "Publier l'emploi" },
  "dashboard.jobCreated": { en: "Job posted!", fr: "Emploi publié!" },
  "dashboard.jobDeleted": { en: "Job deleted.", fr: "Emploi supprimé." },
  "dashboard.activeJobs": { en: "Active Jobs", fr: "Emplois actifs" },
  "dashboard.totalApplications": { en: "Applications", fr: "Candidatures" },
  "dashboard.myJobs": { en: "My Jobs", fr: "Mes emplois" },
  "dashboard.noJobs": { en: "No jobs posted yet.", fr: "Aucun emploi publié." },
  "dashboard.active": { en: "Active", fr: "Actif" },
  "dashboard.inactive": { en: "Inactive", fr: "Inactif" },
  "dashboard.selectJobFirst": { en: "Select a job to view applications.", fr: "Sélectionnez un emploi pour voir les candidatures." },
  "dashboard.noApplicationsYet": { en: "No applications yet.", fr: "Aucune candidature." },
  "dashboard.anonymous": { en: "Anonymous", fr: "Anonyme" },
  "dashboard.statusUpdated": { en: "Status updated.", fr: "Statut mis à jour." },
  "dashboard.sendMessage": { en: "Send Message", fr: "Envoyer un message" },
  "dashboard.totalUsers": { en: "Users", fr: "Utilisateurs" },
  "dashboard.totalJobs": { en: "Jobs", fr: "Emplois" },
  "dashboard.users": { en: "Users", fr: "Utilisateurs" },
  "dashboard.jobs": { en: "Jobs", fr: "Emplois" },

  // Messages
  "messages.title": { en: "Messages", fr: "Messages" },
  "messages.noConversations": { en: "No conversations yet.", fr: "Aucune conversation." },
  "messages.unknown": { en: "Unknown", fr: "Inconnu" },
  "messages.typePlaceholder": { en: "Type a message...", fr: "Écrivez un message..." },
  "messages.selectConversation": { en: "Select a conversation", fr: "Sélectionnez une conversation" },

  // Profile
  "profile.title": { en: "My Profile", fr: "Mon profil" },
  "profile.fullName": { en: "Full Name", fr: "Nom complet" },
  "profile.phone": { en: "Phone", fr: "Téléphone" },
  "profile.bio": { en: "Bio / About me", fr: "Bio / À propos de moi" },
  "profile.education": { en: "Education", fr: "Formation" },
  "profile.experienceYears": { en: "Years of Experience", fr: "Années d'expérience" },
  "profile.skillsComma": { en: "Skills (comma-separated)", fr: "Compétences (séparées par des virgules)" },
  "profile.companyName": { en: "Company Name", fr: "Nom de l'entreprise" },
  "profile.companyDescription": { en: "Company Description", fr: "Description de l'entreprise" },
  "profile.companyWebsite": { en: "Company Website", fr: "Site web de l'entreprise" },
  "profile.industry": { en: "Industry", fr: "Secteur d'activité" },
  "profile.save": { en: "Save Profile", fr: "Enregistrer le profil" },
  "profile.saved": { en: "Profile saved!", fr: "Profil enregistré!" },

  // Common
  "common.loading": { en: "Loading...", fr: "Chargement..." },

  // Contact page
  "contact.title": { en: "Contact Us", fr: "Contactez-nous" },
  "contact.subtitle": { en: "Have a question or need assistance? We'd love to hear from you.", fr: "Vous avez une question ou besoin d'aide? Nous serions ravis de vous entendre." },
  "contact.formTitle": { en: "Send Us a Message", fr: "Envoyez-nous un message" },
  "contact.name": { en: "Full Name", fr: "Nom complet" },
  "contact.namePlaceholder": { en: "John Doe", fr: "Jean Dupont" },
  "contact.email": { en: "Email", fr: "Courriel" },
  "contact.emailPlaceholder": { en: "john@example.com", fr: "jean@exemple.com" },
  "contact.phone": { en: "Phone (optional)", fr: "Téléphone (optionnel)" },
  "contact.phonePlaceholder": { en: "+1 (438) 000-0000", fr: "+1 (438) 000-0000" },
  "contact.subject": { en: "Subject", fr: "Sujet" },
  "contact.subjectPlaceholder": { en: "Select a subject", fr: "Sélectionnez un sujet" },
  "contact.subjectGeneral": { en: "General Inquiry", fr: "Demande générale" },
  "contact.subjectRecruitment": { en: "Recruitment Services", fr: "Services de recrutement" },
  "contact.subjectPartnership": { en: "Partnership", fr: "Partenariat" },
  "contact.subjectSupport": { en: "Support", fr: "Soutien" },
  "contact.subjectOther": { en: "Other", fr: "Autre" },
  "contact.message": { en: "Message", fr: "Message" },
  "contact.messagePlaceholder": { en: "How can we help you?", fr: "Comment pouvons-nous vous aider?" },
  "contact.send": { en: "Send Message", fr: "Envoyer le message" },
  "contact.fieldRequired": { en: "This field is required.", fr: "Ce champ est requis." },
  "contact.invalidEmail": { en: "Please enter a valid email.", fr: "Veuillez entrer un courriel valide." },
  "contact.successTitle": { en: "Message Sent!", fr: "Message envoyé!" },
  "contact.successDesc": { en: "Thank you for reaching out. We'll get back to you as soon as possible.", fr: "Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais." },
  "contact.sendAnother": { en: "Send Another Message", fr: "Envoyer un autre message" },
  "contact.errorTitle": { en: "Error", fr: "Erreur" },
  "contact.errorDesc": { en: "Something went wrong. Please try again.", fr: "Une erreur est survenue. Veuillez réessayer." },
  "contact.infoTitle": { en: "Contact Information", fr: "Informations de contact" },
  "contact.addressLabel": { en: "Address", fr: "Adresse" },
  "contact.phoneLabel": { en: "Phone", fr: "Téléphone" },
  "contact.emailLabel": { en: "Email", fr: "Courriel" },
  "contact.hoursLabel": { en: "Business Hours", fr: "Heures d'ouverture" },

  // Nav extras
  "nav.candidates": { en: "For Candidates", fr: "Pour les candidats" },

  // Employer form
  "employer.formTitle": { en: "Employer Request Form", fr: "Formulaire de demande employeur" },
  "employer.companyName": { en: "Company Name", fr: "Nom de l'entreprise" },
  "employer.companyNamePh": { en: "Acme Inc.", fr: "Acme Inc." },
  "employer.contactPerson": { en: "Contact Person Name", fr: "Nom de la personne-ressource" },
  "employer.contactPersonPh": { en: "John Doe", fr: "Jean Dupont" },
  "employer.companyAddress": { en: "Company Address", fr: "Adresse de l'entreprise" },
  "employer.companyAddressPh": { en: "123 Main St, Laval, QC", fr: "123 rue Principale, Laval, QC" },
  "employer.phone": { en: "Phone Number", fr: "Numéro de téléphone" },
  "employer.email": { en: "Email Address", fr: "Adresse courriel" },
  "employer.jobTitle": { en: "Job Title", fr: "Titre du poste" },
  "employer.jobTitlePh": { en: "e.g. Warehouse Worker", fr: "ex. Manutentionnaire" },
  "employer.industry": { en: "Your Industry", fr: "Votre secteur d'activité" },
  "employer.industryPh": { en: "Select an industry", fr: "Sélectionnez un secteur" },
  "employer.employeesNeeded": { en: "How Many Employees Needed", fr: "Combien d'employés nécessaires" },
  "employer.preferredContact": { en: "Preferred Method of Contact", fr: "Méthode de contact préférée" },
  "employer.contactPhone": { en: "Phone", fr: "Téléphone" },
  "employer.contactEmail": { en: "Email", fr: "Courriel" },
  "employer.contactEither": { en: "Either", fr: "Les deux" },
  "employer.comments": { en: "Comments", fr: "Commentaires" },
  "employer.commentsPh": { en: "Any additional details about your staffing needs...", fr: "Détails supplémentaires sur vos besoins en personnel..." },
  "employer.submit": { en: "Submit Employer Request", fr: "Soumettre la demande employeur" },
  "employer.successTitle": { en: "Request Submitted!", fr: "Demande soumise!" },
  "employer.successDesc": { en: "Thank you! We will review your request and get back to you shortly.", fr: "Merci! Nous examinerons votre demande et vous répondrons sous peu." },
  "employer.submitAnother": { en: "Submit Another Request", fr: "Soumettre une autre demande" },
  "employer.errorTitle": { en: "Error", fr: "Erreur" },
  "employer.errorDesc": { en: "Something went wrong. Please try again.", fr: "Une erreur est survenue. Veuillez réessayer." },

  // Candidate form
  "candidate.formTitle": { en: "Candidate Registration Form", fr: "Formulaire d'inscription candidat" },
  "candidate.fullName": { en: "Full Name", fr: "Nom complet" },
  "candidate.fullNamePh": { en: "John Doe", fr: "Jean Dupont" },
  "candidate.phone": { en: "Phone Number", fr: "Numéro de téléphone" },
  "candidate.email": { en: "Email Address", fr: "Adresse courriel" },
  "candidate.availability": { en: "Your Availability", fr: "Votre disponibilité" },
  "candidate.availabilityPh": { en: "Select availability", fr: "Sélectionnez la disponibilité" },
  "candidate.fullTime": { en: "Full-time", fr: "Temps plein" },
  "candidate.partTime": { en: "Part-time", fr: "Temps partiel" },
  "candidate.temporary": { en: "Temporary", fr: "Temporaire" },
  "candidate.licenseClass": { en: "Your Highest Driver's License Class", fr: "Votre classe de permis de conduire la plus élevée" },
  "candidate.licenseClassPh": { en: "Select license class", fr: "Sélectionnez la classe de permis" },
  "candidate.industry": { en: "Industry Applying To", fr: "Secteur d'activité visé" },
  "candidate.industryPh": { en: "Select an industry", fr: "Sélectionnez un secteur" },
  "candidate.workLocation": { en: "Work Location Preference", fr: "Préférence de lieu de travail" },
  "candidate.workLocationPh": { en: "Select a location", fr: "Sélectionnez un lieu" },
  "candidate.legalRight": { en: "Do You Have A Legal Right To Work In Canada?", fr: "Avez-vous le droit légal de travailler au Canada?" },
  "candidate.yes": { en: "Yes", fr: "Oui" },
  "candidate.no": { en: "No", fr: "Non" },
  "candidate.uploadCv": { en: "Upload Your CV And Other Documents", fr: "Téléchargez votre CV et autres documents" },
  "candidate.uploadCvPh": { en: "Click to upload (PDF, DOC, DOCX)", fr: "Cliquez pour télécharger (PDF, DOC, DOCX)" },
  "candidate.preferredContact": { en: "Preferred Method of Contact", fr: "Méthode de contact préférée" },
  "candidate.contactPhone": { en: "Phone", fr: "Téléphone" },
  "candidate.contactEmail": { en: "Email", fr: "Courriel" },
  "candidate.contactEither": { en: "Either", fr: "Les deux" },
  "candidate.comments": { en: "Comments", fr: "Commentaires" },
  "candidate.commentsPh": { en: "Anything else you'd like us to know...", fr: "Autre chose que vous aimeriez nous faire savoir..." },
  "candidate.submit": { en: "Submit Application", fr: "Soumettre la candidature" },
  "candidate.successTitle": { en: "Application Submitted!", fr: "Candidature soumise!" },
  "candidate.successDesc": { en: "Thank you for registering! We will review your application and contact you soon.", fr: "Merci pour votre inscription! Nous examinerons votre candidature et vous contacterons sous peu." },
  "candidate.submitAnother": { en: "Submit Another Application", fr: "Soumettre une autre candidature" },
  "candidate.errorTitle": { en: "Error", fr: "Erreur" },
  "candidate.errorDesc": { en: "Something went wrong. Please try again.", fr: "Une erreur est survenue. Veuillez réessayer." },
  "candidate.uploadError": { en: "Failed to upload file. Please try again.", fr: "Échec du téléchargement. Veuillez réessayer." },

  // Footer
  "footer.about": { en: "Inal Resources is a licensed recruitment agency based in Laval, Quebec, specializing in connecting qualified professionals with top employers across Canada.", fr: "Inal Resources est une agence de recrutement agréée basée à Laval, Québec, spécialisée dans la mise en relation de professionnels qualifiés avec les meilleurs employeurs au Canada." },
  "footer.quickLinks": { en: "Quick Links", fr: "Liens rapides" },
  "footer.contactUs": { en: "Contact Us", fr: "Contactez-nous" },
  "footer.hours": { en: "Business Hours", fr: "Heures d'ouverture" },
  "footer.weekdays": { en: "Mon - Fri: 8:00 AM - 6:00 PM", fr: "Lun - Ven: 8h00 - 18h00" },
  "footer.weekend": { en: "Sat - Sun: By appointment", fr: "Sam - Dim: Sur rendez-vous" },
  "footer.emergency": { en: "24/7 Emergency HR Line", fr: "Ligne RH d'urgence 24/7" },
  "footer.rights": { en: "All rights reserved.", fr: "Tous droits réservés." },
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
