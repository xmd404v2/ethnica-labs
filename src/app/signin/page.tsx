import { MainLayout } from "@/components/layout/main-layout";
import { SignInForm } from "@/components/auth/sign-in-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Ethnica",
  description: "Sign in to your Ethnica account to access personalized recommendations and reviews.",
};

export default function SignInPage() {
  return (
    <MainLayout>
      <div className="container max-w-md py-12">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue your journey with Ethnica
            </p>
          </div>
          
          <SignInForm />
        </div>
      </div>
    </MainLayout>
  );
} 