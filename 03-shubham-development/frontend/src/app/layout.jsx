import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./globals.css";
import { AuthProvider } from "contexts/AuthProvider.jsx";
import QueryProvider from "providers/QueryProvider.jsx";

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
      <body className="min-h-screen bg-gray-50">
        <QueryProvider>
          <AuthProvider>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_API_GOOGLE_CLIENT_ID}>
              {children}
            </GoogleOAuthProvider>
          </AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: { fontSize: "14px" },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
