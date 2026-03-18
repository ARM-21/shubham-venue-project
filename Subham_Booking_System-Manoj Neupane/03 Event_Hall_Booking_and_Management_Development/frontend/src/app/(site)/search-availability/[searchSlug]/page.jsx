import { Suspense } from "react";
import SearchAvailabilityClient from "./SearchAvailabilityClient";

export default function HallPage({ params }) {
  const hallSlug = params?.searchSlug;

  return (
    <Suspense fallback={<p>Loading hall...</p>}>
      <SearchAvailabilityClient hallSlug={hallSlug} />
    </Suspense>
  );
}
