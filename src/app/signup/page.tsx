import { MainLayout } from "@/components/layout/main-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Ethnica",
  description: "Create an account on Ethnica to discover businesses that align with your values and demographics.",
};

export default function SignUpPage() {
  return (
    <MainLayout>
      <div className="container max-w-md py-12">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Join Ethnica</h1>
            <p className="text-muted-foreground">
              Create an account to discover businesses that align with your values
            </p>
          </div>
          
          <SignUpForm />
        </div>
      </div>
    </MainLayout>
  );
} 