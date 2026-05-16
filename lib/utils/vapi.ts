import { createHmac } from "crypto";

export function verifyVapiSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature || !process.env.VAPI_WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", process.env.VAPI_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return `sha256=${expected}` === signature;
}
