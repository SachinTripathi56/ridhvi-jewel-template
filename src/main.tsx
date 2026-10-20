import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "sonner";

import App from "./App";
import { AuthProvider } from "./lib/auth-context";
import { CartProvider } from "./lib/cart";
import { SplashScreen } from "./components/SplashScreen";
import "./styles.css";

const CLERK_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY ?? "";

const queryClient = new QueryClient();

function Tree() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          <AuthProvider>
            <SplashScreen />
            <App />
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    {CLERK_PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <Tree />
      </ClerkProvider>
    ) : (
      <Tree />
    )}
  </React.StrictMode>,
);
