import { MainLayout } from "@/components/layout/main-layout";
import { ProfileSetupForm } from "@/components/profile/profile-setup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Profile | Ethnica",
  description: "Set up your profile to get personalized recommendations based on your demographics and preferences.",
};

export default function ProfileSetupPage() {
  return (
    <MainLayout>
      <div className="container max-w-2xl py-12">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Tell us about yourself to get personalized recommendations and connect with businesses that align with your values
            </p>
          </div>
          
          <ProfileSetupForm />
        </div>
      </div>
    </MainLayout>
  );
} 