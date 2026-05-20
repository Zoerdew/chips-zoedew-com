"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Surface verify-route errors (expired / missing magic link).
  useEffect(() => {
    const e = params.get("error");
    if (e === "expired") {
      setError("That link has expired. Request a fresh one below.");
    } else if (e === "missing") {
      setError("That link was incomplete. Request a fresh one below.");
    }
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something broke. Try again in a minute.");
        return;
      }
      setSent(true);
      setMessage(data.message);
    } catch {
      setError("Something broke on our end. Try again in a minute.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div
        style={{
          background: "var(--yellow)",
          border: "3px solid var(--ink)",
          borderRadius: 12,
          padding: "16px 18px",
          fontWeight: 500,
        }}
      >
        <strong style={{ display: "block", marginBottom: 6 }}>Link sent.</strong>
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label style={{ display: "block", marginBottom: 14 }}>
        <span
          style={{
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Email
        </span>
        <input
          className="input"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginTop: 6 }}
        />
      </label>

      {error && (
        <div
          role="alert"
          style={{
            background: "var(--yellow)",
            border: "3px solid var(--ink)",
            borderRadius: 12,
            padding: "10px 14px",
            marginBottom: 14,
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      )}

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? "Sending..." : "Send my link →"}
      </button>

      <p className="text-small" style={{ marginTop: 14, opacity: 0.8 }}>
        Not registered yet? The bet is added by hand, not self-signup. If you
        think you should be in and aren&apos;t, email zoe@zoedew.com.
      </p>
    </form>
  );
}
