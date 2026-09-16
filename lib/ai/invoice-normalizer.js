import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("[Gemini] GEMINI_API_KEY is not configured.");
}

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

const invoiceSchema = {
  type: "object",
  properties: {
    invoices: {
      type: "array",
      items: {
        type: "object",
        properties: {
          sourceRow: {
            type: "integer",
          },
          invoiceNumber: {
            type: "string",
          },
          invoiceDate: {
            type: "string",
          },
          dueDate: {
            type: "string",
          },
          contact: {
            type: "string",
          },
          currency: {
            type: "string",
          },
          amount: {
            type: "string",
          },
          tax: {
            type: "string",
          },
          paidAmount: {
            type: "string",
          },
          paidDate: {
            type: "string",
          },
          gstNumber: {
            type: "string",
          },
        },
        required: [
          "sourceRow",
          "invoiceNumber",
          "invoiceDate",
          "dueDate",
          "contact",
          "currency",
          "amount",
          "tax",
          "paidAmount",
          "paidDate",
          "gstNumber",
        ],
      },
    },
  },
  required: ["invoices"],
};

function cleanValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "-";
  }

  const text = String(value).trim();

  if (
    !text ||
    text.toLowerCase() === "null" ||
    text.toLowerCase() === "undefined"
  ) {
    return "-";
  }

  return text;
}

function cleanInvoice(invoice) {
  return {
    sourceRow: Number(invoice?.sourceRow) || 0,
    invoiceNumber: cleanValue(invoice?.invoiceNumber),
    invoiceDate: cleanValue(invoice?.invoiceDate),
    dueDate: cleanValue(invoice?.dueDate),
    contact: cleanValue(invoice?.contact),
    currency: cleanValue(invoice?.currency),
    amount: cleanValue(invoice?.amount),
    tax: cleanValue(invoice?.tax),
    paidAmount: cleanValue(invoice?.paidAmount),
    paidDate: cleanValue(invoice?.paidDate),
    gstNumber: cleanValue(invoice?.gstNumber),
  };
}

function prepareStructuredRows(rawContent) {
  const lines = String(rawContent)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return {
      header: lines[0] || "",
      rows: [],
    };
  }

  const header = lines[0];

  const rows = lines.slice(1).map((line, index) => ({
    sourceRow: index + 1,
    data: line,
  }));

  return {
    header,
    rows,
  };
}

export async function normalizeInvoicesWithGemini(rawContent) {
  if (!ai) {
    throw new Error(
      "Gemini is not configured. Add GEMINI_API_KEY to .env.local."
    );
  }

  if (
    !rawContent ||
    !String(rawContent).trim()
  ) {
    throw new Error(
      "No readable invoice data was found in the uploaded file."
    );
  }

  const structured = prepareStructuredRows(
    rawContent
  );

  const rowText = structured.rows
    .map(
      (row) =>
        `SOURCE ROW ${row.sourceRow}:\n${row.data}`
    )
    .join("\n\n");

  const prompt = `
You are an invoice data normalization engine.

Your job is to convert invoice data into a clean structure
that a backend can process.

CRITICAL ROW PRESERVATION RULES:

1. Each SOURCE ROW represents exactly one possible invoice.
2. Return exactly ONE invoice object for every SOURCE ROW.
3. Never merge two SOURCE ROWs.
4. Never duplicate a SOURCE ROW.
5. Never create additional SOURCE ROWs.
6. Every returned invoice MUST contain the exact sourceRow number
   from the input.
7. The number of returned invoices MUST equal the number of
   SOURCE ROWs.
8. Even when many values are missing, still return the invoice.
9. Never invent information.
10. Missing or unclear values must be "-".

FIELD MAPPING:

Invoice No / Invoice # / Invoice ID / Invoice Number
→ invoiceNumber

Date / Invoice Date
→ invoiceDate

Due / Due Date / Payment Due
→ dueDate

Customer / Client / Customer Name / Contact
→ contact

Currency
→ currency

Amount / Invoice Amount / Subtotal / Value / Total
→ amount

Tax / Tax Amount / GST / GST Amount
→ tax

Paid / Paid Amount / Amount Paid
→ paidAmount

Payment Date / Paid Date
→ paidDate

GSTIN / GST Number / GST No
→ gstNumber

DATE RULES:

- Prefer YYYY-MM-DD.
- Convert recognizable dates to YYYY-MM-DD.
- Missing date → "-".
- Unclear date → "-".

NUMBER RULES:

- Remove currency symbols.
- Remove thousands separators.
- Return numeric values as strings.
- Example:
  "₹10,000.50" → "10000.50"
- Missing or unclear number → "-".

CURRENCY:

- Preserve the supplied currency.
- If Indian rupee usage is clearly present and currency is missing,
  use INR.
- Otherwise return "-".

SOURCE HEADER:

${structured.header}

SOURCE ROWS:

${rowText}

Return ONLY JSON matching the provided schema.
`;

  const model = "gemini-3.6-flash";

  console.log(
    `[Gemini] Processing ${structured.rows.length} source rows with ${model}`
  );

  try {
    const response =
      await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: invoiceSchema,
        },
      });

    if (!response?.text) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(
        response.text
      );
    } catch (error) {
      console.error(
        "[Gemini] JSON parse error:",
        error
      );

      throw new Error(
        "Gemini returned invalid invoice JSON."
      );
    }

    if (
      !Array.isArray(
        parsed?.invoices
      )
    ) {
      throw new Error(
        "Gemini response did not contain an invoices array."
      );
    }

    const cleanedInvoices =
      parsed.invoices.map(
        cleanInvoice
      );

    /*
     * Safety check:
     * Gemini must not silently lose or create rows.
     */
    if (
      structured.rows.length > 0 &&
      cleanedInvoices.length !==
        structured.rows.length
    ) {
      throw new Error(
        `Gemini returned ${cleanedInvoices.length} invoices for ${structured.rows.length} source rows. No invoices were saved.`
      );
    }

    /*
     * Safety check:
     * Every source row must appear exactly once.
     */
    if (structured.rows.length > 0) {
      const expectedRows =
        new Set(
          structured.rows.map(
            (row) => row.sourceRow
          )
        );

      const returnedRows =
        cleanedInvoices.map(
          (invoice) =>
            invoice.sourceRow
        );

      const uniqueReturnedRows =
        new Set(returnedRows);

      if (
        uniqueReturnedRows.size !==
          expectedRows.size ||
        returnedRows.some(
          (row) =>
            !expectedRows.has(row)
        )
      ) {
        throw new Error(
          "Gemini returned invalid source row mappings. No invoices were saved."
        );
      }
    }

    console.log(
      `[Gemini] Successfully normalized ${cleanedInvoices.length} invoices`
    );

    return cleanedInvoices;
  } catch (error) {
    console.error(
      "[Gemini] Processing failed:",
      error
    );

    throw new Error(
      error instanceof Error
        ? error.message
        : "Gemini invoice processing failed. Please try again."
    );
  }
}