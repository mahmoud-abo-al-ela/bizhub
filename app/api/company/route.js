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

    console.log(`Attempting to fetch document with ID: ${id}`);

    // Try to fetch as an application first
    let document = await backendClient.getDocument(id);

    // If not found or not an application, try as a company
    if (!document || document._type !== "applications") {
      if (document && document._type === "company") {
        // Already fetched a company document
        console.log("Found company document directly");
      } else {
        // Try to fetch as a company
        console.log("Trying to fetch as company");
        document = await backendClient.fetch(
          `*[_type == "company" && _id == $id][0]`,
          { id }
        );
      }
    } else {
      console.log("Found applications document");
    }

    if (!document) {
      console.log(`No document found for ID: ${id}`);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    console.log(`Successfully found document of type: ${document._type}`);

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error retrieving company:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve company" },
      { status: 500 }
    );
  }
}
