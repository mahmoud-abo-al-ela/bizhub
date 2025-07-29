import { NextResponse } from "next/server";

export async function POST(req) {
  console.log("============ TEST WEBHOOK TRIGGERED ============");
  console.log("Request received at:", new Date().toISOString());

  // Log environment variables
  console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
  console.log(
    "SANITY_WEBHOOK_SECRET exists:",
    !!process.env.SANITY_WEBHOOK_SECRET
  );

  // Read and log headers
  const headers = Object.fromEntries(req.headers.entries());
  console.log("Headers:", JSON.stringify(headers, null, 2));

  // Read and log body
  const bodyText = await req.text();
  console.log("Raw body:", bodyText);

  // Try to parse JSON body
  try {
    const body = JSON.parse(bodyText);
    console.log("Parsed body:", JSON.stringify(body, null, 2));
  } catch (error) {
    console.log("Body is not valid JSON:", error.message);
  }

  // Return success response
  return NextResponse.json({
    success: true,
    message: "Test webhook received successfully",
    timestamp: new Date().toISOString(),
  });
}

// Also support GET requests for easy testing in browser
export async function GET(req) {
  console.log("============ TEST WEBHOOK GET REQUEST ============");
  console.log("GET request received at:", new Date().toISOString());

  return NextResponse.json({
    success: true,
    message: "Webhook test endpoint is working",
    instructions: "Send a POST request to this endpoint to test your webhook",
    timestamp: new Date().toISOString(),
  });
}
