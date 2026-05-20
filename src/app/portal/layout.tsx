export const metadata = {
  title: "Portal — The 100 Minute Bet",
  robots: { index: false, follow: false },
};

// The portal layout just sets the page background. Header and nav are rendered
// per-page (the login and verify routes don't want them).
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>{children}</div>
  );
}
