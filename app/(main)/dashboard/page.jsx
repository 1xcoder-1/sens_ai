import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { getResume } from "@/actions/resume";
import { getCoverLetters } from "@/actions/cover-letter";
import { getAssessments } from "@/actions/interview";

export default async function DashboardPage() {
  let isOnboarded = false;
  
  try {
    const onboardingStatus = await getUserOnboardingStatus();
    isOnboarded = onboardingStatus.isOnboarded;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    // If there's an error checking onboarding status, redirect to onboarding
    isOnboarded = false;
  }

  // If not onboarded, redirect to onboarding page
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  try {
    const insights = await getIndustryInsights();
    const resume = await getResume();
    const coverLetters = await getCoverLetters();
    const assessments = await getAssessments();

    return (
      <div className="container mx-auto px-4 py-6">
        <DashboardView 
          insights={insights} 
          resume={resume}
          coverLetters={coverLetters}
          assessments={assessments}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    // If there's an error loading dashboard data, redirect to onboarding
    redirect("/onboarding");
  }
}