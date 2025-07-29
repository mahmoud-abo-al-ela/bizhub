import { NextResponse } from "next/server";
import {
  sendApprovalNotification,
  sendRejectionNotification,
} from "@/lib/email";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
const secret = process.env.SANITY_WEBHOOK_SECRET; // add this in your .env file

export async function POST(req) {
  const signature = req.headers[SIGNATURE_HEADER_NAME];
  const bodyText = await req.text(); // read body as text for verification

  // Verify signature
  if (!(await isValidSignature(bodyText, signature, secret))) {
    return NextResponse.json(
      { success: false, message: "Invalid signature" },
      { status: 401 }
    );
  }

  // Parse JSON only after verification
  const body = JSON.parse(bodyText);
  const { email, companyName, services, status, previousStatus } = body;

  const company = { email, companyName, services };

  console.log(
    `Status changed from ${previousStatus} to ${status} for ${companyName}`
  );

  if (status === "approved") {
    await sendApprovalNotification(company);
  } else if (status === "rejected") {
    await sendRejectionNotification(company);
  }

  return NextResponse.json({
    success: true,
    message: "Status changed and email sent",
  });
}
