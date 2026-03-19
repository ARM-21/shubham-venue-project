import { Suspense } from "react";
import AuthPageClient from "./AuthPageClient";

export default async function AuthPage({ searchParams }) {
  const params = await searchParams;
  const redirect = params?.redirect;
  return (
    <Suspense fallback={<p className="p-8">Loading...</p>}>
      <AuthPageClient redirect={redirect} />
      
    </Suspense>
  );
}
