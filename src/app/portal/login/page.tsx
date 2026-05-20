import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Log in — The 100 Minute Bet",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="band band--pink" style={{ minHeight: "100vh" }}>
      <div className="band__inner band__inner--narrow">
        <div className="sticker sticker--tilt-left" style={{ marginTop: 24 }}>
          <span className="sticker__tab sticker__tab--pink">PORTAL LOGIN</span>
          <h1 className="text-h2">Get into the portal.</h1>
          <p className="text-body" style={{ marginTop: 14 }}>
            Enter the email you registered with. I&apos;ll send you a link
            that drops you straight in. No password.
          </p>
          <div style={{ marginTop: 18 }}>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
