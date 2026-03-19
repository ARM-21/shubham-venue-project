import { Suspense } from "react";
import AuthPageClient from "./AuthPageClient";

export default function AuthPage({ searchParams }) {
  const redirect = searchParams?.redirect;
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <AuthPageClient redirect={redirect} />
      
    </Suspense>
  );
}
