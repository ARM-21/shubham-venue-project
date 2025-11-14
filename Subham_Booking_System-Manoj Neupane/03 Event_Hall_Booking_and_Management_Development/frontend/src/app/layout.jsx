import Navbar from "@/components/navbar/Navbar.jsx";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Footer from "@/components/footer/Footer.jsx";
import {AuthProvider} from "@/contexts/AuthProvider.jsx";

export const metadata = {
  title: {
    template: " %s | Subham",
    default: "Subham"

  },
  description: '...',
}
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <header className=" w-full bg-amber-300 relative">
            <p>THis a header for the scroll</p>
            <Navbar />
          </header>
          <main className="mt-[20px]">
            {children}
          </main>
          <Footer />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: { fontSize: "14px" },
            }}
          />
        </AuthProvider>

      </body>
    </html>
  );
}
