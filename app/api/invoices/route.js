import { NextResponse } from "next/server";

import {
  getUserInvoices,
  getLatestBatchId,
  addUserInvoice,
  getUserIdFromRequest,
} from "../../../lib/invoices";


// -------------------------------------------------------
// GET /api/invoices
// -------------------------------------------------------

export async function GET(request) {
  try {
    const userId =
      getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Get every invoice belonging to this user.
    // This is used for History.
    const historyInvoices =
      await getUserInvoices(userId);

    // Find the most recently uploaded batch.
    const latestBatchId =
      await getLatestBatchId(userId);

    // Only show the latest batch on the dashboard.
    const currentInvoices =
      latestBatchId
        ? await getUserInvoices(
            userId,
            latestBatchId
          )
        : [];

    return NextResponse.json({
      success: true,

      count:
        currentInvoices.length,

      data:
        currentInvoices,

      history:
        historyInvoices,

      batchId:
        latestBatchId,
    });
  } catch (error) {
    console.error(
      "GET /api/invoices error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch invoices",
      },
      { status: 500 }
    );
  }
}


// -------------------------------------------------------
// POST /api/invoices
// Manual invoice creation
// -------------------------------------------------------

export async function POST(request) {
  try {
    const userId =
      getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    const body =
      await request.json();

    const {
      invoiceNumber,
      customerName,
      invoiceDate,
      amount,
      gstNumber,
    } = body;

    // Validate required fields
    if (
      !invoiceNumber ||
      !customerName ||
      !invoiceDate ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !gstNumber
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "All invoice fields are required",
        },
        { status: 400 }
      );
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Amount must be a valid number",
        },
        { status: 400 }
      );
    }

    const existingInvoices =
      await getUserInvoices(
        userId
      );

    const existingInvoice =
      existingInvoices.find(
        (inv) =>
          inv.invoiceNumber ===
          invoiceNumber
      );

    if (existingInvoice) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invoice number already exists",
        },
        { status: 409 }
      );
    }

    // A manually created invoice is treated
    // as its own batch.
    const batchId =
      crypto.randomUUID();

    const newInvoice =
      await addUserInvoice(
        userId,
        {
          invoiceNumber,
          customerName,
          invoiceDate,
          amount:
            numericAmount,
          gstNumber,
          batchId,
          status:
            "pending",
          error: null,
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Invoice created successfully",
        data:
          newInvoice,
        batchId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/invoices error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create invoice",
      },
      { status: 500 }
    );
  }
}