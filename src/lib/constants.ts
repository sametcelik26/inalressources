/**
 * constants.ts
 * Shared data constants used across the app.
 * Import from here instead of duplication in individual components.
 */

export const industries = [
    "Construction",
    "Manufacturing",
    "Warehousing & Logistics",
    "Hospitality & Food Services",
    "Retail",
    "Healthcare",
    "Information Technology",
    "Finance & Banking",
    "Education",
    "Transportation",
    "Agriculture",
    "Mining & Resources",
    "Real Estate",
    "Telecommunications",
    "Energy & Utilities",
    "Other",
] as const;

export const licenseClasses = [
    "None",
    "Class 5 (G)",
    "Class 4 (G2)",
    "Class 3 (DZ)",
    "Class 2 (CZ)",
    "Class 1 (AZ)",
    "Other",
] as const;

export const workLocations = [
    "Montreal",
    "Laval",
    "Quebec City",
    "Gatineau",
    "Sherbrooke",
    "Longueuil",
    "Trois-Rivières",
    "Saguenay",
    "Lévis",
    "Terrebonne",
    "Toronto",
    "Ottawa",
    "Vancouver",
    "Calgary",
    "Edmonton",
    "Other",
] as const;

export const jobTypeLabels: Record<string, { en: string; fr: string }> = {
    full_time: { en: "Full Time", fr: "Temps plein" },
    part_time: { en: "Part Time", fr: "Temps partiel" },
    contract: { en: "Contract", fr: "Contrat" },
    temporary: { en: "Temporary", fr: "Temporaire" },
    internship: { en: "Internship", fr: "Stage" },
};

export const experienceLabels: Record<string, { en: string; fr: string }> = {
    entry: { en: "Entry Level", fr: "Débutant" },
    junior: { en: "Junior", fr: "Junior" },
    mid: { en: "Mid Level", fr: "Intermédiaire" },
    senior: { en: "Senior", fr: "Sénior" },
    executive: { en: "Executive", fr: "Exécutif" },
};
