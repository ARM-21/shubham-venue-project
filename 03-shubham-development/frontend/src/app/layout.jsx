import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./global.css";
import { AuthProvider } from "contexts/AuthProvider.jsx";
import QueryProvider from "providers/QueryProvider.jsx";
import RAGChat from "components/RAGChat.jsx";

export const metadata = {
  title: {
    template: " %s | Shubham",
    default: "Shubham"

  },
  description: 'Event Hall Booking and Management System',
}

export default function RootLayout({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_API_GOOGLE_CLIENT_ID || '';

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <QueryProvider>
          <AuthProvider>
            {googleClientId && (
              <GoogleOAuthProvider clientId={googleClientId}>
                {children}
              </GoogleOAuthProvider>
            )}
            {!googleClientId && children}
          </AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: { fontSize: "14px" },
            }}
          />
        </QueryProvider>
        {/* AI FAQ Assistant Widget */}
        <RAGChat />
      </body>
    </html>
  );
}
