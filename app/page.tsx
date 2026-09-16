"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Database,
  FileSpreadsheet,
  CheckCircle2,
  BarChart3,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };
    return (
    <main
      className="container"
      style={{
        display: "block",
        minHeight: "100vh",
        padding: "1.25rem 1.5rem 3rem",
      }}
    >
      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          position: "sticky",
          top: "1rem",
          zIndex: 50,
          maxWidth: "1100px",
          margin: "0 auto 2rem",
          padding: "0.8rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          background: "rgba(253, 251, 247, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          boxShadow: "0 8px 24px rgba(63, 53, 44, 0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.65rem",
            border: "none",
            background: "transparent",
            color: "#3f352c",
            fontWeight: 800,
            fontSize: "1.05rem",
            cursor: "pointer",
            padding: "0.25rem",
          }}
          aria-label="Go to top"
        >
          <span
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "0.65rem",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ede5da",
              color: "var(--primary)",
            }}
          >
            <Database size={18} />
          </span>
          ClearTax
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.35rem",
            flex: "1 1 auto",
          }}
        >
          <a
            href="#features"
            style={{
              padding: "0.55rem 0.75rem",
              borderRadius: "0.55rem",
              color: "#6a5c4f",
              textDecoration: "none",
              fontSize: "0.86rem",
              fontWeight: 600,
            }}
          >
            Features
          </a>

          <a
            href="#why-cleartax"
            style={{
              padding: "0.55rem 0.75rem",
              borderRadius: "0.55rem",
              color: "#6a5c4f",
              textDecoration: "none",
              fontSize: "0.86rem",
              fontWeight: 600,
            }}
          >
            Why ClearTax
          </a>

          <a
            href="#how-it-works"
            style={{
              padding: "0.55rem 0.75rem",
              borderRadius: "0.55rem",
              color: "#6a5c4f",
              textDecoration: "none",
              fontSize: "0.86rem",
              fontWeight: 600,
            }}
          >
            How It Works
          </a>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.55rem",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/login")}
            style={{
              padding: "0.6rem 0.9rem",
              borderRadius: "0.6rem",
              border: "1px solid var(--border)",
              background: "#fff",
              color: "var(--primary)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="btn-primary"
            style={{
              padding: "0.62rem 0.95rem",
              whiteSpace: "nowrap",
            }}
          >
            Sign Up
          </button>
        </div>
      </motion.nav>
      {/* HERO SECTION */}
      <motion.section
        className="card"
        style={{
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          padding: "4rem 2rem",
          background: "rgba(255, 255, 255, 0.5)",
          textAlign: "center",
        }}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              background: "rgba(139, 121, 104, 0.15)",
              padding: "1rem",
              borderRadius: "50%",
              color: "var(--primary)",
            }}
          >
            <Database size={48} />
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          style={{
            fontSize: "4rem",
            lineHeight: "1.1",
            marginBottom: "1.5rem",
          }}
        >
          Bulk Invoicing, <br />
          <span
            style={{
              color: "var(--primary)",
              background: "none",
              WebkitTextFillColor: "var(--primary)",
            }}
          >
            Redefined.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="subtitle"
          style={{
            fontSize: "1.25rem",
            maxWidth: "650px",
            margin: "0 auto 3rem auto",
          }}
        >
          Upload, validate, and manage bulk invoices through a simple
          CSV-based workflow with real-time processing updates.
        </motion.p>

        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "4rem",
          }}
        >
          {/* <button
            className="btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem 2.5rem",
              fontSize: "1.125rem",
            }}
            onClick={() => router.push("/signup")}
          >
            Get Started <ArrowRight size={20} />
          </button> */}
        </motion.div>

        {/* KEY HIGHLIGHTS */}
        <motion.div
          variants={containerVariants}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "3rem",
            flexWrap: "wrap",
          }}
        >
          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "#6a5c4f",
            }}
          >
            <ShieldCheck
              size={24}
              style={{ color: "var(--primary)" }}
            />
            <span style={{ fontWeight: 500 }}>
              Secure Authentication
            </span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "#6a5c4f",
            }}
          >
            <Zap size={24} style={{ color: "var(--primary)" }} />
            <span style={{ fontWeight: 500 }}>
              Bulk Processing
            </span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "#6a5c4f",
            }}
          >
            <BarChart3
              size={24}
              style={{ color: "var(--primary)" }}
            />
            <span style={{ fontWeight: 500 }}>
              Processing Tracking
            </span>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* FEATURES SECTION */}
      <motion.section
        id="features"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        style={{
          maxWidth: "1000px",
          margin: "5rem auto",
          textAlign: "center",
          scrollMarginTop: "100px",
        }}
      >
        <motion.h2
          variants={itemVariants}
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            color: "#5f554b",
          }}
        >
          Everything You Need for Bulk Invoicing
        </motion.h2>

        <motion.p
          variants={itemVariants}
          style={{
            maxWidth: "650px",
            margin: "0 auto 3rem auto",
            fontSize: "1.1rem",
            color: "#927f6a",
          }}
        >
          A simple workflow to upload, process, validate, and review
          multiple invoices efficiently.
        </motion.p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <FeatureCard
            icon={<FileSpreadsheet size={30} />}
            title="CSV Upload"
            description="Upload multiple invoice records through a single CSV file instead of entering invoices manually."
          />

          <FeatureCard
            icon={<Zap size={30} />}
            title="Bulk Processing"
            description="Process multiple invoice records together through one streamlined workflow."
          />

          <FeatureCard
            icon={<CheckCircle2 size={30} />}
            title="Invoice Validation"
            description="Identify matched, mismatched, and failed invoice records during processing."
          />

          <FeatureCard
            icon={<BarChart3 size={30} />}
            title="Processing Status"
            description="Track pending, processing, matched, mismatched, and failed invoices from your dashboard."
          />
        </div>
      </motion.section>

      {/* WHY CLEARTAX */}
      <motion.section
        id="why-cleartax"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        style={{
          maxWidth: "1000px",
          margin: "5rem auto",
          textAlign: "center",
          scrollMarginTop: "100px",
        }}
      >
        <motion.h2
          variants={itemVariants}
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            color: "#5f554b",
          }}
        >
          Why ClearTax?
        </motion.h2>

        <motion.p
          variants={itemVariants}
          style={{
            maxWidth: "700px",
            margin: "0 auto 3rem auto",
            fontSize: "1.1rem",
            lineHeight: "1.7",
            color: "#927f6a",
          }}
        >
          Managing a large number of invoices manually can be
          time-consuming and difficult to track. ClearTax provides a
          centralized platform that simplifies bulk invoice processing
          and makes results easier to review.
        </motion.p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <WhyCard
            icon={<Clock size={28} />}
            title="Less Manual Work"
            description="Process multiple invoice records together instead of handling them one by one."
          />

          <WhyCard
            icon={<BarChart3 size={28} />}
            title="Better Visibility"
            description="Track invoice processing status and quickly identify records that need attention."
          />

          <WhyCard
            icon={<Database size={28} />}
            title="Centralized Workflow"
            description="Upload, process, validate, and review invoices from one dashboard."
          />

          <WhyCard
            icon={<CheckCircle2 size={28} />}
            title="Faster Review"
            description="Clearly identify matched, mismatched, and failed invoices after processing."
          />
        </div>
      </motion.section>

      {/* HOW IT WORKS */}
      <motion.section
        id="how-it-works"
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        style={{
          maxWidth: "1000px",
          margin: "5rem auto",
          textAlign: "center",
          scrollMarginTop: "100px",
        }}
      >
        <motion.h2
          variants={itemVariants}
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
            color: "#5f554b",
          }}
        >
          How ClearTax Works
        </motion.h2>

        <motion.p
          variants={itemVariants}
          style={{
            color: "#927f6a",
            fontSize: "1.1rem",
            marginBottom: "3rem",
          }}
        >
          Four simple steps from invoice upload to final review.
        </motion.p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
          }}
        >
          <StepCard
            number="01"
            title="Upload CSV"
            description="Select or drag and drop your invoice CSV file."
          />

          <StepCard
            number="02"
            title="Process Invoices"
            description="Start processing the uploaded invoice batch."
          />

          <StepCard
            number="03"
            title="Validate Records"
            description="Check invoice records and update their processing status."
          />

          <StepCard
            number="04"
            title="Review Results"
            description="Review invoice details and identify records requiring attention."
          />
        </div>
      </motion.section>
      {/* FINAL CTA */}
      <motion.section
        variants={itemVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        style={{
          maxWidth: "900px",
          margin: "5rem auto 2rem auto",
          padding: "4rem 2rem",
          textAlign: "center",
          borderRadius: "24px",
          background: "rgba(255, 255, 255, 0.55)",
          border:
            "1px solid rgba(139, 121, 104, 0.15)",
        }}
      >
        <h2
          style={{
            fontSize: "2.5rem",
            color: "#5f554b",
            marginBottom: "1rem",
          }}
        >
          Ready to Simplify Your Invoice Processing?
        </h2>

        <p
          style={{
            color: "#927f6a",
            fontSize: "1.1rem",
            marginBottom: "2rem",
          }}
        >
          Manage your bulk invoice workflow from one centralized
          dashboard.
        </p>

        <button
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "1rem 2.5rem",
            fontSize: "1.125rem",
          }}
          onClick={() => router.push("/signup")}
        >
          Get Started <ArrowRight size={20} />
        </button>
      </motion.section>
    </main>
  );
}

/* FEATURE CARD */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      style={{
        padding: "2rem 1.5rem",
        borderRadius: "20px",
        background: "rgba(255, 255, 255, 0.55)",
        border:
          "1px solid rgba(139, 121, 104, 0.15)",
        textAlign: "left",
      }}
    >
      <div
        style={{
          color: "var(--primary)",
          marginBottom: "1rem",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          color: "#5f554b",
          marginBottom: "0.75rem",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#927f6a",
          lineHeight: "1.6",
        }}
      >
        {description}
      </p>
    </motion.div>
  );
}

/* WHY CARD */

function WhyCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      style={{
        padding: "2rem 1.5rem",
        borderRadius: "20px",
        background: "rgba(255, 255, 255, 0.55)",
        border:
          "1px solid rgba(139, 121, 104, 0.15)",
        textAlign: "left",
      }}
    >
      <div
        style={{
          color: "var(--primary)",
          marginBottom: "1rem",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          color: "#5f554b",
          marginBottom: "0.75rem",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#927f6a",
          lineHeight: "1.6",
        }}
      >
        {description}
      </p>
    </motion.div>
  );
}

/* STEP CARD */

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      style={{
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--primary)",
          marginBottom: "0.75rem",
        }}
      >
        {number}
      </div>

      <h3
        style={{
          color: "#5f554b",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#927f6a",
          lineHeight: "1.6",
        }}
      >
        {description}
      </p>
    </motion.div>
  );
}