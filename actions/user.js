"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Instead of throwing an error when user is not found, let's try to create or update
  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  // If user doesn't exist, we might need to handle this case differently
  if (!user) {
    // Try to find user by email
    const clerkUser = await currentUser();
    if (clerkUser && clerkUser.emailAddresses.length > 0) {
      const email = clerkUser.emailAddresses[0].emailAddress;
      user = await db.user.findUnique({
        where: { email: email },
      });
      
      // If found by email, update the clerkUserId
      if (user) {
        user = await db.user.update({
          where: { email: email },
          data: { clerkUserId: userId },
        });
      } else {
        // If still not found, create a new user
        // But first, let's check if another request already created it
        try {
          const name = `${clerkUser.firstName} ${clerkUser.lastName}`;
          user = await db.user.create({
            data: {
              clerkUserId: userId,
              name,
              imageUrl: clerkUser.imageUrl,
              email: email,
            },
          });
        } catch (createError) {
          // If creation fails due to unique constraint, fetch the existing user
          if (createError.code === 'P2002') {
            user = await db.user.findUnique({
              where: { email: email },
            });
            
            // If found, update clerkUserId if needed
            if (user && !user.clerkUserId) {
              user = await db.user.update({
                where: { email: email },
                data: { clerkUserId: userId },
              });
            }
          } else {
            throw createError;
          }
        }
        
        // If we just created the user, update with the profile data and return
        if (user) {
          user = await db.user.update({
            where: { id: user.id },
            data: {
              industry: data.industry,
              experience: data.experience,
              bio: data.bio,
              skills: data.skills,
            },
          });
          revalidatePath("/");
          return user;
        }
      }
    } else {
      throw new Error("User not found and unable to create new user - no email available");
    }
  }

  try {
    // First, generate AI insights outside of the transaction to avoid timeout issues
    let industryInsight = await db.industryInsight.findUnique({
      where: {
        industry: data.industry,
      },
    });

    // If industry doesn't exist, create it with AI-generated values
    if (!industryInsight) {
      try {
        const insights = await generateAIInsights(data.industry);
        
        // Create the industry insight outside of the main transaction
        industryInsight = await db.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      } catch (insightError) {
        console.error("Error generating industry insights:", insightError);
        // Continue without industry insights if generation fails
      }
    }

    // Now perform the user update
    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        industry: data.industry,
        experience: data.experience,
        bio: data.bio,
        skills: data.skills,
      },
    });

    revalidatePath("/");
    return updatedUser;
  } catch (error) {
    console.error("Error updating user and industry:", error);
    console.error("Error stack:", error.stack);
    console.error("Data being sent:", data);
    throw new Error("Failed to update profile: " + error.message);
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) {
    return { isOnboarded: false };
  }

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
      },
    });

    // If user doesn't exist in our database, they need to complete onboarding
    if (!user) {
      return { isOnboarded: false };
    }

    // If user exists but hasn't completed onboarding (no industry), they need to complete onboarding
    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    // If there's an error, assume user is not onboarded
    return { isOnboarded: false };
  }
}