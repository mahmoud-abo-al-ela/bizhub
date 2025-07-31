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
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      case "customer.subscription.created":
        await handleCustomerSubscriptionCreated(event.data.object);
        break;
      case "customer.subscription.updated":
        await handleCustomerSubscriptionUpdated(event.data.object);
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

// Helper function to check if a submission has a valid stripeCustomerId
async function hasValidStripeCustomerId(submission) {
  return (
    submission &&
    submission.stripeCustomerId &&
    submission.stripeCustomerId.trim() !== ""
  );
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
      console.error(
        `Company submission not found: ${companyId} from payment intent succeeded`
      );
      return;
    }

    // Check if stripeCustomerId is already linked - if not, ignore this event
    if (!(await hasValidStripeCustomerId(submission))) {
      console.log(
        `Ignoring payment_intent.succeeded - stripeCustomerId not yet linked for: ${companyId}`
      );
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

      console.log(`Payment processed for: ${submission.companyName}`);
    } else {
      console.error(`Failed to update payment status: ${result.message}`);
    }
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error);
  }
}

// Handle successful checkout session - ONLY this event patches Sanity
async function handleCheckoutSessionCompleted(session) {
  try {
    if (session.mode !== "subscription" && session.mode !== "payment") return;

    const metadata = session.metadata;
    if (!metadata?.companyId) {
      console.error("❌ Missing metadata or companyId in session");
      return;
    }

    const submission = await backendClient.getDocument(metadata.companyId);
    if (!submission) {
      console.error(`❌ Submission not found for ID: ${metadata.companyId}`);
      return;
    }

    // Always update payment status first
    const updateResult = await updatePaymentStatus(submission._id, "paid");
    if (!updateResult.success) {
      console.error("❌ Failed to update payment status in Sanity");
      return;
    }

    const patchData = {
      lastPaymentDate: new Date().toISOString(),
    };

    if (!submission.stripeCustomerId) {
      patchData.stripeCustomerId = session.customer;
    }

    if (session.mode === "subscription" && session.subscription) {
      const stripeSub = await stripeClient.subscriptions.retrieve(
        session.subscription
      );
      patchData.stripeSubscriptionId = stripeSub.id;
      patchData.subscriptionStatus = stripeSub.status;
      patchData.currentPeriodEnd = new Date(
        stripeSub.current_period_end * 1000
      ).toISOString();
    } else {
      const days = submission.billingCycle === "yearly" ? 365 : 30;
      patchData.currentPeriodEnd = new Date(
        Date.now() + days * 86400000
      ).toISOString();
    }

    await backendClient.patch(submission._id).set(patchData).commit();
    await sendPaymentConfirmation(submission);

    console.log(`✅ Payment processed for: ${submission.companyName}`);
  } catch (error) {
    console.error("❌ Error in handleCheckoutSessionCompleted:", error.message);
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log(`Processing invoice payment: ${invoice.id}`);

    const customerId = invoice.customer;
    if (!customerId) {
      console.log("❌ No customer ID found in invoice");
      return;
    }

    // Find the submission with this Stripe customer ID
    const query = `*[_type == "applications" && stripeCustomerId == $customerId][0]`;
    const submission = await backendClient.fetch(query, { customerId });

    if (!submission) {
      console.log(
        `⚠️ No company submission found for customer: ${customerId} from invoice payment`
      );
      return;
    }

    console.log(
      `✅ Found submission for invoice payment: ${submission.companyName}`
    );

    // Update the payment status in your app
    const result = await updatePaymentStatus(submission._id, "paid");

    if (result.success) {
      // Update the document in Sanity
      await backendClient
        .patch(submission._id)
        .set({
          lastPaymentDate: new Date().toISOString(),
          currentPeriodEnd: new Date(invoice.period_end * 1000).toISOString(),
        })
        .commit();

      // Optionally notify the company
      await sendPaymentConfirmation(submission);

      console.log(
        `✅ Invoice payment processed for: ${submission.companyName}`
      );
    } else {
      console.error(`❌ Failed to update payment status: ${result.message}`);
    }
  } catch (error) {
    console.error("❌ Error handling invoice payment succeeded:", error);
  }
}

// Handle customer subscription created
async function handleCustomerSubscriptionCreated(subscription) {
  try {
    console.log(`Processing subscription created: ${subscription.id}`);

    const customerId = subscription.customer;
    if (!customerId) {
      console.log("No customer ID found in subscription");
      return;
    }

    let submission = null;

    // Prefer companyId from metadata
    if (subscription.metadata?.companyId) {
      submission = await backendClient.getDocument(
        subscription.metadata.companyId
      );
    }

    // If not found by companyId, try to find by email
    if (!submission) {
      const query = `*[_type == "applications" && stripeCustomerId == $customerId][0]`;
      submission = await backendClient.fetch(query, { customerId });
    }

    if (!submission) {
      console.log(
        `No company submission found for customer: ${customerId} from subscription created`
      );
      return;
    }

    // Check if stripeCustomerId is already linked - if not, ignore this event
    if (!(await hasValidStripeCustomerId(submission))) {
      console.log(
        `Ignoring customer.subscription.created - stripeCustomerId not yet linked for customer: ${customerId}`
      );
      return;
    }

    console.log(
      `Found submission for subscription created: ${submission.companyName}`
    );

    // Update subscription details
    await backendClient
      .patch(submission._id)
      .set({
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      })
      .commit();

    console.log(`Subscription details updated for: ${submission.companyName}`);
  } catch (error) {
    console.error("Error handling customer subscription created:", error);
  }
}

// Handle customer subscription updated
async function handleCustomerSubscriptionUpdated(subscription) {
  try {
    console.log(`Processing subscription updated: ${subscription.id}`);

    const customerId = subscription.customer;
    if (!customerId) {
      console.log("No customer ID found in subscription");
      return;
    }

    let submission = null;

    // Prefer companyId from metadata
    if (subscription.metadata?.companyId) {
      submission = await backendClient.getDocument(
        subscription.metadata.companyId
      );
    }

    if (!submission) {
      const query = `*[_type == "applications" && stripeCustomerId == $customerId][0]`;
      submission = await backendClient.fetch(query, { customerId });
    }

    if (!submission) {
      console.log(
        `No company submission found for customer: ${customerId} from subscription updated`
      );
      return;
    }

    // Check if stripeCustomerId is already linked - if not, ignore this event
    if (!(await hasValidStripeCustomerId(submission))) {
      console.log(
        `Ignoring customer.subscription.updated - stripeCustomerId not yet linked for customer: ${customerId}`
      );
      return;
    }

    console.log(
      `Found submission for subscription updated: ${submission.companyName}`
    );

    // Update subscription status
    await backendClient
      .patch(submission._id)
      .set({
        subscriptionStatus: subscription.status,
        currentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
      })
      .commit();

    // If subscription is active and payment status is not paid, update it
    if (
      subscription.status === "active" &&
      submission.paymentStatus !== "paid"
    ) {
      const result = await updatePaymentStatus(submission._id, "paid");
      if (result.success) {
        console.log(
          `Payment status updated to paid for: ${submission.companyName}`
        );
      }
    }

    console.log(`Subscription status updated for: ${submission.companyName}`);
  } catch (error) {
    console.error("Error handling customer subscription updated:", error);
  }
}
