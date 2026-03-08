/**
 * Returns the appropriate bilingual field value based on the visitor's language
 * and the job's language_option setting.
 */
export const getBilingualField = (
  job: any,
  fieldEn: string,
  fieldFr: string,
  language: "en" | "fr"
): string => {
  const langOption = job.language_option || "en";
  const enValue = job[fieldEn] || "";
  const frValue = job[fieldFr] || "";

  if (langOption === "en") return enValue;
  if (langOption === "fr") return frValue || enValue; // fallback to EN if FR is empty
  // "both" — show based on visitor language
  if (language === "fr") return frValue || enValue;
  return enValue || frValue;
};

/**
 * Returns the job title based on language preference
 */
export const getJobTitle = (job: any, language: "en" | "fr"): string => {
  return getBilingualField(job, "title", "title_fr", language);
};

/**
 * Returns the job description based on language preference
 */
export const getJobDescription = (job: any, language: "en" | "fr"): string => {
  return getBilingualField(job, "description", "description_fr", language);
};

/**
 * Check if a job should be visible based on language filter
 */
export const isJobVisibleForLanguage = (job: any, language: "en" | "fr"): boolean => {
  const langOption = job.language_option || "en";
  if (langOption === "both") return true;
  // Show all jobs regardless of language setting — filtering is content-based
  return true;
};
