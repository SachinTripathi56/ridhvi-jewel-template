import { SignUp } from "@clerk/clerk-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function RegisterPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-4xl mb-3">Create your account</h1>
        <p className="text-sm text-muted-foreground mb-10">Join Parvior and discover hand-finished silver jewellery.</p>
        <div className="flex justify-center">
          <SignUp
            routing="hash"
            signInUrl="/login"
            fallbackRedirectUrl="/account/profile"
            forceRedirectUrl="/account/profile"
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default RegisterPage;
