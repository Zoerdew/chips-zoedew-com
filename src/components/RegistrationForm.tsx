"use client";

import { useEffect, useState } from "react";

type RegisteredParticipant = {
  id: string;
  firstName: string;
  referralCode: string;
  referralLink: string;
};

type ApiSuccess = {
  ok: true;
  alreadyRegistered: boolean;
  participant: RegisteredParticipant;
};
type ApiError = {
  ok: false;
  error: { field: string; message: string };
};
type ApiResponse = ApiSuccess | ApiError;

const REF_STORAGE_KEY = "chips_ref";

function readRefFromUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("ref")?.trim().toLowerCase();
  if (fromUrl) {
    try {
      window.localStorage.setItem(REF_STORAGE_KEY, fromUrl);
    } catch {
      // ignore
    }
    return fromUrl;
  }
  try {
    return window.localStorage.getItem(REF_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

type Props = {
  // When set, sent in the X-Early-Access header so the API will accept
  // registrations before the public landing date. Used by /early.
  earlyAccessPassword?: string;
};

export function RegistrationForm({ earlyAccessPassword }: Props = {}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [ref, setRef] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiSuccess | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRef(readRefFromUrl());
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (earlyAccessPassword) {
        headers["X-Early-Access"] = earlyAccessPassword;
      }
      const res = await fetch("/api/register", {
        method: "POST",
        headers,
        body: JSON.stringify({ firstName, lastName, email, ref }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!data.ok) {
        setError(data.error.message);
        return;
      }
      setResult(data);
    } catch (err) {
      setError("Something broke on our end. Try again in a minute.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.participant.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }

  if (result) {
    const shareImageUrl = `/api/share-image?name=${encodeURIComponent(result.participant.firstName)}&ref=${encodeURIComponent(result.participant.referralCode)}`;
    return (
      <div>
        <h2 className="text-h2">
          {result.alreadyRegistered ? "You're already in." : "Bet placed."}
        </h2>
        <p className="lead" style={{ marginTop: 12 }}>
          {result.alreadyRegistered
            ? "Same email, already on the list. I'll send your magic link on Sunday 22 June."
            : "I'll send your magic link to your inbox on Sunday 22 June. The tracker opens that morning."}
        </p>

        <div style={{ marginTop: 28 }}>
          <h3 className="text-h3">Your sharing image.</h3>
          <p className="text-body" style={{ marginTop: 8 }}>
            Save this to your camera roll and post it on Sunday 22 June when the bet kicks off. The QR code on it sends people to your referral link. Three chips per person who registers through you.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shareImageUrl}
            alt={`${result.participant.firstName}'s 100 Minute Bet share card`}
            style={{
              marginTop: 16,
              width: "100%",
              maxWidth: 480,
              height: "auto",
              border: "3px solid var(--ink)",
              borderRadius: 12,
              display: "block",
            }}
          />
          <a
            className="btn"
            href={shareImageUrl}
            download={`100-minute-bet-${result.participant.firstName}.png`}
            style={{ marginTop: 16 }}
          >
            Download the image →
          </a>
        </div>

        <div style={{ marginTop: 28 }}>
          <h3 className="text-h3">Your referral link.</h3>
          <p className="text-body" style={{ marginTop: 8 }}>
            I'll email you this too. Anyone who registers through it banks you three chips.
          </p>
          <div
            style={{
              marginTop: 12,
              padding: "12px 14px",
              border: "3px solid var(--ink)",
              borderRadius: 12,
              background: "#fff",
              fontWeight: 500,
              wordBreak: "break-all",
            }}
          >
            {result.participant.referralLink || "(generating, refresh in a moment)"}
          </div>
          <button
            type="button"
            className="btn"
            onClick={copyLink}
            style={{ marginTop: 14 }}
            disabled={!result.participant.referralLink}
          >
            {copied ? "Copied." : "Copy link →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          First name
        </span>
        <input
          className="input"
          type="text"
          autoComplete="given-name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ marginTop: 6 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Last name
        </span>
        <input
          className="input"
          type="text"
          autoComplete="family-name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{ marginTop: 6 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "0.12em", textTransform: "uppercase" }}>
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
        <span className="text-small" style={{ display: "block", marginTop: 6, opacity: 0.75 }}>
          Use the inbox you actually read. The magic link to the tracker goes here on 22 June.
        </span>
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
        {submitting ? "Placing your bet..." : "Take the bet →"}
      </button>

      <p className="text-small" style={{ marginTop: 14, opacity: 0.8 }}>
        By taking the bet you agree to receive emails from Falling Forwards Ltd about the bet and the 100 Reps Club. Unsubscribe whenever you want.
      </p>
    </form>
  );
}
