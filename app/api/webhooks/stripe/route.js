import { NextResponse } from "next/server";
import { headers } from "next/headers";
import stripe from "@/lib/stripe";
import {
  handlePaymentIntentSucceeded,
  handleCheckoutSessionCompleted,
  handleInvoicePaymentSucceeded,
  handleSubscriptionEvent,
  handleSubscriptionCancelled,
} from "@/lib/stripe-webhook-handlers";

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
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionEvent(event.data.object, event.type);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object);
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
