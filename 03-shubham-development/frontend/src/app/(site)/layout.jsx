import Navbar from "components/navbar/Navbar.jsx";
import Footer from "components/footer/Footer.jsx";

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full bg-amber-300 relative">
        <p>THis a header for the scroll</p>
        <Navbar />
      </header>
      <main className="mt-[10px] flex-1">{children}</main>
      <footer className="relative bottom-0 w-ful bg-[#3a1224] text-gray-300 ">
        <Footer />
      </footer>
    </div>
  );
}
