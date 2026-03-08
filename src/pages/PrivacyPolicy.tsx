import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicy = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy-light to-navy py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
            {t("privacy.title")}
          </h1>
          <p className="text-primary-foreground/70 font-body text-sm">
            {t("privacy.lastUpdate")}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-lg max-w-none space-y-8 text-foreground/80 font-body leading-relaxed">

            <p>{t("privacy.intro1")}</p>
            <p>{t("privacy.intro2")}</p>
            <p>{t("privacy.intro3")}</p>
            <p>{t("privacy.intro4")}</p>

            <h2 className="font-heading font-bold text-xl text-foreground mt-10 mb-3">{t("privacy.objectivesTitle")}</h2>
            <p>{t("privacy.objectives1")}</p>
            <p>{t("privacy.objectives2")}</p>

            <h2 className="font-heading font-bold text-xl text-foreground mt-10 mb-3">{t("privacy.locationTitle")}</h2>
            <p>{t("privacy.location1")}</p>

            <h2 className="font-heading font-bold text-xl text-foreground mt-10 mb-3">{t("privacy.consentTitle")}</h2>
            <p>{t("privacy.consent1")}</p>

            <h2 className="font-heading font-bold text-xl text-foreground mt-10 mb-3">{t("privacy.conservationTitle")}</h2>
            <p>{t("privacy.conservation1")}</p>
            <p>{t("privacy.conservation2")}</p>

            <p className="text-sm text-muted-foreground mt-10">{t("privacy.updateNote")}</p>
            <p className="text-sm text-muted-foreground">{t("privacy.lastUpdate")}</p>

            <div className="mt-10 p-6 bg-muted rounded-lg">
              <p className="font-heading font-bold text-foreground mb-2">INAL Ressources</p>
              <p className="text-sm">3901 Avenue Bannantyne, bureaux 204 et 210</p>
              <p className="text-sm">Tél : 514 762 0409</p>
              <p className="text-sm">info@inalressources.com</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicy;