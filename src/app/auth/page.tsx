"use client";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginContent() {
  const [showSignIn, setShowSignIn] = useState(true);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }
  if (session && session.user) {
    if (session.user.role === "ADMIN") {
      router.replace(redirect || "/admin");
    } else {
      router.replace(redirect || "/dashboard");
    }
    return null;
  }

  return (
    <main
      className="min-h-svh flex items-center justify-center"
      //   style={{
      //     backgroundImage: "url('/images/hero-bg.png')",
      //     backgroundSize: "cover",
      //     backgroundPosition: "center",
      //     backgroundRepeat: "no-repeat",
      //   }}
    >
      {showSignIn ? (
        <SignInForm
          onSwitchToSignUp={() => setShowSignIn(false)}
          redirect={redirect || "/dashboard"}
        />
      ) : (
        <SignUpForm
          onSwitchToSignIn={() => setShowSignIn(true)}
          redirect={redirect || "/dashboard"}
        />
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader className="animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
