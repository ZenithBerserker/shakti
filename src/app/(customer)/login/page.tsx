"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { toast } from "sonner";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function firebaseAuthHelpMessage(raw: string): string {
  if (/billing-not-enabled|BILLING_NOT_ENABLED/i.test(raw)) {
    return (
      "SMS phone sign-in requires upgrading this Firebase project from Spark to Blaze (pay-as-you-go). Firebase Console → project → Upgrade; attach a billing account. " +
      "Phone SMS is billed per message after free quotas — see https://firebase.google.com/pricing"
    );
  }
  if (/configuration-not-found|CONFIGURATION_NOT_FOUND/i.test(raw)) {
    return (
      "Firebase Phone Auth isn’t active for this site yet. In Firebase Console: open Authentication → Get started → Sign-in method → enable Phone; " +
      "Authentication → Settings → Authorized domains → add your Vercel URL (and localhost). In Google Cloud (same project): APIs → enable Identity Toolkit API. " +
      "Then confirm NEXT_PUBLIC_FIREBASE_* on Vercel matches Project settings → Your apps → Web, and redeploy."
    );
  }
  return raw;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);

  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const e164 = useMemo(() => {
    const trimmed = phoneDigits.replace(/\D/g, "");
    if (trimmed.length === 10) return `+91${trimmed}`;
    if (trimmed.startsWith("91") && trimmed.length === 12) return `+${trimmed}`;
    return "";
  }, [phoneDigits]);

  useEffect(() => {
    return () => {
      try {
        verifierRef.current?.clear?.();
      } catch {
        /* ignore */
      }
    };
  }, []);

  async function ensureVerifier() {
    const auth = getFirebaseAuth();
    if (!verifierRef.current) {
      verifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
    return verifierRef.current;
  }

  async function sendOtp() {
    setBusy(true);
    try {
      const auth = getFirebaseAuth();
      const verifier = await ensureVerifier();
      confirmationRef.current = await signInWithPhoneNumber(auth, e164, verifier);
      setStep("otp");
      toast.success("OTP sent");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Could not send OTP";
      toast.error(firebaseAuthHelpMessage(raw));
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    setBusy(true);
    try {
      const confirmation = confirmationRef.current;
      if (!confirmation) throw new Error("No OTP session");

      await confirmation.confirm(otp.trim());

      const auth = getFirebaseAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Missing ID token");

      const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Login failed");

      const profileComplete = Boolean(data.user?.profileComplete);

      toast.success("Signed in");
      router.replace(profileComplete ? nextPath : "/register");
      router.refresh();
    } catch (e) {
      const raw = e instanceof Error ? e.message : "OTP verification failed";
      toast.error(firebaseAuthHelpMessage(raw));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in with OTP</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your registered Indian mobile number. SMS OTP is delivered via Firebase Auth.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div id="recaptcha-container" />

          {step === "phone" ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile number</Label>
                <div className="flex gap-2">
                  <div className="flex h-9 w-16 items-center justify-center rounded-md border bg-muted text-sm font-semibold">
                    +91
                  </div>
                  <Input
                    id="phone"
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={phoneDigits}
                    onChange={(e) => setPhoneDigits(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter 10 digits without country code for Indian numbers.
                </p>
              </div>
              <Button
                className="w-full rounded-2xl"
                disabled={busy || e164.length < 13}
                onClick={() => void sendOtp()}
              >
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <Button
                className="w-full rounded-2xl"
                disabled={busy || otp.trim().length < 4}
                onClick={() => void verifyOtp()}
              >
                Verify & continue
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-2xl"
                disabled={busy}
                onClick={() => {
                  setStep("phone");
                  confirmationRef.current = null;
                  setOtp("");
                }}
              >
                Change number
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Need procurement advice?{" "}
        <Link className="underline" href="/catalog">
          Browse as guest
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted-foreground">
          Loading sign-in…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
