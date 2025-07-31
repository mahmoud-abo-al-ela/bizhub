"use server";

import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";

export async function createPaymentLink(companyData) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 1. Determine price ID based on plan type and billing cycle
    let priceId;
    if (companyData.planType === "professional") {
      priceId =
        companyData.billingCycle === "yearly"
          ? process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID
          : process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID;
    } else if (companyData.planType === "enterprise") {
      priceId =
        companyData.billingCycle === "yearly"
          ? process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID
          : process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID;
    }

    if (!priceId) {
      throw new Error(
        `Price ID not found for ${companyData.planType} plan with ${companyData.billingCycle} billing cycle`
      );
    }

    // 2. Create a Stripe Customer (if not already assigned)
    const customer = await stripe.customers.create({
      email: companyData.email,
      name: companyData.companyName,
      metadata: {
        companyId: companyData._id,
      },
    });

    // 3. Store customerId in Sanity
    await backendClient
      .patch(companyData._id)
      .set({ stripeCustomerId: customer.id })
      .commit();

    // 4. Create Checkout Session linked to customer
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customer.id, // ✅ Link to Stripe customer
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        companyId: companyData._id,
        companyName: companyData.companyName,
        email: companyData.email,
        planType: companyData.planType,
        billingCycle: companyData.billingCycle,
      },
      success_url: `${baseUrl}/join-us/payment-success?company_id=${companyData._id}`,
      cancel_url: `${baseUrl}/join-us/payment-cancelled`,
    });

    return { url: session.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}
