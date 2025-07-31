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

// Helper function to check if a submission has a valid stripeCustomerId
function hasValidStripeCustomerId(submission) {
  return (
    submission &&
    submission.stripeCustomerId &&
    submission.stripeCustomerId.trim() !== ""
  );
}

// Helper function to find submission by customer ID or company ID
async function findSubmission(subscription) {
  let submission = null;
  const customerId = subscription.customer;

  if (!customerId) {
    console.log("No customer ID found in subscription");
    return null;
  }

  // Prefer companyId from metadata
  if (subscription.metadata?.companyId) {
    submission = await backendClient.getDocument(
      subscription.metadata.companyId
    );
  }

  // If not found by companyId, try to find by customer ID
  if (!submission) {
    const query = `*[_type == "applications" && stripeCustomerId == $customerId][0]`;
    submission = await backendClient.fetch(query, { customerId });
  }

  return submission;
}

// Helper function to update both submission and company with subscription data
async function updateSubscriptionData(submission, subscriptionData) {
  // Update the submission
  await backendClient.patch(submission._id).set(subscriptionData).commit();
  console.log(
    `Subscription details updated for submission: ${submission.companyName}`
  );

  // Also update the company document if it exists
  if (submission.processedToCompany && submission.companyReference?._ref) {
    try {
      await backendClient
        .patch(submission.companyReference._ref)
        .set(subscriptionData)
        .commit();
      console.log(
        `Subscription details also updated for company: ${submission.companyName}`
      );
    } catch (error) {
      console.error(
        `Error updating company subscription details: ${error.message}`
      );
    }
  }
}

// Handle successful payment from payment link
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    // Check if this payment is related to a company submission
    if (!paymentIntent.metadata?.companyId) {
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

    // Check if stripeCustomerId is already linked - if not, ignore this event
    if (!hasValidStripeCustomerId(submission)) {
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
              (submission.billingCycle === "yearly" ? 365 : 30) * 86400000
          ).toISOString(),
        })
        .commit();

      await sendPaymentConfirmation(submission);
      console.log(`Payment processed for: ${submission.companyName}`);
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
    if (session.mode !== "subscription" && session.mode !== "payment") return;

    if (!session.metadata?.companyId) {
      console.error("Missing metadata or companyId in session");
      return;
    }

    const submission = await backendClient.getDocument(
      session.metadata.companyId
    );
    if (!submission) {
      console.error(
        `Submission not found for ID: ${session.metadata.companyId}`
      );
      return;
    }

    // Prepare patch data
    const patchData = {
      lastPaymentDate: new Date().toISOString(),
    };

    if (!submission.stripeCustomerId) {
      patchData.stripeCustomerId = session.customer;
    }

    // For subscription mode, get subscription details
    if (session.mode === "subscription" && session.subscription) {
      try {
        // Store subscription ID as fallback
        patchData.stripeSubscriptionId = session.subscription;
        patchData.subscriptionStatus = "active";

        // Try to get full details
        const stripeSub = await stripe.subscriptions.retrieve(
          session.subscription
        );
        patchData.stripeSubscriptionId = stripeSub.id;
        patchData.subscriptionStatus = stripeSub.status;
        patchData.currentPeriodEnd = new Date(
          stripeSub.current_period_end * 1000
        ).toISOString();
      } catch (error) {
        console.error(
          `Error retrieving subscription details: ${error.message}`
        );

        // Set default period end if needed
        if (!patchData.currentPeriodEnd) {
          const days = submission.billingCycle === "yearly" ? 365 : 30;
          patchData.currentPeriodEnd = new Date(
            Date.now() + days * 86400000
          ).toISOString();
        }
      }
    }

    // Apply the patch
    await backendClient.patch(submission._id).set(patchData).commit();

    // Update payment status which may trigger company creation
    const updateResult = await updatePaymentStatus(submission._id, "paid");
    if (!updateResult.success) {
      console.error("Failed to update payment status in Sanity");
      return;
    }

    await sendPaymentConfirmation(submission);
    console.log(`Payment processed for: ${submission.companyName}`);
  } catch (error) {
    console.error("Error in handleCheckoutSessionCompleted:", error.message);
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log(`Processing invoice payment: ${invoice.id}`);

    const customerId = invoice.customer;
    if (!customerId) {
      console.log("No customer ID found in invoice");
      return;
    }

    // Find the submission with this Stripe customer ID
    const query = `*[_type == "applications" && stripeCustomerId == $customerId][0]`;
    const submission = await backendClient.fetch(query, { customerId });

    if (!submission) {
      console.log(
        `No company submission found for customer: ${customerId} from invoice payment`
      );
      return;
    }

    // Update the payment status
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

      await sendPaymentConfirmation(submission);
      console.log(`Invoice payment processed for: ${submission.companyName}`);
    } else {
      console.error(`Failed to update payment status: ${result.message}`);
    }
  } catch (error) {
    console.error("Error handling invoice payment succeeded:", error);
  }
}

// Unified handler for subscription created and updated events
async function handleSubscriptionEvent(subscription, eventType) {
  try {
    console.log(
      `Processing ${eventType}: ${subscription.id}, status: ${subscription.status}`
    );

    const submission = await findSubmission(subscription);
    if (!submission) {
      console.log(
        `No company submission found for subscription: ${subscription.id}`
      );
      return;
    }

    // For subscription.updated events, check if customer ID is linked
    if (
      eventType === "customer.subscription.updated" &&
      !hasValidStripeCustomerId(submission)
    ) {
      console.log(
        `Ignoring ${eventType} - stripeCustomerId not linked for: ${submission._id}`
      );
      return;
    }

    console.log(`Found submission for ${eventType}: ${submission.companyName}`);

    // Prepare subscription data
    const subscriptionData = {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    };

    // Update both submission and company documents
    await updateSubscriptionData(submission, subscriptionData);

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
  } catch (error) {
    console.error(`Error handling ${eventType}:`, error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription) {
  try {
    console.log(`Processing subscription cancelled: ${subscription.id}`);

    const submission = await findSubmission(subscription);
    if (!submission) {
      console.log(
        `No company submission found for cancelled subscription: ${subscription.id}`
      );
      return;
    }

    // Update subscription status
    const subscriptionData = {
      subscriptionStatus: "canceled",
      // Keep the current_period_end as is, since that's when access will end
    };

    // Update both submission and company documents
    await updateSubscriptionData(submission, subscriptionData);

    console.log(
      `Subscription cancellation processed for: ${submission.companyName}`
    );
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
  }
}
