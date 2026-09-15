import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyUserCredentials } from "@/lib/users";

const ADMIN_EMAILS = [
  "dheer@gmail.com",
  "prateek@gmail.com",
  "himesh@gmail.com",
];

// Submit feedback
export async function POST(request) {
  try {
    const body = await request.json();

    const name = body?.name?.trim() || null;
    const email = body?.email?.trim() || null;
    const message = body?.message?.trim();

    // Admin feedback viewing request
    if (body?.action === "get-feedback") {
      const adminEmail = body?.adminEmail?.trim().toLowerCase();
      const adminPassword = body?.adminPassword;

      if (!adminEmail || !adminPassword) {
        return NextResponse.json(
          {
            success: false,
            message: "Admin email and password are required.",
          },
          { status: 400 }
        );
      }

      if (!ADMIN_EMAILS.includes(adminEmail)) {
        return NextResponse.json(
          {
            success: false,
            message: "You are not authorized to view feedback.",
          },
          { status: 403 }
        );
      }

      const adminUser = await verifyUserCredentials(
        adminEmail,
        adminPassword
      );

      if (!adminUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid admin credentials.",
          },
          { status: 401 }
        );
      }

      const { data, error } = await supabase
        .from("feedback")
        .select("id, name, email, message, status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Feedback fetch error:", error);

        return NextResponse.json(
          {
            success: false,
            message: "Failed to load feedback.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data || [],
      });
    }

    // Normal feedback submission
    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Feedback message is required.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
  .from("feedback")
  .insert([
    {
      name,
      email,
      message,
    },
  ]);

    if (error) {
      console.error("Feedback insert error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to submit feedback.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
  success: true,
  message: "Feedback submitted successfully.",
});
  } catch (error) {
    console.error("Feedback API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
      },
      { status: 400 }
    );
  }
}