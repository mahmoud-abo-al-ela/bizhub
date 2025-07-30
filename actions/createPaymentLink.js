"use server";

import stripe from "@/lib/stripe";

export async function createPaymentLink(companyData) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Determine price ID based on plan type and billing cycle
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

    // Create a payment link
    const paymentLink = await stripe.paymentLinks.create({
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
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${baseUrl}/join-us/payment-success?company_id=${companyData._id}`,
        },
      },
    });

    return { url: paymentLink.url };
  } catch (error) {
    console.error("Error creating payment link:", error);
    throw error;
  }
}
