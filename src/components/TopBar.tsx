import { Shield, MapPin, Phone, Clock } from "lucide-react";
import logoTopbar from "@/assets/logo-topbar.avif";
import { useLanguage } from "@/contexts/LanguageContext";

const TopBar = () => {
  const { language } = useLanguage();

  const t = {
    license: language === 'fr' ? 'Permis' : 'License',
  };

  return (
    <div className="w-full bg-[hsl(var(--topbar-bg))] border-b border-[hsl(var(--topbar-border))]">
      <div className="container mx-auto flex flex-col items-center justify-between py-4 md:py-5 px-4 gap-3 md:gap-4 md:flex-row">
        {/* Logo */}
        <div className="flex items-center shrink-0">
          <img src={logoTopbar} alt="INAL Ressources - Licensed Recruitment Agency" className="h-16 md:h-28 w-auto object-contain drop-shadow-lg" width={200} height={112} fetchPriority="high" />
        </div>

        {/* Info blocks - grid on mobile, flex on desktop */}
        <div className="w-full md:w-auto grid grid-cols-2 md:flex md:flex-row md:items-center gap-3 md:gap-4 lg:gap-6">
          {/* License */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] md:text-xs text-primary-foreground/60">{t.license}</span>
              <span className="font-heading font-semibold text-primary-foreground text-xs md:text-sm">AP-2000138</span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] md:text-xs text-primary-foreground/60 hidden sm:inline">3901, Avenue Bannantyne, Bureaux 204 et 210</span>
              <span className="text-[10px] md:text-xs text-primary-foreground/60 sm:hidden">3901, Av. Bannantyne</span>
              <span className="font-heading font-semibold text-primary-foreground text-xs md:text-sm">Verdun, QC</span>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] md:text-xs text-primary-foreground/60">
                {language === 'fr' ? 'Lun - Ven' : 'Mon - Fri'}
              </span>
              <span className="font-heading font-semibold text-primary-foreground text-xs md:text-sm">
                {language === 'fr' ? '8h00 - 17h00' : '8:00 AM - 5:00 PM'}
              </span>
            </div>
          </div>

          {/* Phone button */}
          <a href="tel:5147620409" className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 md:px-5 md:py-2.5 rounded-full font-heading font-semibold text-xs md:text-sm hover:bg-orange-hover transition-colors shadow-md hover:shadow-lg">
            <Phone className="w-3.5 h-3.5 md:w-4 md:h-4" />
            (514) 762-0409
          </a>
        </div>
      </div>
    </div>);
};

export default TopBar;