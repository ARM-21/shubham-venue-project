import { Suspense } from "react";
import SearchAvailabilityAllClient from "./SearchAvailabilityAllClient";

export default function AllHallsPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading availability...</p>}>
      <SearchAvailabilityAllClient />
    </Suspense>
  );
}
