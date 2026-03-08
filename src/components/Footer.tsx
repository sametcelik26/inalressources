import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.avif";

const quickLinks = [
  { key: "nav.home", to: "/" },
  { key: "nav.jobSeekers", to: "/candidates" },
  { key: "nav.employers", to: "/employers" },
  { key: "nav.about", to: "/#about" },
  { key: "nav.contact", to: "/contact" },
];

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer id="contact" className="bg-navy text-primary-foreground">
      {/* Upper footer */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src={logo} alt="Inal Resources" className="h-16 w-auto object-contain drop-shadow-md" />
              <span className="font-heading font-bold text-xl">Inal Resources</span>
            </div>
            <p className="text-sm text-primary-foreground/65 leading-relaxed font-body mb-4">
              {t("footer.about")}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/company/inal-ressources/posts/?feedView=all&viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a
                href="https://www.instagram.com/inalressources/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-accent flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-base mb-4 text-accent">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ key, to }) => (
                <li key={key}>
                  <Link to={to} className="text-sm text-primary-foreground/65 hover:text-accent transition-colors font-body">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-base mb-4 text-accent">{t("footer.contactUs")}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-primary-foreground/65">
                <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                <span>3901, Avenue Bannantyne, Bureaux 204 et 210, Verdun (Québec) H4G 1C2</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/65">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span>(514) 762-0409</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/65">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span>info@inalressources.com</span>
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
          <div className="flex items-center gap-4">
            <Link
              to="/privacy-policy"
              className="text-xs text-primary-foreground/50 hover:text-accent transition-colors font-body"
            >
              {t("footer.privacy")}
            </Link>
            <a href="https://www.inalressources.info/" target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary-foreground/50 hover:text-accent transition-colors font-body">
              www.inalressources.info
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;