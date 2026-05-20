import crypto from "crypto";
import axios from "axios";
import ENV from "../../config/env.config.js";
import { httpError } from "../../utils/http.utils.js";

const SIGNED_FIELDS = "total_amount,transaction_uuid,product_code";

function ensureEsewaConfig() {
  if (!ENV.ESEWA_PRODUCT_CODE) throw httpError(500, "ESEWA_PRODUCT_CODE not configured");
  if (!ENV.ESEWA_SECRET_KEY) throw httpError(500, "ESEWA_SECRET_KEY not configured");
  if (!ENV.ESEWA_INIT_URL) throw httpError(500, "ESEWA_INIT_URL not configured");
  if (!ENV.ESEWA_STATUS_URL) throw httpError(500, "ESEWA_STATUS_URL not configured");
}

export function buildEsewaSignature({ totalAmount, transactionUuid, productCode, secretKey }) {
  const data = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac("sha256", secretKey).update(data).digest("base64");
}

export function buildEsewaPayload({ amount, transactionUuid, successUrl, failureUrl }) {
  ensureEsewaConfig();
  const totalAmount = Number(amount).toFixed(2);
  const productCode = ENV.ESEWA_PRODUCT_CODE;
  const signature = buildEsewaSignature({
    totalAmount,
    transactionUuid,
    productCode,
    secretKey: ENV.ESEWA_SECRET_KEY,
  });

  return {
    amount: totalAmount,
    tax_amount: "0",
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
    product_code: productCode,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: SIGNED_FIELDS,
    signature,
  };
}

export async function verifyEsewaTransaction({ transactionUuid, totalAmount }) {
  ensureEsewaConfig();
  const productCode = ENV.ESEWA_PRODUCT_CODE;
  const response = await axios.get(ENV.ESEWA_STATUS_URL, {
    params: {
      product_code: productCode,
      transaction_uuid: transactionUuid,
      total_amount: Number(totalAmount).toFixed(2),
    },
  });
  return response.data || {};
}

/**
 * Verify eSewa v2 `data` parameter sent to the success URL.
 * Decodes base64 JSON, verifies HMAC-SHA256 signature, returns decoded payload.
 * Throws 400 if signature is invalid.
 */
export function verifyEsewaData(encodedData) {
  ensureEsewaConfig();
  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));
  } catch {
    throw httpError(400, "Invalid eSewa data payload");
  }

  const { signed_field_names, signature } = decoded;
  if (!signed_field_names || !signature) {
    throw httpError(400, "eSewa data missing signature fields");
  }

  const message = signed_field_names
    .split(",")
    .map((field) => `${field}=${decoded[field] ?? ""}`)
    .join(",");

  const expected = crypto
    .createHmac("sha256", ENV.ESEWA_SECRET_KEY)
    .update(message)
    .digest("base64");

  if (signature !== expected) {
    throw httpError(400, "eSewa signature mismatch");
  }

  return decoded;
}

export function getEsewaInitUrl() {
  ensureEsewaConfig();
  return ENV.ESEWA_INIT_URL;
}
