import { Suspense } from "react";
import PaymentVerifyClient from "./PaymentVerifyClient";

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<p>Verifying payment...</p>}>
      <PaymentVerifyClient />
    </Suspense>
  );
}
