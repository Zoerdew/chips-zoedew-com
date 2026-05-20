import Image from "next/image";
import Link from "next/link";

type PortalHeaderProps = {
  firstName: string;
  chipBalance: number;
};

// Server component. Chip balance passed in from the page's data fetch.
export function PortalHeader({ firstName, chipBalance }: PortalHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Image
          src="/icons/poker-chip.png"
          alt=""
          width={56}
          height={56}
          style={{ display: "block" }}
        />
        <div>
          <span
            style={{
              display: "block",
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Chips banked
          </span>
          <span
            style={{
              display: "block",
              fontWeight: 800,
              fontSize: 32,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {chipBalance}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 500, fontSize: 15 }}>{firstName}</span>
        <Link
          href="/portal/how-it-works"
          style={{
            fontWeight: 800,
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            background: "var(--yellow)",
            color: "var(--ink)",
            border: "3px solid var(--ink)",
            borderRadius: 999,
            padding: "8px 14px",
            textDecoration: "none",
          }}
        >
          How it works
        </Link>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            style={{
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "var(--paper)",
              color: "var(--ink)",
              border: "3px solid var(--ink)",
              borderRadius: 999,
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
