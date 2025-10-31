"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth"; // Import our new auth utility

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateCoverLetter({
  companyName,
  jobTitle,
  jobDescription,
  additionalInfo,
}) {
  // Use our new authentication utility
  const { user, userId } = await requireAuth();

  // Create prompt for AI
  const prompt = `
    As an expert career advisor and cover letter writer, create a compelling cover letter for a ${user.industry} professional with ${user.experience} years of experience.
    
    Applicant Information:
    Name: ${user.name}
    Industry: ${user.industry}
    Experience: ${user.experience} years
    Bio: ${user.bio || "Not provided"}
    Skills: ${user.skills || "Not provided"}
    
    Job Details:
    Company: ${companyName}
    Position: ${jobTitle}
    Job Description: ${jobDescription}
    Additional Information: ${additionalInfo || "None provided"}
    
    Requirements:
    1. Address the hiring manager professionally
    2. Highlight relevant skills and experiences that match the job description
    3. Show enthusiasm for the company and position
    4. Include a strong opening that captures attention
    5. Provide specific examples of achievements
    6. Conclude with a call to action for an interview
    7. Keep it concise (3-4 paragraphs)
    8. Use a professional tone
    9. Do not include any markdown or formatting
    10. End with a professional closing (e.g., "Sincerely," followed by the applicant's name)
    
    Format the response as plain text without any additional explanations or notes.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const coverLetterContent = response.text().trim();

    // Save to database
    const coverLetter = await db.coverLetter.create({
      data: {
        userId: user.id,
        companyName,
        jobTitle,
        jobDescription,
        content: coverLetterContent,
      },
    });

    revalidatePath("/ai-cover-letter");
    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter");
  }
}

export async function getCoverLetters() {
  // Use our new authentication utility
  const { user, userId } = await requireAuth();

  try {
    const coverLetters = await db.coverLetter.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return coverLetters;
  } catch (error) {
    console.error("Error getting cover letters:", error);
    throw new Error("Failed to get cover letters");
  }
}

export async function getCoverLetter(id) {
  // Use our new authentication utility
  const { user, userId } = await requireAuth();

  try {
    const coverLetter = await db.coverLetter.findUnique({
      where: {
        id,
        userId: user.id, // Ensure user can only access their own cover letters
      },
    });

    if (!coverLetter) {
      throw new Error("Cover letter not found");
    }

    return coverLetter;
  } catch (error) {
    console.error("Error getting cover letter:", error);
    throw new Error("Failed to get cover letter");
  }
}

export async function updateCoverLetter(id, data) {
  // Use our new authentication utility
  const { user, userId } = await requireAuth();

  try {
    // Ensure user can only update their own cover letters
    const updatedCoverLetter = await db.coverLetter.update({
      where: {
        id,
        userId: user.id,
      },
      data,
    });

    revalidatePath(`/ai-cover-letter/${id}`);
    return updatedCoverLetter;
  } catch (error) {
    console.error("Error updating cover letter:", error);
    throw new Error("Failed to update cover letter");
  }
}

export async function deleteCoverLetter(id) {
  // Use our new authentication utility
  const { user, userId } = await requireAuth();

  try {
    // Ensure user can only delete their own cover letters
    await db.coverLetter.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    revalidatePath("/ai-cover-letter");
  } catch (error) {
    console.error("Error deleting cover letter:", error);
    throw new Error("Failed to delete cover letter");
  }
}