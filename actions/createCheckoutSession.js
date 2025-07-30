"use server";

import stripe from "@/lib/stripe";

export async function createCheckoutSession(metadata) {
  try {
    // Retrieve existing customer or create a new one
    const customers = await stripe.customers.list({
      email: metadata.email,
      limit: 1,
    });
    const customerId = customers?.data?.length > 0 ? customers.data[0].id : "";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Determine price ID based on plan type and billing cycle
    let priceId;
    if (metadata.planType === "professional") {
      priceId =
        metadata.billingCycle === "yearly"
          ? process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID
          : process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID;
    } else if (metadata.planType === "enterprise") {
      priceId =
        metadata.billingCycle === "yearly"
          ? process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID
          : process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID;
    }

    if (!priceId) {
      throw new Error(
        `Price ID not found for ${metadata.planType} plan with ${metadata.billingCycle} billing cycle`
      );
    }

    const sessionPayload = {
      metadata: {
        companyName: metadata.companyName,
        email: metadata.email,
        description: metadata.description,
        planType: metadata.planType,
        billingCycle: metadata.billingCycle,
        services: JSON.stringify(metadata.services),
      },
      mode: "subscription",
      allow_promotion_codes: true,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      success_url: `${baseUrl}/join-us/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${metadata.planType}`,
      cancel_url: `${baseUrl}/membership`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    };

    if (customerId) {
      sessionPayload.customer = customerId;
    } else {
      sessionPayload.customer_email = metadata.email;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);
    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error(
      `Error creating ${metadata.planType} Checkout Session`,
      error
    );
    throw error;
  }
}
