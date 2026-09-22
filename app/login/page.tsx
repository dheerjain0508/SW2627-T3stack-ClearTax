"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!email || !password) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to log in");
      }

      localStorage.setItem("cleartax_user", JSON.stringify(data.user));

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <main
      className="container"
      style={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <motion.div
        className="card"
        style={{
          maxWidth: "450px",
          width: "100%",
          padding: "3rem",
          position: "relative",
        }}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Back to Home"
          style={{
            position: "absolute",
            top: "1.25rem",
            left: "1.25rem",
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            border: "1px solid #e5ded5",
            background: "#f8f5f1",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "1.4rem",
            lineHeight: 1,
          }}
        >
          ←
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              background: "rgba(181, 154, 122, 0.15)",
              padding: "1rem",
              borderRadius: "50%",
              color: "var(--primary)",
            }}
          >
            <User size={32} />
          </div>
        </div>

        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: "#fff",
          }}
        >
          Welcome Back
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "var(--muted-foreground)",
            marginBottom: "2rem",
          }}
        >
          Sign in to your ClearTax account.
        </p>

        {errorMessage && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                color: "#6a5c4f",
                fontWeight: 500,
              }}
            >
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: "rgba(0, 0, 0, 0.3)",
                color: "#fff",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--primary)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border)")
              }
            />
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <label
                style={{
                  fontSize: "0.875rem",
                  color: "#6a5c4f",
                  fontWeight: 500,
                }}
              >
                Password
              </label>
            </div>

            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "1rem",
                  paddingRight: "3rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "rgba(0, 0, 0, 0.3)",
                  color: "#fff",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--primary)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border)")
                }
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--muted-foreground)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !email || !password}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1rem",
              marginTop: "0.5rem",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? (
              "Signing in..."
            ) : (
              <>
                Sign In <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "2rem",
            color: "var(--muted-foreground)",
            fontSize: "0.875rem",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "var(--primary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}