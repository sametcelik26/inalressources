import { Shield, MapPin, Headphones, Phone } from "lucide-react";
import logoTopbar from "@/assets/logo-topbar.avif";
import { useLanguage } from "@/contexts/LanguageContext";

const TopBar = () => {
  const { language } = useLanguage();

  const t = {
    license: language === 'fr' ? 'Permis' : 'License',
    available: language === 'fr' ? 'Disponible' : 'Available',
    hrServices: language === 'fr' ? 'Services RH 24/7' : 'HR Services 24/7',
  };

  return (
    <div className="w-full bg-[hsl(var(--topbar-bg))] border-b border-[hsl(var(--topbar-border))]">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-5 px-4 gap-4">
        {/* Logo */}
        <div className="flex items-center shrink-0">
          <img src={logoTopbar} alt="Inal Resources" className="h-28 w-auto object-contain drop-shadow-lg" />
        </div>

        {/* Info blocks */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* License */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-primary-foreground/60">{t.license}</span>
              <span className="font-heading font-semibold text-primary-foreground text-sm">AP-2000138</span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-primary-foreground/60">3901, Avenue Bannantyne, Bureaux 204 et 210</span>
              <span className="font-heading font-semibold text-primary-foreground text-sm">Verdun, QC</span>
            </div>
          </div>

          {/* HR Services */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4 text-accent" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-primary-foreground/60">{t.available}</span>
              <span className="font-heading font-semibold text-primary-foreground text-sm">{t.hrServices}</span>
            </div>
          </div>

          {/* Phone button */}
          <a href="tel:5147620409" className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-full font-heading font-semibold text-sm hover:bg-orange-hover transition-colors shadow-md hover:shadow-lg">
            <Phone className="w-4 h-4" />
            (514) 762-0409
          </a>
        </div>
      </div>
    </div>);
};

export default TopBar;