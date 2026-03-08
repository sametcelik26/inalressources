import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={language === "fr" ? "Accueil" : "Home"}
        description={
          language === "fr"
            ? "INAL Ressources — Agence de recrutement licenciée à Verdun, Québec. Services bilingues EN/FR pour connecter les professionnels qualifiés avec les meilleurs employeurs au Canada."
            : "INAL Ressources — Licensed recruitment agency in Verdun, Quebec. Bilingual EN/FR staffing services connecting qualified professionals with top employers across Canada."
        }
        canonical="https://www.inalressources.info/"
      />
      <TopBar />
      <NavBar />
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
