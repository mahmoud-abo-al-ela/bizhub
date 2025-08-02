import { NextResponse } from "next/server";
import { getFeaturedCompanies } from "@/sanity/queries";

export async function GET() {
  try {
    const companies = await getFeaturedCompanies();
    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error in featured-companies API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured companies" },
      { status: 500 }
    );
  }
}
