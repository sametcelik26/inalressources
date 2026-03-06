import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import logo from "@/assets/logo.avif";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer id="contact" className="bg-navy text-primary-foreground">
      {/* Upper footer */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Inal Resources" className="h-10 w-auto" />
              <span className="font-heading font-bold text-xl">Inal Resources</span>
            </div>
            <p className="text-sm text-primary-foreground/65 leading-relaxed font-body">
              {t("footer.about")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-base mb-4 text-accent">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2.5">
              {["nav.home", "nav.jobSeekers", "nav.employers", "nav.about", "nav.contact"].map((key) =>
              <li key={key}>
                  <a href="#" className="text-sm text-primary-foreground/65 hover:text-accent transition-colors font-body">
                    {t(key)}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-base mb-4 text-accent">{t("footer.contactUs")}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/65">
                <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                <span>3901, Avenue Bannantyne, Bureaux 204 et 210

Verdun (Québec) H4G 1C2</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/65">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span>(514 ) 7​62-0409</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/65">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span>info@inalressources.info</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-heading font-bold text-base mb-4 text-accent">{t("footer.hours")}</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/65">
                <Clock className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                <span>{t("footer.weekdays")}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/65">
                <Clock className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                <span>{t("footer.weekend")}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/65">
                <Phone className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                <span>{t("footer.emergency")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lower footer */}
      <div className="border-t border-navy-light">
        <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-primary-foreground/50 font-body">
            © {new Date().getFullYear()} Inal Resources. {t("footer.rights")}
          </p>
          <a href="https://www.inalressources.info/" target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary-foreground/50 hover:text-accent transition-colors font-body">
            
            www.inalressources.info
          </a>
        </div>
      </div>
    </footer>);

};

export default Footer;