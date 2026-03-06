import { Shield, MapPin, Headphones, Phone } from "lucide-react";
import logoTopbar from "@/assets/logo-topbar.avif";

const TopBar = () => {
  return (
    <div className="w-full bg-navy border-b border-border">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-3 px-4 gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <img src={logoTopbar} alt="Inal Resources" className="h-10 w-auto" />
        </div>

        {/* Info blocks */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* License */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-primary-foreground/60">License</span>
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
              <span className="text-xs text-primary-foreground/60">Available</span>
              <span className="font-heading font-semibold text-primary-foreground text-sm">HR Services 24/7</span>
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