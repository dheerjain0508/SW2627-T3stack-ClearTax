"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  History,
  MessageSquare,
  LogOut,
  UploadCloud,
  User as UserIcon,
  X,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import HistoryDrawer from "@/components/HistoryDrawer";

type PaymentStatus =
  | "matched"
  | "partially_paid"
  | "unpaid"
  | "overpaid"
  | "failed";

type TimingStatus =
  | "on_time"
  | "late"
  | "overdue"
  | "pending"
  | "not_available"
  | "invalid";

interface InvoiceRecord {
  id: number | string;
  userId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  contact: string;
  customerName: string;
  currency: string;
  amount: number | null;
  tax: number;
  totalAmount: number | null;
  paidAmount: number;
  amountDue: number | null;
  paidDate: string | null;
  paymentStatus: PaymentStatus;
  timingStatus: TimingStatus;
  gstNumber?: string;
  error: string | null;
  createdAt?: string;
}

interface UserSession {
  id: string;
  name: string;
  email: string;
}

function normalizeInvoice(raw: any): InvoiceRecord {
  const amount =
    raw?.amount === null || raw?.amount === undefined
      ? null
      : Number(raw.amount);

  const tax =
    raw?.tax === null || raw?.tax === undefined ? 0 : Number(raw.tax);

  const totalAmount =
    raw?.totalAmount === null || raw?.totalAmount === undefined
      ? amount === null
        ? null
        : amount + tax
      : Number(raw.totalAmount);

  const paidAmount =
    raw?.paidAmount === null || raw?.paidAmount === undefined
      ? 0
      : Number(raw.paidAmount);

  const amountDue =
    raw?.amountDue === null || raw?.amountDue === undefined
      ? totalAmount === null
        ? null
        : totalAmount - paidAmount
      : Number(raw.amountDue);

  const paymentStatus =
    raw?.paymentStatus ||
    (raw?.status === "matched" ? "matched" : raw?.status) ||
    "failed";

  const timingStatus = raw?.timingStatus || "not_available";

  return {
    id: raw?.id,
    userId: String(raw?.userId ?? raw?.user_id ?? ""),
    invoiceNumber: String(raw?.invoiceNumber ?? raw?.invoice_number ?? ""),
    invoiceDate: String(raw?.invoiceDate ?? raw?.invoice_date ?? ""),
    dueDate: raw?.dueDate ?? raw?.due_date ?? null,
    contact: String(raw?.contact ?? raw?.customerName ?? raw?.customer_name ?? ""),
    customerName: String(
      raw?.customerName ?? raw?.customer_name ?? raw?.contact ?? ""
    ),
    currency: String(raw?.currency ?? "INR"),
    amount,
    tax,
    totalAmount,
    paidAmount,
    amountDue,
    paidDate: raw?.paidDate ?? raw?.paid_date ?? null,
    paymentStatus,
    timingStatus,
    gstNumber: raw?.gstNumber ?? raw?.gst_number ?? "",
    error: raw?.error ?? null,
    createdAt: raw?.createdAt ?? raw?.created_at,
  } as InvoiceRecord;
}

function formatMoney(value: number | null, currency = "INR") {
  if (value === null || Number.isNaN(value)) return "N/A";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function paymentLabel(status: PaymentStatus) {
  switch (status) {
    case "matched":
      return "Matched";
    case "partially_paid":
      return "Partially Paid";
    case "unpaid":
      return "Unpaid";
    case "overpaid":
      return "Overpaid";
    default:
      return "Failed";
  }
}

function timingLabel(status: TimingStatus) {
  switch (status) {
    case "on_time":
      return "On Time";
    case "late":
      return "Late";
    case "overdue":
      return "Overdue";
    case "pending":
      return "Pending";
    case "invalid":
      return "Invalid";
    default:
      return "N/A";
  }
}

function paymentStyle(status: PaymentStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.35rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  };

  switch (status) {
    case "matched":
      return {
        ...base,
        background: "#dcfce7",
        color: "#166534",
        border: "1px solid #bbf7d0",
      };
    case "partially_paid":
      return {
        ...base,
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
      };
    case "unpaid":
      return {
        ...base,
        background: "#f3f4f6",
        color: "#4b5563",
        border: "1px solid #e5e7eb",
      };
    case "overpaid":
      return {
        ...base,
        background: "#ede9fe",
        color: "#6d28d9",
        border: "1px solid #ddd6fe",
      };
    default:
      return {
        ...base,
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      };
  }
}

function timingStyle(status: TimingStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    padding: "0.35rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 700,
    whiteSpace: "nowrap",
  };

  switch (status) {
    case "on_time":
      return {
        ...base,
        background: "#dcfce7",
        color: "#166534",
        border: "1px solid #bbf7d0",
      };
    case "late":
      return {
        ...base,
        background: "#ffedd5",
        color: "#9a3412",
        border: "1px solid #fed7aa",
      };
    case "overdue":
      return {
        ...base,
        background: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      };
    case "pending":
      return {
        ...base,
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
      };
    default:
      return {
        ...base,
        background: "#f3f4f6",
        color: "#6b7280",
        border: "1px solid #e5e7eb",
      };
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [historyInvoices, setHistoryInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 15;

  const totalInvoices = invoices.length;
  const matchedInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "matched"
  ).length;
  const partiallyPaidInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "partially_paid"
  ).length;
  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "unpaid"
  ).length;
  const overpaidInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "overpaid"
  ).length;
  const failedInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "failed"
  ).length;
  const overdueInvoices = invoices.filter(
    (invoice) => invoice.timingStatus === "overdue"
  ).length;

  const invoiceValue = invoices.reduce(
    (sum, invoice) => sum + (invoice.amount ?? 0),
    0
  );
  const totalTax = invoices.reduce(
    (sum, invoice) => sum + (invoice.tax ?? 0),
    0
  );
  const totalPayable = invoices.reduce(
    (sum, invoice) => sum + (invoice.totalAmount ?? 0),
    0
  );
  const totalPaid = invoices.reduce(
    (sum, invoice) => sum + (invoice.paidAmount ?? 0),
    0
  );
  const outstanding = invoices.reduce(
    (sum, invoice) =>
      sum + Math.max(invoice.amountDue ?? 0, 0),
    0
  );
  const totalOverpaid = invoices.reduce(
    (sum, invoice) =>
      sum +
      Math.max(
        (invoice.paidAmount ?? 0) - (invoice.totalAmount ?? 0),
        0
      ),
    0
  );

  const totalPages = Math.max(1, Math.ceil(totalInvoices / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentInvoices = invoices.slice(startIndex, endIndex);
  const ADMIN_EMAILS = ["dheer@gmail.com","prateek@gmail.com","himesh@gmail.com",];
  const isAdmin =!!user?.email && ADMIN_EMAILS.includes(user.email.trim().toLowerCase());
  const fetchInvoices = useCallback(async (userId: string) => {
    setIsLoadingInvoices(true);

    try {
      const response = await fetch(
        `/api/invoices?userId=${encodeURIComponent(userId)}`,
        {
          headers: {
            "x-user-id": userId,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch invoices");
      }

      setInvoices(
        Array.isArray(result.data)
          ? result.data.map(normalizeInvoice)
          : []
      );
      setHistoryInvoices(
  Array.isArray(result.data)
    ? result.data.map(normalizeInvoice)
    : []
);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      setInvoices([]);
    } finally {
      setIsLoadingInvoices(false);
    }
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cleartax_user");

      if (stored) {
        const parsed = JSON.parse(stored);

        if (parsed?.id) {
          setUser(parsed);
          fetchInvoices(parsed.id);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    }

    router.push("/login");
  }, [fetchInvoices, router]);

  const handleLogout = () => {
    localStorage.removeItem("cleartax_user");
    router.push("/login");
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files?.length) {
      handleFile(event.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      handleFile(event.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.toLowerCase().endsWith(".csv")
    ) {
      alert("Please upload a valid CSV file.");
      return;
    }

    setFile(selectedFile);
    setProgress(0);
  };

  const startProcessing = async () => {
    if (!file || !user || isProcessing) return;

    try {
      setIsProcessing(true);
      setProgress(25);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/invoices/process", {
        method: "POST",
        headers: {
          "x-user-id": user.id,
        },
        body: formData,
      });

      setProgress(75);

      const text = await response.text();

      if (!text) {
        throw new Error("Server returned an empty response");
      }

      const result = JSON.parse(text);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to process invoices");
      }

      if (Array.isArray(result.data)) {
        setInvoices(result.data.map(normalizeInvoice));
        setHistoryInvoices(
  result.data.map(normalizeInvoice)
);
        setCurrentPage(1);
      }

      setProgress(100);
    } catch (error) {
      console.error("Processing error:", error);
      setProgress(0);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while processing invoices."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const containerVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35 },
    },
  };

  const summaryCard = (
    label: string,
    value: string | number,
    icon: React.ReactNode,
    accent = "var(--primary)"
  ) => (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid var(--border)",
        borderRadius: "0.85rem",
        padding: "1rem",
        minHeight: "105px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.82rem",
            color: "var(--muted-foreground)",
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <span style={{ color: accent }}>{icon}</span>
      </div>

      <div
        style={{
          marginTop: "0.5rem",
          fontSize: "1.8rem",
          fontWeight: 800,
          color: "#3f352c",
        }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <main
      className="container"
      style={{
        paddingTop: "2rem",
        paddingBottom: "4rem",
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            padding: "1rem 1.25rem",
            background: "#faf8f4",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ede5da",
                color: "var(--primary)",
              }}
            >
              <UserIcon size={20} />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: "#3f352c",
                  fontSize: "0.95rem",
                }}
              >
                {user?.name || "Account"}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted-foreground)",
                }}
              >
                {user?.email || ""}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                background: "#ede5da",
                color: "var(--primary)",
                border: "1px solid var(--border)",
                padding: "0.6rem 0.95rem",
                borderRadius: "0.6rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <History size={16} />
              History
            </button>
              {isAdmin && (
  <button
    type="button"
    onClick={() => router.push("/feedback")}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.45rem",
      background: "#ede5da",
      color: "var(--primary)",
      border: "1px solid var(--border)",
      padding: "0.6rem 0.95rem",
      borderRadius: "0.6rem",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    <MessageSquare size={16} />
    Feedback
  </button>
)}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                background: "#fff1f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                padding: "0.6rem 0.95rem",
                borderRadius: "0.6rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        <motion.div
          variants={itemVariants}
          className="card"
          style={{
            padding: "1.5rem",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <motion.h1
            variants={itemVariants}
            style={{
              marginBottom: "0.5rem",
              color: "#3f352c",
            }}
          >
            ClearTax Bulk Invoice Reconciliation
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="subtitle"
            style={{ marginBottom: "1.5rem" }}
          >
            Upload a controlled CSV, process invoices in bulk, and review
            payment reconciliation and timing status from one dashboard.
          </motion.p>

          <motion.div variants={itemVariants}>
            <div
              style={{
                background: "#faf8f4",
                border: "1px solid var(--border)",
                borderRadius: "1rem",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  marginBottom: "1rem",
                  fontWeight: 800,
                  color: "#3f352c",
                }}
              >
                Reconciliation Summary
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "0.9rem",
                }}
              >
                {summaryCard(
                  "Total Invoices",
                  totalInvoices,
                  <FileText size={18} />
                )}
                {summaryCard(
                  "Matched",
                  matchedInvoices,
                  <CheckCircle2 size={18} />,
                  "#16a34a"
                )}
                {summaryCard(
                  "Partially Paid",
                  partiallyPaidInvoices,
                  <Clock3 size={18} />,
                  "#d97706"
                )}
                {summaryCard(
                  "Unpaid",
                  unpaidInvoices,
                  <AlertTriangle size={18} />,
                  "#6b7280"
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "0.9rem",
                  maxWidth: "75%",
                  margin: "0.9rem auto 0",
                }}
              >
                {summaryCard(
                  "Overpaid",
                  overpaidInvoices,
                  <CheckCircle2 size={18} />,
                  "#7c3aed"
                )}
                {summaryCard(
                  "Failed",
                  failedInvoices,
                  <XCircle size={18} />,
                  "#dc2626"
                )}
                {summaryCard(
                  "Overdue",
                  overdueInvoices,
                  <Clock3 size={18} />,
                  "#dc2626"
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: "1.25rem",
                background: "#f7f3ed",
                border: "1px solid var(--border)",
                borderRadius: "1rem",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  marginBottom: "1rem",
                  fontWeight: 800,
                  color: "#3f352c",
                }}
              >
                Financial Overview
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "0.9rem",
                }}
              >
                {summaryCard(
                  "Invoice Value",
                  formatMoney(invoiceValue),
                  <FileText size={18} />
                )}
                {summaryCard(
                  "Total Tax",
                  formatMoney(totalTax),
                  <FileText size={18} />
                )}
                {summaryCard(
                  "Total Payable",
                  formatMoney(totalPayable),
                  <FileText size={18} />
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "0.9rem",
                  marginTop: "0.9rem",
                }}
              >
                {summaryCard(
                  "Total Paid",
                  formatMoney(totalPaid),
                  <CheckCircle2 size={18} />,
                  "#16a34a"
                )}
                {summaryCard(
                  "Outstanding",
                  formatMoney(outstanding),
                  <AlertTriangle size={18} />,
                  "#d97706"
                )}
                {summaryCard(
                  "Overpaid",
                  formatMoney(totalOverpaid),
                  <CheckCircle2 size={18} />,
                  "#7c3aed"
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={{ marginTop: "1.5rem" }}
          >
            <div
              className={`upload-zone ${
                isDragging ? "drag-active" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                minHeight: "190px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              {file ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "1rem",
                  }}
                >
                  <FileText
                    className="upload-icon"
                    style={{ marginBottom: "0.5rem" }}
                  />

                  <h3 style={{ marginBottom: "0.25rem" }}>
                    {file.name}
                  </h3>

                  <p
                    className="subtitle"
                    style={{ marginBottom: 0 }}
                  >
                    {(file.size / 1024).toFixed(2)} KB
                  </p>

                  <button
                    type="button"
                    className="btn-primary"
                    disabled={isProcessing}
                    onClick={(event) => {
                      event.stopPropagation();
                      startProcessing();
                    }}
                    style={{ marginTop: "1.25rem" }}
                  >
                    {isProcessing
                      ? "Processing..."
                      : "Process CSV Now"}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "1rem",
                  }}
                >
                  <UploadCloud
                    className="upload-icon"
                    style={{ marginBottom: "0.5rem" }}
                  />
                  <h3 style={{ marginBottom: "0.35rem" }}>
                    Drag & Drop your CSV here
                  </h3>
                  <p style={{ margin: 0 }}>
                    or click to browse files from your computer
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {(isProcessing || progress > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="progress-container"
                style={{ marginTop: "1rem" }}
              >
                <div className="progress-header">
                  <span>
                    {isProcessing
                      ? "Processing Invoices..."
                      : "Processing Complete"}
                  </span>
                  <span>{progress}%</span>
                </div>

                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {invoices.length > 0 ? (
            <motion.div
              variants={itemVariants}
              style={{
                marginTop: "1.5rem",
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3 style={{ margin: 0 }}>Invoices</h3>
                  <span
                    style={{
                      display: "block",
                      marginTop: "0.25rem",
                      fontSize: "0.82rem",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Showing {startIndex + 1}–
                    {Math.min(endIndex, invoices.length)} of{" "}
                    {invoices.length}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setFile(null);
                    setProgress(0);
                    setInvoices([]);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "0.65rem 1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  Upload Another Batch
                </button>
              </div>

              <div
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  border: "1px solid var(--border)",
                  borderRadius: "0.9rem",
                  background: "#fff",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "block",
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    overflowX: "scroll",
                    overflowY: "hidden",
                    WebkitOverflowScrolling: "touch",
                    scrollbarWidth: "auto",
                  }}
                >
                  <table
                    className="styled-table"
                    style={{
                      width: "max-content",
                      minWidth: "1000px",
                    }}
                  >
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Contact</th>
                      <th>Invoice Date</th>
                      <th>Due Date</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th>Payment Status</th>
                      <th>Timing</th>
                      <th>View</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentInvoices.map((invoice) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <td style={{ fontWeight: 700 }}>
                          {invoice.invoiceNumber}
                        </td>

                        <td>{invoice.contact || "N/A"}</td>

                        <td>{formatDate(invoice.invoiceDate)}</td>

                        <td>{formatDate(invoice.dueDate)}</td>

                        <td>
                          {formatMoney(
                            invoice.totalAmount,
                            invoice.currency
                          )}
                        </td>

                        <td>
                          {formatMoney(
                            invoice.paidAmount,
                            invoice.currency
                          )}
                        </td>

                        <td>
                          {formatMoney(
                            Math.max(invoice.amountDue ?? 0, 0),
                            invoice.currency
                          )}
                        </td>

                        <td>
                          <span
                            style={paymentStyle(
                              invoice.paymentStatus
                            )}
                          >
                            {invoice.paymentStatus === "matched" ? (
                              <CheckCircle2 size={14} />
                            ) : invoice.paymentStatus === "failed" ? (
                              <XCircle size={14} />
                            ) : (
                              <AlertTriangle size={14} />
                            )}
                            {paymentLabel(invoice.paymentStatus)}
                          </span>

                          {invoice.error && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.3rem",
                                marginTop: "0.4rem",
                                color: "#b91c1c",
                                fontSize: "0.72rem",
                                lineHeight: 1.35,
                                maxWidth: "220px",
                              }}
                            >
                              <AlertTriangle
                                size={13}
                                style={{ flexShrink: 0 }}
                              />
                              {invoice.error}
                            </div>
                          )}
                        </td>

                        <td>
                          <span
                            style={timingStyle(
                              invoice.timingStatus
                            )}
                          >
                            {invoice.timingStatus === "on_time" ? (
                              <CheckCircle2 size={14} />
                            ) : invoice.timingStatus === "overdue" ||
                              invoice.timingStatus === "late" ? (
                              <Clock3 size={14} />
                            ) : (
                              <AlertTriangle size={14} />
                            )}
                            {timingLabel(invoice.timingStatus)}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedInvoice(invoice)
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              background: "#f1ece5",
                              color: "var(--primary)",
                              border: "1px solid var(--border)",
                              borderRadius: "0.5rem",
                              padding: "0.5rem 0.7rem",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "0.45rem",
                    marginTop: "1.25rem",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(page - 1, 1)
                      )
                    }
                    style={{
                      padding: "0.5rem 0.85rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border)",
                      background:
                        safePage === 1 ? "#f3eee8" : "#fff",
                      color:
                        safePage === 1 ? "#a99b8d" : "#3f352c",
                      cursor:
                        safePage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        minWidth: "40px",
                        padding: "0.5rem 0.7rem",
                        borderRadius: "0.5rem",
                        border: "1px solid var(--border)",
                        background:
                          safePage === page
                            ? "var(--primary)"
                            : "#fff",
                        color:
                          safePage === page
                            ? "#fff"
                            : "#3f352c",
                        fontWeight:
                          safePage === page ? 800 : 600,
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={safePage === totalPages}
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages)
                      )
                    }
                    style={{
                      padding: "0.5rem 0.85rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border)",
                      background:
                        safePage === totalPages ? "#f3eee8" : "#fff",
                      color:
                        safePage === totalPages
                          ? "#a99b8d"
                          : "#3f352c",
                      cursor:
                        safePage === totalPages
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            !isLoadingInvoices && (
              <motion.div
                variants={itemVariants}
                style={{
                  marginTop: "1.5rem",
                  padding: "2.5rem 1.5rem",
                  textAlign: "center",
                  background: "#faf8f4",
                  borderRadius: "0.9rem",
                  border: "1px dashed var(--border)",
                }}
              >
                <FileText
                  size={34}
                  style={{
                    margin: "0 auto 0.75rem",
                    color: "var(--muted-foreground)",
                    opacity: 0.65,
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    color: "var(--muted-foreground)",
                  }}
                >
                  No invoices found for this account.
                </p>
                <p
                  style={{
                    marginTop: "0.3rem",
                    fontSize: "0.85rem",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Upload your CSV above to start reconciliation.
                </p>
              </motion.div>
            )
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedInvoice && (
          <div
            onClick={() => setSelectedInvoice(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 70,
              background: "rgba(63, 53, 44, 0.28)",
              backdropFilter: "blur(4px)",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 220,
              }}
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "520px",
                height: "100vh",
                background: "#fdfbf7",
                borderLeft: "1px solid var(--border)",
                boxShadow: "-10px 0 30px rgba(63, 53, 44, 0.15)",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f7f3ed",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--muted-foreground)",
                      marginBottom: "0.2rem",
                    }}
                  >
                    Invoice Details
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1.3rem",
                      color: "#3f352c",
                    }}
                  >
                    {selectedInvoice.invoiceNumber}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: "#fff",
                    color: "#6b5c4d",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div
                style={{
                  padding: "1.5rem",
                  display: "grid",
                  gap: "0.8rem",
                }}
              >
                {[
                  ["Contact", selectedInvoice.contact || "N/A"],
                  ["Invoice Date", formatDate(selectedInvoice.invoiceDate)],
                  ["Due Date", formatDate(selectedInvoice.dueDate)],
                  [
                    "Invoice Value",
                    formatMoney(
                      selectedInvoice.amount,
                      selectedInvoice.currency
                    ),
                  ],
                  [
                    "Tax",
                    formatMoney(
                      selectedInvoice.tax,
                      selectedInvoice.currency
                    ),
                  ],
                  [
                    "Total Payable",
                    formatMoney(
                      selectedInvoice.totalAmount,
                      selectedInvoice.currency
                    ),
                  ],
                  [
                    "Paid Amount",
                    formatMoney(
                      selectedInvoice.paidAmount,
                      selectedInvoice.currency
                    ),
                  ],
                  [
                    "Amount Due",
                    formatMoney(
                      Math.max(selectedInvoice.amountDue ?? 0, 0),
                      selectedInvoice.currency
                    ),
                  ],
                  [
                    "Paid Date",
                    formatDate(selectedInvoice.paidDate),
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.9rem 1rem",
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: "0.7rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--muted-foreground)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        color: "#3f352c",
                        fontWeight: 700,
                        textAlign: "right",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: "0.4rem",
                    padding: "1rem",
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "0.7rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Payment Status
                  </div>
                  <span
                    style={paymentStyle(
                      selectedInvoice.paymentStatus
                    )}
                  >
                    {paymentLabel(selectedInvoice.paymentStatus)}
                  </span>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "0.7rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Timing Status
                  </div>
                  <span
                    style={timingStyle(selectedInvoice.timingStatus)}
                  >
                    {timingLabel(selectedInvoice.timingStatus)}
                  </span>
                </div>

                {selectedInvoice.error && (
                  <div
                    style={{
                      padding: "1rem",
                      background: "#fff1f2",
                      border: "1px solid #fecaca",
                      borderRadius: "0.7rem",
                      color: "#991b1b",
                      fontSize: "0.85rem",
                    }}
                  >
                    <strong>Error:</strong> {selectedInvoice.error}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        invoices={historyInvoices}
        onSelectInvoice={(invoice) => setSelectedInvoice(invoice)}
      />
    </main>
  );
}


