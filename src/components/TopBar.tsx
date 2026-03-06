import { Shield, MapPin, Headphones, Phone } from "lucide-react";

const TopBar = () => {
  return (
    <div className="w-full bg-background border-b border-border">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between py-3 px-4 gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-lg">IR</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading font-bold text-navy text-lg tracking-tight">Inal Resources</span>
              <span className="text-[11px] text-muted-foreground font-body tracking-wide uppercase">Recruitment Agency</span>
            </div>
          </div>
        </div>

        {/* Info blocks */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* License */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-navy" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-muted-foreground">License</span>
              <span className="font-heading font-semibold text-foreground text-sm">AP-2000138</span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-navy" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-muted-foreground">3901, Avenue Bannantyne, Bureaux 204 et 210


</span>
              <span className="font-heading font-semibold text-foreground text-sm">Verdun, QC</span>
            </div>
          </div>

          {/* HR Services */}
          <div className="flex items-center gap-2 text-sm">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Headphones className="w-4 h-4 text-navy" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-muted-foreground">Available</span>
              <span className="font-heading font-semibold text-foreground text-sm">HR Services 24/7</span>
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