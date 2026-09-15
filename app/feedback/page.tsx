"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  LogOut,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface FeedbackItem {
  id: number;
  name: string | null;
  email: string | null;
  message: string;
  status: string;
  created_at: string;
}

interface UserSession {
  id: string;
  name: string;
  email: string;
}

const ADMIN_EMAILS = [
  "dheer@gmail.com",
  "prateek@gmail.com",
  "himesh@gmail.com",
];

export default function FeedbackPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserSession | null>(null);
  const [adminPassword, setAdminPassword] = useState("");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cleartax_user");

      if (!stored) {
        router.push("/login");
        return;
      }

      const parsed = JSON.parse(stored);

      if (!parsed?.email) {
        router.push("/login");
        return;
      }

      setUser(parsed);
    } catch (error) {
      console.error("Failed to restore user session:", error);
      router.push("/login");
    }
  }, [router]);

  const loadFeedback = async () => {
    if (!user?.email || !adminPassword) {
      setErrorMessage("Enter your admin password.");
      return;
    }

    const adminEmail = user.email.trim().toLowerCase();

    if (!ADMIN_EMAILS.includes(adminEmail)) {
      setErrorMessage("You are not authorized to view feedback.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get-feedback",
          adminEmail,
          adminPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load feedback."
        );
      }

      setFeedback(Array.isArray(result.data) ? result.data : []);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Feedback loading error:", error);

      setIsAuthenticated(false);
      setFeedback([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to load feedback."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cleartax_user");
    router.push("/login");
  };

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return null;
  }

  const isAdmin = ADMIN_EMAILS.includes(
    user.email.trim().toLowerCase()
  );

  return (
    <main
      className="container"
      style={{
        minHeight: "100vh",
        padding: "2rem 1.5rem 4rem",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
            padding: "1rem 1.25rem",
            background: "#faf8f4",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "#ede5da",
              color: "var(--primary)",
              border: "1px solid var(--border)",
              padding: "0.65rem 0.9rem",
              borderRadius: "0.6rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--muted-foreground)",
              }}
            >
              Signed in as
            </div>

            <div
              style={{
                fontWeight: 800,
                color: "#3f352c",
              }}
            >
              {user.email}
            </div>
          </div>

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
              padding: "0.65rem 0.9rem",
              borderRadius: "0.6rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {!isAdmin ? (
          <div
            className="card"
            style={{
              maxWidth: "650px",
              margin: "4rem auto",
              padding: "3rem 2rem",
              textAlign: "center",
            }}
          >
            <MessageSquare
              size={42}
              style={{
                color: "var(--primary)",
                marginBottom: "1rem",
              }}
            />

            <h1
              style={{
                color: "#3f352c",
                marginBottom: "0.75rem",
              }}
            >
              Access Denied
            </h1>

            <p
              style={{
                color: "var(--muted-foreground)",
                marginBottom: "1.5rem",
              }}
            >
              Your account is not authorized to view user feedback.
            </p>

            <button
              type="button"
              className="btn-primary"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        ) : !isAuthenticated ? (
          <div
            className="card"
            style={{
              maxWidth: "520px",
              margin: "4rem auto",
              padding: "2.5rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <MessageSquare
                size={40}
                style={{
                  color: "var(--primary)",
                  marginBottom: "1rem",
                }}
              />

              <h1
                style={{
                  color: "#3f352c",
                  marginBottom: "0.5rem",
                }}
              >
                User Feedback
              </h1>

              <p
                style={{
                  color: "var(--muted-foreground)",
                  marginBottom: "1.75rem",
                }}
              >
                Enter your password to view submitted concerns.
              </p>
            </div>

            <input
              type="password"
              placeholder="Admin password"
              value={adminPassword}
              onChange={(event) =>
                setAdminPassword(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loadFeedback();
                }
              }}
              style={{
                width: "100%",
                padding: "0.9rem 1rem",
                borderRadius: "0.7rem",
                border: "1px solid var(--border)",
                background: "#fff",
                color: "#3f352c",
                boxSizing: "border-box",
                marginBottom: "1rem",
              }}
            />

            {errorMessage && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.85rem 1rem",
                  borderRadius: "0.7rem",
                  background: "#fff1f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  fontSize: "0.9rem",
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              className="btn-primary"
              onClick={loadFeedback}
              disabled={isLoading}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "0.9rem",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Loading..." : "View Feedback"}
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    color: "#3f352c",
                  }}
                >
                  User Concerns
                </h1>

                <p
                  style={{
                    margin: "0.4rem 0 0",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Review feedback submitted through the landing page.
                </p>
              </div>

              <button
                type="button"
                onClick={loadFeedback}
                disabled={isLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  background: "#ede5da",
                  color: "var(--primary)",
                  border: "1px solid var(--border)",
                  padding: "0.65rem 0.9rem",
                  borderRadius: "0.6rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "0.85rem",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  Total Feedback
                </div>

                <div
                  style={{
                    marginTop: "0.4rem",
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    color: "#3f352c",
                  }}
                >
                  {feedback.length}
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: "0.85rem",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  New Concerns
                </div>

                <div
                  style={{
                    marginTop: "0.4rem",
                    fontSize: "1.8rem",
                    fontWeight: 800,
                    color: "#d97706",
                  }}
                >
                  {
                    feedback.filter(
                      (item) => item.status === "new"
                    ).length
                  }
                </div>
              </div>
            </div>

            {errorMessage && (
              <div
                style={{
                  marginBottom: "1rem",
                  padding: "0.85rem 1rem",
                  borderRadius: "0.7rem",
                  background: "#fff1f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                }}
              >
                {errorMessage}
              </div>
            )}

            {feedback.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: "4rem 1.5rem",
                  textAlign: "center",
                }}
              >
                <MessageSquare
                  size={38}
                  style={{
                    color: "var(--muted-foreground)",
                    marginBottom: "0.75rem",
                  }}
                />

                <h2
                  style={{
                    color: "#3f352c",
                    marginBottom: "0.5rem",
                  }}
                >
                  No feedback yet
                </h2>

                <p
                  style={{
                    color: "var(--muted-foreground)",
                    margin: 0,
                  }}
                >
                  User concerns will appear here after submission.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                }}
              >
                {feedback.map((item) => (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      padding: "1.25rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 800,
                            color: "#3f352c",
                            fontSize: "1rem",
                          }}
                        >
                          {item.name || "Anonymous User"}
                        </div>

                        <div
                          style={{
                            marginTop: "0.25rem",
                            color: "var(--muted-foreground)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {item.email || "No email provided"}
                        </div>
                      </div>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          padding: "0.35rem 0.65rem",
                          borderRadius: "999px",
                          background:
                            item.status === "new"
                              ? "#fef3c7"
                              : "#dcfce7",
                          color:
                            item.status === "new"
                              ? "#92400e"
                              : "#166534",
                          border:
                            item.status === "new"
                              ? "1px solid #fde68a"
                              : "1px solid #bbf7d0",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {item.status === "new" ? (
                          <Clock size={13} />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        {item.status}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "#faf8f4",
                        border: "1px solid var(--border)",
                        borderRadius: "0.7rem",
                        color: "#4b4036",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.message}
                    </div>

                    <div
                      style={{
                        marginTop: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        color: "var(--muted-foreground)",
                        fontSize: "0.78rem",
                      }}
                    >
                      <Clock size={13} />
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}