import { ReactNode } from "react";
import TopBar from "./TopBar";
import NavBar from "./NavBar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

interface LayoutProps {
  children: ReactNode;
  mainClassName?: string;
}

const Layout = ({ children, mainClassName }: LayoutProps) => (
  <div className="min-h-screen flex flex-col">
    <TopBar />
    <NavBar />
    <main className={`flex-1 ${mainClassName ?? ""}`}>{children}</main>
    <Footer />
    <ScrollToTop />
  </div>
);

export default Layout;

