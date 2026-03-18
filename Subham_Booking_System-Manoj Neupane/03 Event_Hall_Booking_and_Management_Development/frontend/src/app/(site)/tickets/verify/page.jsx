import { Suspense } from "react";
import TicketVerifyClient from "./TicketVerifyClient";

export default function TicketVerifyPage() {
  return (
    <Suspense fallback={<p>Verifying ticket payment...</p>}>
      <TicketVerifyClient />
    </Suspense>
  );
}
