"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { sendPaymentConfirmation } from "@/lib/email";
import {
  updatePaymentStatus,
  findApplicationByStripeCustomerId,
  findCompanyByApplicationId,
} from "@/lib/sanity-actions";

// Helper function to check if an application has a valid stripeCustomerId
export async function hasValidStripeCustomerId(application) {
  return (
    application &&
    application.stripeCustomerId &&
    application.stripeCustomerId.trim() !== ""
  );
}

// Helper function to find application by subscription data
export async function findApplicationBySubscription(subscription) {
  let application = null;
  const customerId = subscription.customer;

  if (!customerId) {
    console.log("No customer ID found in subscription");
    return null;
  }

  // Prefer companyId from metadata
  if (subscription.metadata?.companyId) {
    application = await backendClient.getDocument(
      subscription.metadata.companyId
    );
  }

  // If not found by companyId, try to find by customer ID
  if (!application) {
    application = await findApplicationByStripeCustomerId(customerId);
  }

  return application;
}

// Helper function to update application data and handle payment status
export async function updateApplicationData(
  application,
  data,
  updatePaymentStatusFlag = false
) {
  let updatedApplication = application;

  // First, check if we need to update payment status
  // This should be done first to avoid race conditions with company creation
  if (updatePaymentStatusFlag && application.paymentStatus !== "paid") {
    console.log(
      `Updating payment status to paid for: ${application.companyName}`
    );
    const result = await updatePaymentStatus(application._id, "paid");

    if (!result.success) {
      console.error(`Failed to update payment status: ${result.message}`);
    } else {
      // After payment status update, refresh the application data
      // This is important because updatePaymentStatus might have created a company
      const refreshedApplication = await backendClient.getDocument(
        application._id
      );
      if (refreshedApplication) {
        updatedApplication = refreshedApplication;
      }
    }
  }

  // Now update the application with the provided data
  await backendClient.patch(updatedApplication._id).set(data).commit();
  console.log(
    `Details updated for application: ${updatedApplication.companyName}`
  );

  // Update the company document if it exists after payment processing
  if (
    updatedApplication.processedToCompany &&
    updatedApplication.companyReference?._ref
  ) {
    try {
      await backendClient
        .patch(updatedApplication.companyReference._ref)
        .set(data)
        .commit();
      console.log(
        `Details also updated for company: ${updatedApplication.companyName}`
      );
    } catch (error) {
      console.error(`Error updating company details: ${error.message}`);
    }
  }
}

// Handle successful payment from payment link
export async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    // Check if this payment is related to a company submission
    if (!paymentIntent.metadata?.companyId) {
      console.log("Payment not related to a company submission");
      return;
    }

    const companyId = paymentIntent.metadata.companyId;
    console.log(`Processing payment for company submission: ${companyId}`);

    // Get the company application
    const application = await backendClient.getDocument(companyId);
    if (!application) {
      console.error(`Company application not found: ${companyId}`);
      return;
    }

    // Check if stripeCustomerId is already linked - if not, ignore this event
    if (!(await hasValidStripeCustomerId(application))) {
      console.log(
        `Ignoring payment_intent.succeeded - stripeCustomerId not yet linked for: ${companyId}`
      );
      return;
    }

    // Prepare data for update
    const updateData = {
      stripeCustomerId: paymentIntent.customer,
      lastPaymentDate: new Date().toISOString(),
      currentPeriodEnd: new Date(
        Date.now() +
          (application.billingCycle === "yearly" ? 365 : 30) * 86400000
      ).toISOString(),
    };

    // Update application and company documents, and update payment status
    await updateApplicationData(application, updateData, true);
    await sendPaymentConfirmation(application);
    console.log(`Payment processed for: ${application.companyName}`);
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error);
  }
}

// Handle successful checkout session
export async function handleCheckoutSessionCompleted(session) {
  try {
    if (session.mode !== "subscription" && session.mode !== "payment") return;

    if (!session.metadata?.companyId) {
      console.error("Missing metadata or companyId in session");
      return;
    }

    const application = await backendClient.getDocument(
      session.metadata.companyId
    );
    if (!application) {
      console.error(
        `Submission not found for ID: ${session.metadata.companyId}`
      );
      return;
    }

    // Prepare patch data
    const patchData = {
      lastPaymentDate: new Date().toISOString(),
    };

    if (!application.stripeCustomerId) {
      patchData.stripeCustomerId = session.customer;
    }

    // Update application and company documents, and update payment status
    await updateApplicationData(application, patchData, true);
    await sendPaymentConfirmation(application);
    console.log(`Payment processed for: ${application.companyName}`);
  } catch (error) {
    console.error("Error in handleCheckoutSessionCompleted:", error.message);
  }
}

// Handle successful invoice payment
export async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log(`Processing invoice payment: ${invoice.id}`);

    const customerId = invoice.customer;
    if (!customerId) {
      console.log("No customer ID found in invoice");
      return;
    }

    // Find the submission with this Stripe customer ID
    const application = await findApplicationByStripeCustomerId(customerId);

    if (!application) {
      console.log(
        `No company submission found for customer: ${customerId} from invoice payment`
      );
      return;
    }

    // Prepare update data
    const updateData = {
      lastPaymentDate: new Date().toISOString(),
      currentPeriodEnd: new Date(invoice.period_end * 1000).toISOString(),
    };

    // Update application and company documents, and update payment status
    await updateApplicationData(application, updateData, true);
    await sendPaymentConfirmation(application);
    console.log(`Invoice payment processed for: ${application.companyName}`);
  } catch (error) {
    console.error("Error handling invoice payment succeeded:", error);
  }
}

// Unified handler for subscription created and updated events
export async function handleSubscriptionEvent(subscription, eventType) {
  try {
    console.log(
      `Processing ${eventType}: ${subscription.id}, status: ${subscription.status}`
    );

    const application = await findApplicationBySubscription(subscription);
    if (!application) {
      console.log(
        `No company application found for subscription: ${subscription.id}`
      );
      return;
    }

    // For subscription.updated events, check if customer ID is linked
    if (
      eventType === "customer.subscription.updated" &&
      !(await hasValidStripeCustomerId(application))
    ) {
      console.log(
        `Ignoring ${eventType} - stripeCustomerId not linked for: ${application._id}`
      );
      return;
    }

    console.log(
      `Found application for ${eventType}: ${application.companyName}`
    );

    // Prepare subscription data
    const subscriptionData = {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    };

    // Update both submission and company documents, and update payment status if active
    const shouldUpdatePayment = subscription.status === "active";
    await updateApplicationData(
      application,
      subscriptionData,
      shouldUpdatePayment
    );
  } catch (error) {
    console.error(`Error handling ${eventType}:`, error);
  }
}

// Handle subscription cancellation
export async function handleSubscriptionCancelled(subscription) {
  try {
    console.log(`Processing subscription cancelled: ${subscription.id}`);

    const application = await findApplicationBySubscription(subscription);
    if (!application) {
      console.log(
        `No company application found for cancelled subscription: ${subscription.id}`
      );
      return;
    }

    // Update subscription status
    const subscriptionData = {
      subscriptionStatus: "canceled",
      // Keep the current_period_end as is, since that's when access will end
    };

    // Update both application and company documents
    await updateApplicationData(application, subscriptionData);

    console.log(
      `Subscription cancellation processed for: ${application.companyName}`
    );
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
  }
}
