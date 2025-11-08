import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar/Navbar.jsx";
import "./globals.css";
import Footer from "@/components/footer/Footer.jsx";

export const metadata = {
  title: {
    template:" %s | Subham",
    default:"Subham"

  },
  description: '...',
}
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Header Section */}
        <header className=" w-full bg-amber-300 relative">
          <p>THis a header for the scroll</p>
          <Navbar/>
          {/* <Navbar /> */}
        </header>
        {/* Main Section */}
        <main className="mt-[20px]">
          {children}
        </main>
        {/* Footer Section */}
        <Footer />
      </body>
    </html>
  );
}
