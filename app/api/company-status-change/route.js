import { NextResponse } from "next/server";
import {
  sendApprovalNotification,
  sendRejectionNotification,
} from "@/lib/email"; // adjust path as needed

export async function POST(req) {
  const body = await req.json();

  const { email, companyName, services, status, previousStatus } = body;

  const company = {
    email,
    companyName,
    services,
  };

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
