import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X } from "lucide-react";

const NavBar = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.employers"), to: "/employers" },
    { label: t("nav.candidates"), to: "/candidates" },
    { label: t("nav.jobs"), to: "/jobs" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-navy shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <ul className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="px-4 py-2 text-sm font-heading font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-navy-light rounded-md transition-all duration-200"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-0 bg-navy-dark rounded-full p-0.5">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 text-xs font-heading font-semibold rounded-full transition-all duration-200 ${
                language === "en" ? "bg-accent text-accent-foreground" : "text-primary-foreground/60 hover:text-primary-foreground"
              }`}
            >EN</button>
            <button
              onClick={() => setLanguage("fr")}
              className={`px-3 py-1 text-xs font-heading font-semibold rounded-full transition-all duration-200 ${
                language === "fr" ? "bg-accent text-accent-foreground" : "text-primary-foreground/60 hover:text-primary-foreground"
              }`}
            >FR</button>
          </div>
        </div>

        <button className="md:hidden text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-navy-dark border-t border-navy-light">
          <ul className="flex flex-col py-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-6 py-3 text-sm font-heading font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-navy-light transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 px-6 pb-4">
            <button onClick={() => { setLanguage("en"); setMobileOpen(false); }} className={`px-4 py-1.5 text-xs font-heading font-semibold rounded-full transition-all ${language === "en" ? "bg-accent text-accent-foreground" : "text-primary-foreground/60 border border-primary-foreground/20"}`}>EN</button>
            <button onClick={() => { setLanguage("fr"); setMobileOpen(false); }} className={`px-4 py-1.5 text-xs font-heading font-semibold rounded-full transition-all ${language === "fr" ? "bg-accent text-accent-foreground" : "text-primary-foreground/60 border border-primary-foreground/20"}`}>FR</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
