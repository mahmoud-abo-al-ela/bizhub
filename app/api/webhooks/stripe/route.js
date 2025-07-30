import { NextResponse } from "next/server";
import { headers } from "next/headers";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { sendPaymentConfirmation } from "@/lib/email";
import { updatePaymentStatus } from "@/lib/sanity-actions";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("Stripe-Signature");

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { success: false, message: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle specific events
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case "payment_link.created":
        console.log("Payment link created:", event.data.object.url);
        break;
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return NextResponse.json(
      { success: false, message: `Webhook error: ${err.message}` },
      { status: 500 }
    );
  }
}

// Handle successful payment from payment link
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    // Check if this payment is related to a company submission
    if (!paymentIntent.metadata || !paymentIntent.metadata.companyId) {
      console.log("Payment not related to a company submission");
      return;
    }

    const companyId = paymentIntent.metadata.companyId;
    console.log(`Processing payment for company submission: ${companyId}`);

    // Get the company submission
    const submission = await backendClient.getDocument(companyId);
    if (!submission) {
      console.error(`Company submission not found: ${companyId}`);
      return;
    }

    // Update payment status to trigger company creation if approved
    const result = await updatePaymentStatus(companyId, "paid");

    if (result.success) {
      // Update customer ID and subscription details
      await backendClient
        .patch(companyId)
        .set({
          stripeCustomerId: paymentIntent.customer,
          lastPaymentDate: new Date().toISOString(),
          currentPeriodEnd: new Date(
            Date.now() +
              (submission.billingCycle === "yearly" ? 365 : 30) *
                24 *
                60 *
                60 *
                1000
          ).toISOString(),
        })
        .commit();

      // Send payment confirmation email
      await sendPaymentConfirmation(submission);

      console.log(
        `Payment processed and company created for: ${submission.companyName}`
      );
    } else {
      console.error(`Failed to update payment status: ${result.message}`);
    }
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error);
  }
}

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session) {
  try {
    if (session.mode !== "payment" && session.mode !== "subscription") return;

    const metadata = session.metadata;
    if (!metadata) return;

    // Find company submission in Sanity
    const query = `*[_type == "companySubmission" && email == $email && companyName == $companyName][0]`;
    const submission = await backendClient.fetch(query, {
      email: metadata.email,
      companyName: metadata.companyName,
    });

    if (!submission) {
      console.error("Company submission not found in Sanity");
      return;
    }

    // Update payment status to trigger company creation if approved
    const result = await updatePaymentStatus(submission._id, "paid");

    if (result.success) {
      // Update subscription details
      await backendClient
        .patch(submission._id)
        .set({
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          lastPaymentDate: new Date().toISOString(),
          currentPeriodEnd: new Date(
            Date.now() +
              (submission.billingCycle === "yearly" ? 365 : 30) *
                24 *
                60 *
                60 *
                1000
          ).toISOString(),
        })
        .commit();

      // Send payment confirmation
      await sendPaymentConfirmation(submission);

      console.log(
        `Payment processed and company created for: ${submission.companyName}`
      );
    }
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
  }
}
