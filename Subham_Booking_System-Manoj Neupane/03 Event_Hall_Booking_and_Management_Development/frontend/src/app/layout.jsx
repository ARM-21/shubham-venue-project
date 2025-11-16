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
  description: '...',
}
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_API_GOOGLE_CLIENT_ID}>
            <header className=" w-full bg-amber-300 relative">
              <p>THis a header for the scroll</p>
              <Navbar />
            </header>
            <main className="mt-[10px]">
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
          </GoogleOAuthProvider>
        </AuthProvider>

      </body>
    </html>
  );
}
