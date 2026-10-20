import { useSearchParams } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function LoginPage() {
  const [sp] = useSearchParams();
  const to = sp.get("redirect") ?? "";

  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-4xl mb-3">Welcome back</h1>
        <p className="text-sm text-muted-foreground mb-10">Sign in to continue your jewellery journey.</p>
        <div className="flex justify-center">
          <SignIn
            routing="hash"
            signUpUrl="/register"
            fallbackRedirectUrl={to || "/"}
            forceRedirectUrl={to || "/"}
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default LoginPage;
