import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    // Try to fetch as a company submission first
    let document = await backendClient.getDocument(id);

    // If not found or not a company submission, try as a company
    if (!document || document._type !== "companySubmission") {
      if (document && document._type === "company") {
        // Already fetched a company document
      } else {
        // Try to fetch as a company
        document = await backendClient.fetch(
          `*[_type == "company" && _id == $id][0]`,
          { id }
        );
      }
    }

    if (!document) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error retrieving company:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve company" },
      { status: 500 }
    );
  }
}
