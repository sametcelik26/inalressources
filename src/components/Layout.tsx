import { ReactNode } from "react";
import TopBar from "./TopBar";
import NavBar from "./NavBar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <TopBar />
    <NavBar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default Layout;
