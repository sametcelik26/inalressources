import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Menu, X, User, LogOut, LayoutDashboard, MessageSquare } from "lucide-react";

const NavBar = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, role, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const publicNav = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.jobs"), to: "/jobs" },
    { label: t("nav.about"), to: "/#about" },
    { label: t("nav.contact"), to: "/#contact" },
  ];

  const authNav = user
    ? [
        { label: t("nav.dashboard"), to: "/dashboard", icon: LayoutDashboard },
        { label: t("nav.messages"), to: "/messages", icon: MessageSquare },
        { label: t("nav.profile"), to: "/profile", icon: User },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-navy shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <ul className="hidden md:flex items-center gap-1">
          {publicNav.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="px-4 py-2 text-sm font-heading font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-navy-light rounded-md transition-all duration-200"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {authNav.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="px-4 py-2 text-sm font-heading font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-navy-light rounded-md transition-all duration-200 flex items-center gap-1.5"
              >
                {item.icon && <item.icon className="w-3.5 h-3.5" />}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          {/* Language toggle */}
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

          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-heading font-semibold text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> {t("nav.logout")}
            </button>
          ) : (
            <Link
              to="/auth"
              className="px-5 py-1.5 text-xs font-heading font-semibold bg-accent text-accent-foreground rounded-full hover:bg-orange-hover transition-colors"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-primary-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-navy-dark border-t border-navy-light">
          <ul className="flex flex-col py-2">
            {[...publicNav, ...authNav].map((item) => (
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
            {user ? (
              <li>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block w-full text-left px-6 py-3 text-sm font-heading font-medium text-primary-foreground/80 hover:text-primary-foreground hover:bg-navy-light"
                >
                  {t("nav.logout")}
                </button>
              </li>
            ) : (
              <li>
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="block px-6 py-3 text-sm font-heading font-medium text-accent">
                  {t("nav.login")}
                </Link>
              </li>
            )}
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
