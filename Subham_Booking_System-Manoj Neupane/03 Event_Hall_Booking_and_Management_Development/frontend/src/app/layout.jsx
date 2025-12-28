import Navbar from "@/components/navbar/Navbar.jsx";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";
import Footer from "@/components/footer/Footer.jsx";
import { AuthProvider } from "@/contexts/AuthProvider.jsx";

export const metadata = {
  title: {
    template: " %s | Shubham",
    default: "Shubham"

  },
  description: 'Event Hall Booking and Management System',
}
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <AuthProvider>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_API_GOOGLE_CLIENT_ID}>

            <header className=" w-full bg-amber-300 relative">
              <p>THis a header for the scroll</p>
              <Navbar />
            </header>
            <main className="mt-[10px] flex-1">
              {children}
            </main>
            <footer className="relative bottom-0 w-ful bg-[#3a1224] text-gray-300 ">
              <Footer />
            </footer>
          </GoogleOAuthProvider>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { fontSize: "14px" },
          }}
        />
      </body>
    </html>
  );
}
