import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import {
  getUserInvoices,
  addUserInvoice,
  updateUserInvoice,
  getUserIdFromRequest,
} from "../../../../lib/invoices";

import { normalizeInvoicesWithGemini } from "../../../../lib/ai/invoice-normalizer";

export const runtime = "nodejs";

const SUPPORTED_EXTENSIONS = [
  ".csv",
  ".pdf",
  ".xlsx",
  ".docx",
];

/* -------------------------------------------------------
   CSV PARSER
------------------------------------------------------- */

function parseCSVLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());

  return values;
}

/* -------------------------------------------------------
   HEADER NORMALIZATION
------------------------------------------------------- */

function normalizeHeader(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/* -------------------------------------------------------
   HEADER ALIASES
------------------------------------------------------- */

const HEADER_ALIASES = {
  invoiceNumber: [
    "invoicenumber",
    "invoiceno",
    "invoicenumber",
    "invoiceid",
    "invoice",
    "invoice#",
  ],

  invoiceDate: [
    "invoicedate",
    "date",
  ],

  dueDate: [
    "duedate",
    "due",
    "paymentdue",
  ],

  contact: [
    "contact",
    "customer",
    "customername",
    "client",
    "clientname",
    "buyer",
  ],

  currency: [
    "currency",
    "curr",
  ],

  amount: [
    "amount",
    "invoiceamount",
    "subtotal",
    "value",
    "total",
    "totalamount",
    "invoicevalue",
  ],

  tax: [
    "tax",
    "taxamount",
    "gst",
    "gstamount",
  ],

  paidAmount: [
    "paidamount",
    "paid",
    "amountpaid",
    "received",
    "amountreceived",
  ],

  paidDate: [
    "paiddate",
    "paymentdate",
    "datepaid",
  ],

  gstNumber: [
    "gstnumber",
    "gstin",
    "gstno",
    "gstnum",
  ],
};

/* -------------------------------------------------------
   FIND HEADER INDEX
------------------------------------------------------- */

function findHeaderIndex(headers, field) {
  const aliases = HEADER_ALIASES[field] || [];

  return headers.findIndex((header) =>
    aliases.includes(header)
  );
}

/* -------------------------------------------------------
   CHECK WHETHER CSV IS ALREADY STRUCTURED
------------------------------------------------------- */

function analyzeCSVStructure(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return {
      isStructured: false,
      headers: [],
      rows: [],
      lines,
    };
  }

  const parsedRows = lines.map(parseCSVLine);

  const headers = parsedRows[0].map(normalizeHeader);

  const mapping = {
    invoiceNumber: findHeaderIndex(headers, "invoiceNumber"),
    invoiceDate: findHeaderIndex(headers, "invoiceDate"),
    dueDate: findHeaderIndex(headers, "dueDate"),
    contact: findHeaderIndex(headers, "contact"),
    currency: findHeaderIndex(headers, "currency"),
    amount: findHeaderIndex(headers, "amount"),
    tax: findHeaderIndex(headers, "tax"),
    paidAmount: findHeaderIndex(headers, "paidAmount"),
    paidDate: findHeaderIndex(headers, "paidDate"),
    gstNumber: findHeaderIndex(headers, "gstNumber"),
  };

  /*
   * These are the minimum fields needed to understand
   * that this is a normal invoice CSV.
   *
   * Other fields can be missing.
   */
  const hasInvoiceNumber = mapping.invoiceNumber !== -1;
  const hasContact = mapping.contact !== -1;
  const hasAmount = mapping.amount !== -1;

  const isStructured =
    hasInvoiceNumber &&
    hasContact &&
    hasAmount;

  const rows = parsedRows.slice(1);

  return {
    isStructured,
    headers,
    mapping,
    rows,
    lines,
  };
}

/* -------------------------------------------------------
   CONVERT STRUCTURED CSV TO INVOICE OBJECTS LOCALLY
------------------------------------------------------- */

function csvRowsToInvoices(csvText) {
  const analysis = analyzeCSVStructure(csvText);

  if (!analysis.isStructured) {
    return null;
  }

  const {
    mapping,
    rows,
  } = analysis;

  const invoices = rows.map((row, index) => {
    const getValue = (field) => {
      const indexForField = mapping[field];

      if (
        indexForField === undefined ||
        indexForField === -1
      ) {
        return "-";
      }

      const value = row[indexForField];

      return value === undefined ||
        value === null ||
        String(value).trim() === ""
        ? "-"
        : String(value).trim();
    };

    return {
      sourceRow: index + 1,

      invoiceNumber:
        getValue("invoiceNumber"),

      invoiceDate:
        getValue("invoiceDate"),

      dueDate:
        getValue("dueDate"),

      contact:
        getValue("contact"),

      currency:
        getValue("currency"),

      amount:
        getValue("amount"),

      tax:
        getValue("tax"),

      paidAmount:
        getValue("paidAmount"),

      paidDate:
        getValue("paidDate"),

      gstNumber:
        getValue("gstNumber"),
    };
  });

  return invoices;
}

/* -------------------------------------------------------
   CSV -> GEMINI READABLE TEXT
------------------------------------------------------- */

function csvToReadableText(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return "";
  }

  const rows = lines.map(parseCSVLine);

  return rows
    .map((row) =>
      row
        .map((value) => value ?? "")
        .join(" | ")
    )
    .join("\n");
}

/* -------------------------------------------------------
   XLSX -> READABLE TEXT
------------------------------------------------------- */

function worksheetToReadableText(worksheet) {
  const rows = XLSX.utils.sheet_to_json(
    worksheet,
    {
      header: 1,
      defval: "",
      raw: false,
    }
  );

  return rows
    .filter(
      (row) =>
        Array.isArray(row) &&
        row.some(
          (value) =>
            String(value ?? "").trim() !== ""
        )
    )
    .map((row) =>
      row
        .map((value) =>
          String(value ?? "").trim()
        )
        .join(" | ")
    )
    .join("\n");
}

/* -------------------------------------------------------
   FILE EXTRACTION
------------------------------------------------------- */

async function extractFileContent(file) {
  const name = file.name.toLowerCase();

  const extension = name.slice(
    name.lastIndexOf(".")
  );

  if (
    !SUPPORTED_EXTENSIONS.includes(extension)
  ) {
    throw new Error(
      "Unsupported file type. Supported formats: .csv, .pdf, .xlsx, .docx"
    );
  }

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  if (!buffer.length) {
    throw new Error(
      "The uploaded file is empty."
    );
  }

  /* CSV */

  if (extension === ".csv") {
    const csvText = buffer.toString("utf8");

    return {
      format: "csv",
      rawText: csvText,
      content: csvToReadableText(csvText),
    };
  }

  /* XLSX */

  if (extension === ".xlsx") {
    const workbook = XLSX.read(
      buffer,
      {
        type: "buffer",
        cellDates: true,
      }
    );

    const sheets =
      workbook.SheetNames
        .map((sheetName) => {
          const worksheet =
            workbook.Sheets[sheetName];

          const text =
            worksheetToReadableText(
              worksheet
            );

          if (!text.trim()) {
            return "";
          }

          return `SHEET: ${sheetName}\n${text}`;
        })
        .filter(Boolean);

    return {
      format: "xlsx",
      rawText: "",
      content: sheets.join("\n\n"),
    };
  }

  /* DOCX */

  if (extension === ".docx") {
    const result =
      await mammoth.extractRawText({
        buffer,
      });

    return {
      format: "docx",
      rawText: "",
      content: result.value || "",
    };
  }

  /* PDF */

  if (extension === ".pdf") {
    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result =
        await parser.getText();

      return {
        format: "pdf",
        rawText: "",
        content: result.text || "",
      };
    } finally {
      await parser.destroy();
    }
  }

  throw new Error(
    "Unable to read the uploaded file."
  );
}

/* -------------------------------------------------------
   MISSING VALUE NORMALIZATION
------------------------------------------------------- */

function normalizeMissing(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === "" ||
    String(value).trim() === "-"
  ) {
    return null;
  }

  return String(value).trim();
}

/* -------------------------------------------------------
   MONEY PARSER
------------------------------------------------------- */

function parseMoney(value) {
  const normalized =
    normalizeMissing(value);

  if (normalized === null) {
    return {
      valid: false,
      value: null,
    };
  }

  const cleaned = normalized
    .replace(/₹/g, "")
    .replace(/\$/g, "")
    .replace(/€/g, "")
    .replace(/£/g, "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .trim();

  const number = Number(cleaned);

  if (!Number.isFinite(number)) {
    return {
      valid: false,
      value: null,
    };
  }

  return {
    valid: true,
    value: number,
  };
}

/* -------------------------------------------------------
   DATE NORMALIZER
------------------------------------------------------- */

function normalizeDate(value) {
  const normalized =
    normalizeMissing(value);

  if (normalized === null) {
    return {
      valid: false,
      date: null,
      error: "Date is missing",
    };
  }

  const input = normalized.trim();

  /* YYYY-MM-DD */

  let match = input.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/
  );

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    const date = new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      return {
        valid: true,
        date: `${year}-${String(
          month
        ).padStart(
          2,
          "0"
        )}-${String(day).padStart(
          2,
          "0"
        )}`,
        error: null,
      };
    }
  }

  /* MM/DD/YYYY or DD/MM/YYYY */

  match = input.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (match) {
    const first = Number(match[1]);
    const second = Number(match[2]);
    const year = Number(match[3]);

    let month;
    let day;

    if (first > 12) {
      day = first;
      month = second;
    } else {
      month = first;
      day = second;
    }

    const date = new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      return {
        valid: true,
        date: `${year}-${String(
          month
        ).padStart(
          2,
          "0"
        )}-${String(day).padStart(
          2,
          "0"
        )}`,
        error: null,
      };
    }
  }

  return {
    valid: false,
    date: null,
    error: `Invalid date: ${input}`,
  };
}

/* -------------------------------------------------------
   STATUS CALCULATIONS
------------------------------------------------------- */

function calculateStatuses({
  amount,
  tax,
  paidAmount,
  dueDate,
  paidDate,
}) {
  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    return {
      totalAmount: null,
      amountDue: null,
      paymentStatus: "failed",
      timingStatus: "invalid",
      error:
        "Invoice amount is missing or invalid",
    };
  }

  if (
    !Number.isFinite(tax) ||
    tax < 0
  ) {
    return {
      totalAmount: null,
      amountDue: null,
      paymentStatus: "failed",
      timingStatus: "invalid",
      error: "Tax amount is invalid",
    };
  }

  if (
    !Number.isFinite(paidAmount) ||
    paidAmount < 0
  ) {
    return {
      totalAmount: null,
      amountDue: null,
      paymentStatus: "failed",
      timingStatus: "invalid",
      error: "Paid amount is invalid",
    };
  }

  const totalAmount = Number(
    (amount + tax).toFixed(2)
  );

  const amountDue = Number(
    (
      totalAmount - paidAmount
    ).toFixed(2)
  );

  let paymentStatus;

  if (paidAmount > totalAmount) {
    paymentStatus = "overpaid";
  } else if (
    Math.abs(
      paidAmount - totalAmount
    ) < 0.01
  ) {
    paymentStatus = "matched";
  } else if (paidAmount > 0) {
    paymentStatus =
      "partially_paid";
  } else {
    paymentStatus = "unpaid";
  }

  let timingStatus =
    "pending";

  if (!dueDate) {
    timingStatus =
      "not_available";
  } else if (paidDate) {
    timingStatus =
      paidDate <= dueDate
        ? "on_time"
        : "late";
  } else {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    timingStatus =
      today > dueDate
        ? "overdue"
        : "pending";
  }

  return {
    totalAmount,
    amountDue,
    paymentStatus,
    timingStatus,
    error: null,
  };
}

/* -------------------------------------------------------
   AI INVOICE NORMALIZER
------------------------------------------------------- */

function normalizeAIInvoice(raw) {
  return {
    invoiceNumber:
      normalizeMissing(
        raw?.invoiceNumber
      ) || "",

    invoiceDate:
      normalizeMissing(
        raw?.invoiceDate
      ),

    dueDate:
      normalizeMissing(
        raw?.dueDate
      ),

    contact:
      normalizeMissing(
        raw?.contact
      ) || "",

    currency:
      normalizeMissing(
        raw?.currency
      ) || "INR",

    amount:
      normalizeMissing(
        raw?.amount
      ),

    tax:
      normalizeMissing(
        raw?.tax
      ),

    paidAmount:
      normalizeMissing(
        raw?.paidAmount
      ),

    paidDate:
      normalizeMissing(
        raw?.paidDate
      ),

    gstNumber:
      normalizeMissing(
        raw?.gstNumber
      ),
  };
}

/* -------------------------------------------------------
   PROCESS ONE INVOICE
------------------------------------------------------- */

async function saveInvoice({
  userId,
  invoice,
  existingInvoices,
}) {
  const normalized =
    normalizeAIInvoice(invoice);

  const invoiceDateResult =
    normalizeDate(
      normalized.invoiceDate
    );

  const dueDateResult =
    normalizeDate(
      normalized.dueDate
    );

  const paidDateResult =
    normalized.paidDate
      ? normalizeDate(
          normalized.paidDate
        )
      : {
          valid: true,
          date: null,
          error: null,
        };

  const amountResult =
    parseMoney(
      normalized.amount
    );

  const taxResult =
    normalized.tax === null
      ? {
          valid: true,
          value: 0,
        }
      : parseMoney(
          normalized.tax
        );

  const paidAmountResult =
    normalized.paidAmount === null
      ? {
          valid: true,
          value: 0,
        }
      : parseMoney(
          normalized.paidAmount
        );

  let paymentStatus =
    "failed";

  let timingStatus =
    "invalid";

  let totalAmount = null;
  let amountDue = null;
  let error = null;

  /*
   * Only truly important fields stop
   * successful reconciliation.
   *
   * Missing optional details such as
   * dates are allowed.
   */

  if (!normalized.invoiceNumber) {
    error =
      "Invoice number is missing";
  } else if (!normalized.contact) {
    error =
      "Customer/contact is missing";
  } else if (!amountResult.valid) {
    error =
      "Invoice amount is missing or invalid";
  } else if (!taxResult.valid) {
    error =
      "Tax amount is invalid";
  } else if (!paidAmountResult.valid) {
    error =
      "Paid amount is invalid";
  } else if (
    normalized.invoiceDate &&
    !invoiceDateResult.valid
  ) {
    error =
      invoiceDateResult.error;
  } else if (
    normalized.dueDate &&
    !dueDateResult.valid
  ) {
    error =
      dueDateResult.error;
  } else if (
    normalized.paidDate &&
    !paidDateResult.valid
  ) {
    error =
      paidDateResult.error;
  }

  /*
   * Calculate reconciliation only when
   * the financial information is valid.
   */

  if (!error) {
    const calculation =
      calculateStatuses({
        amount:
          amountResult.value,
        tax:
          taxResult.value,
        paidAmount:
          paidAmountResult.value,
        dueDate:
          dueDateResult.date,
        paidDate:
          paidDateResult.date,
      });

    totalAmount =
      calculation.totalAmount;

    amountDue =
      calculation.amountDue;

    paymentStatus =
      calculation.paymentStatus;

    timingStatus =
      calculation.timingStatus;

    error =
      calculation.error;
  }

  if (error) {
    paymentStatus = "failed";
    timingStatus = "invalid";
  }

  const invoiceData = {
    invoiceNumber:
      normalized.invoiceNumber,

    invoiceDate:
      invoiceDateResult.valid
        ? invoiceDateResult.date
        : null,

    dueDate:
      dueDateResult.valid
        ? dueDateResult.date
        : null,

    contact:
      normalized.contact,

    currency:
      normalized.currency,

    amount:
      amountResult.valid
        ? amountResult.value
        : null,

    tax:
      taxResult.valid
        ? taxResult.value
        : 0,

    totalAmount,

    paidAmount:
      paidAmountResult.valid
        ? paidAmountResult.value
        : 0,

    amountDue,

    paidDate:
      paidDateResult.valid
        ? paidDateResult.date
        : null,

    paymentStatus,

    timingStatus,

    gstNumber:
      normalized.gstNumber,

    error,
  };

  const existing =
    existingInvoices.find(
      (existingInvoice) =>
        existingInvoice.invoiceNumber ===
        normalized.invoiceNumber
    );

  if (existing) {
    return updateUserInvoice(
      userId,
      existing.id,
      invoiceData
    );
  }

  return addUserInvoice(
    userId,
    invoiceData
  );
}

/* -------------------------------------------------------
   POST
------------------------------------------------------- */

export async function POST(request) {
  try {
    const userId =
      getUserIdFromRequest(
        request
      );

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No invoice file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof file.arrayBuffer !==
      "function"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid uploaded file",
        },
        {
          status: 400,
        }
      );
    }

    const extension =
      file.name
        .toLowerCase()
        .slice(
          file.name
            .toLowerCase()
            .lastIndexOf(".")
        );

    if (
      !SUPPORTED_EXTENSIONS.includes(
        extension
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported file type. Supported formats: .csv, .pdf, .xlsx, .docx",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * STEP 1:
     * Extract the uploaded file.
     */

    const extracted =
      await extractFileContent(
        file
      );

    if (
      !extracted.content.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Could not extract readable invoice data from this file.",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      `[Invoice] Extracted ${extracted.format} file: ${file.name}`
    );

    /*
     * STEP 2:
     * Decide whether CSV can be processed
     * locally or needs Gemini.
     */

    let normalizedInvoices = [];
    let aiUsed = false;

    if (
      extension === ".csv"
    ) {
      const localInvoices =
        csvRowsToInvoices(
          extracted.rawText
        );

      if (
        localInvoices &&
        localInvoices.length > 0
      ) {
        /*
         * CLEAN CSV
         * No Gemini call.
         */

        normalizedInvoices =
          localInvoices;

        console.log(
          `[Invoice] Structured CSV detected. Processing ${normalizedInvoices.length} rows locally.`
        );
      } else {
        /*
         * MESSY CSV
         * Use Gemini.
         */

        aiUsed = true;

        console.log(
          "[Invoice] Unrecognized CSV structure. Sending to Gemini."
        );

        normalizedInvoices =
          await normalizeInvoicesWithGemini(
            extracted.content
          );
      }
    } else {
      /*
       * PDF / XLSX / DOCX
       * Use Gemini for normalization.
       */

      aiUsed = true;

      console.log(
        `[Invoice] ${extension} requires AI normalization.`
      );

      normalizedInvoices =
        await normalizeInvoicesWithGemini(
          extracted.content
        );
    }

    if (
      !Array.isArray(
        normalizedInvoices
      ) ||
      normalizedInvoices.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No invoice records were found in the uploaded file.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * STEP 3:
     * Get existing invoices.
     */

    const existingInvoices =
      await getUserInvoices(
        userId
      );

    let processedCount = 0;
    let failedCount = 0;

    /*
     * STEP 4:
     * Process each invoice independently.
     *
     * One bad row NEVER stops the batch.
     */

    for (
      let i = 0;
      i < normalizedInvoices.length;
      i++
    ) {
      const invoice =
        normalizedInvoices[i];

      try {
        const saved =
          await saveInvoice({
            userId,
            invoice,
            existingInvoices,
          });

        if (
          saved?.paymentStatus ===
          "failed"
        ) {
          failedCount++;
        } else {
          processedCount++;
        }
      } catch (rowError) {
        failedCount++;

        console.error(
          `Error processing invoice row ${
            i + 1
          }:`,
          rowError
        );
      }
    }

    /*
     * STEP 5:
     * Return the user's latest invoices.
     */

    const updatedInvoices =
      await getUserInvoices(
        userId
      );

    return NextResponse.json({
      success: true,

      message: `${extension.toUpperCase()} invoice batch processed successfully`,

      summary: {
        total:
          normalizedInvoices.length,

        processed:
          processedCount,

        failed:
          failedCount,

        aiUsed,
      },

      data: updatedInvoices,
    });
  } catch (error) {
    console.error(
      "Invoice processing error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Invoice processing failed",
      },
      {
        status: 500,
      }
    );
  }
}

/* -------------------------------------------------------
   GET
------------------------------------------------------- */

export async function GET(
  request
) {
  try {
    const userId =
      getUserIdFromRequest(
        request
      );

    const invoices =
      await getUserInvoices(
        userId
      );

    const processed =
      invoices.filter(
        (invoice) =>
          invoice.paymentStatus ===
            "matched" ||
          invoice.paymentStatus ===
            "partially_paid" ||
          invoice.paymentStatus ===
            "unpaid" ||
          invoice.paymentStatus ===
            "overpaid"
      ).length;

    const failed =
      invoices.filter(
        (invoice) =>
          invoice.paymentStatus ===
          "failed"
      ).length;

    return NextResponse.json({
      success: true,

      progress: {
        total: invoices.length,

        processed,

        failed,

        percentage:
          invoices.length === 0
            ? 0
            : Math.round(
                (processed /
                  invoices.length) *
                  100
              ),
      },
    });
  } catch (error) {
    console.error(
      "GET invoice progress error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch progress",
      },
      {
        status: 500,
      }
    );
  }
}