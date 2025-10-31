import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Ensures that a user is authenticated and returns the user's database record
 * @returns {Promise<{user: Object, userId: string}>} The authenticated user's database record and clerk user ID
 * @throws {Error} If the user is not authenticated or not found in the database
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Authentication required");
  }

  // Find the user in our database
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  return { user, userId };
}

/**
 * Checks if a user is authenticated without throwing an error
 * @returns {Promise<{user: Object|null, userId: string|null}>} The authenticated user's database record and clerk user ID, or null if not authenticated
 */
export async function checkAuth() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { user: null, userId: null };
    }

    // Find the user in our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    return { user, userId };
  } catch (error) {
    console.error("Error checking authentication:", error);
    return { user: null, userId: null };
  }
}