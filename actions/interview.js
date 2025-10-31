"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth"; // Import our new auth utility

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function generateAssessment({ topic, difficulty, questionCount }) {
  // Use our new authentication utility
  const { user, userId } = await requireAuth();

  // Create prompt for AI
  const prompt = `
    As an expert interviewer and career advisor, generate a technical assessment for a ${user.industry} professional with ${user.experience} years of experience.
    
    Assessment Details:
    Topic: ${topic}
    Difficulty: ${difficulty}
    Number of Questions: ${questionCount}
    
    Requirements:
    1. Generate exactly ${questionCount} multiple choice questions
    2. Include a mix of question types (technical, behavioral, situational)
    3. Tailor questions to ${difficulty} difficulty level
    4. Focus on ${topic} within the context of ${user.industry}
    5. For each question, provide:
       - The question text
       - Four answer options (A, B, C, D)
       - The correct answer (one of A, B, C, or D)
       - An explanation for the correct answer
       - Difficulty rating (1-5)
       - Estimated time to answer (in minutes)
       - Key skills being assessed
    6. Format the response as JSON with the following structure:
       {
         "questions": [
           {
             "question": "Question text",
             "options": ["Option A", "Option B", "Option C", "Option D"],
             "correctAnswer": "A", // or B, C, D
             "explanation": "Explanation of why the correct answer is right",
             "difficulty": 1-5,
             "timeToAnswer": "minutes",
             "skills": ["skill1", "skill2"]
           }
         ]
       }
    7. Do not include any additional text, explanations, or markdown formatting
    8. Make sure each question has exactly one correct answer
    9. Ensure the options are plausible but only one is correct
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const assessmentContent = response.text().trim();

    // Parse the JSON response
    let parsedContent;
    try {
      // Remove any markdown code block formatting if present
      const cleanedContent = assessmentContent
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedContent = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      throw new Error("Failed to parse assessment content");
    }

    // Save to database
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        // Set initial quizScore to 0 since the assessment hasn't been completed yet
        quizScore: 0,
        // Set the category based on the topic
        category: topic,
        questions: parsedContent.questions, // Store questions as JSON array
      },
    });

    revalidatePath("/interview");
    return assessment;
  } catch (error) {
    console.error("Error generating assessment:", error);
    throw new Error("Failed to generate assessment");
  }
}

export async function getAssessments() {
  // Use our new authentication utility
  const { user, userId } = await requireAuth();

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error getting assessments:", error);
    throw new Error("Failed to get assessments");
  }
}

export async function getAssessment(id) {
  // Use our new authentication utility
  const { user, userId } = await requireAuth();

  try {
    const assessment = await db.assessment.findUnique({
      where: {
        id,
        userId: user.id, // Ensure user can only access their own assessments
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    return assessment;
  } catch (error) {
    console.error("Error getting assessment:", error);
    throw new Error("Failed to get assessment");
  }
}

export async function submitAssessmentAnswers(assessmentId, answers) {
  // Use our new authentication utility
  const { user, userId } = await requireAuth();

  try {
    // First, get the assessment to ensure it belongs to the user
    const assessment = await db.assessment.findUnique({
      where: {
        id: assessmentId,
        userId: user.id,
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    // Calculate score based on answers
    let correctAnswers = 0;
    const totalQuestions = assessment.questions.length;

    // Calculate actual score based on correct answers
    for (let i = 0; i < totalQuestions; i++) {
      if (answers[i] === assessment.questions[i].correctAnswer) {
        correctAnswers++;
      }
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Generate improvement tip based on performance
    let improvementTip = "";
    if (score < 50) {
      improvementTip = "Focus on reviewing fundamental concepts in this area. Consider taking additional practice assessments.";
    } else if (score < 75) {
      improvementTip = "Good effort! Review the questions you missed and practice similar problems.";
    } else {
      improvementTip = "Excellent work! Continue practicing to maintain your skills.";
    }

    // Format questions with user answers for display in results
    const questionsWithAnswers = assessment.questions.map((question, index) => {
      const userAnswerLabel = answers[index];
      const userAnswerIndex = userAnswerLabel ? userAnswerLabel.charCodeAt(0) - 65 : -1; // Convert A,B,C,D to 0,1,2,3
      const userAnswerText = userAnswerIndex >= 0 && userAnswerIndex < question.options.length 
        ? question.options[userAnswerIndex] 
        : "No answer provided";
      
      const correctAnswerIndex = question.correctAnswer.charCodeAt(0) - 65; // Convert A,B,C,D to 0,1,2,3
      const correctAnswerText = question.options[correctAnswerIndex];
      
      return {
        ...question,
        userAnswer: userAnswerText,
        correctAnswerText: correctAnswerText, // Store the actual text of the correct answer
        isCorrect: answers[index] === question.correctAnswer,
        explanation: question.explanation || `This question tests your knowledge of ${question.skills?.join(", ") || "relevant skills"}.`
      };
    });

    // Save the result
    const result = await db.assessment.update({
      where: {
        id: assessmentId,
        userId: user.id,
      },
      data: {
        quizScore: score,
        improvementTip,
        questions: questionsWithAnswers, // Update questions with user answers
      },
    });

    revalidatePath("/interview");
    return result;
  } catch (error) {
    console.error("Error submitting assessment:", error);
    throw new Error("Failed to submit assessment");
  }
}

export async function deleteAssessment(assessmentId) {
  // Use our new authentication utility
  const { user, userId } = await requireAuth();

  try {
    // First, get the assessment to ensure it belongs to the user
    const assessment = await db.assessment.findUnique({
      where: {
        id: assessmentId,
        userId: user.id,
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    // Delete the assessment
    await db.assessment.delete({
      where: {
        id: assessmentId,
      },
    });

    revalidatePath("/interview");
    return { success: true };
  } catch (error) {
    console.error("Error deleting assessment:", error);
    throw new Error("Failed to delete assessment");
  }
}
