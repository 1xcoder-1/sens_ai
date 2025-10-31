"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function getAIResponse({ messages }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Format the conversation history for the AI
    const formattedHistory = messages.map(msg => 
      `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`
    ).join('\n');
    
    const prompt = `
      You are an expert career advisor and mentor. Respond to the user's latest question based on the conversation history.
      
      Conversation History:
      ${formattedHistory}
      
      Provide helpful, professional, and concise advice about career development, job searching, resume building, interview preparation, or skill development.
      
      Guidelines:
      1. Be supportive and encouraging
      2. Provide specific, actionable advice
      3. Keep responses concise but informative
      4. Use a friendly professional tone
      5. If asked about topics outside your expertise, politely redirect to career-related questions
      6. Do not hallucinate information or make up facts
      
      Respond directly to the user's last message:
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const aiResponse = response.text().trim();
    
    return aiResponse;
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw new Error("Failed to get response from AI");
  }
}