import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    // First, try to find the user by clerkUserId
    let loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    // If user exists, return it
    if (loggedInUser) {
      return loggedInUser;
    }

    // If user doesn't exist, try to find by email (in case of duplicate)
    const email = user.emailAddresses[0]?.emailAddress;
    if (email) {
      loggedInUser = await db.user.findUnique({
        where: {
          email: email,
        },
      });

      // If user exists by email, update the clerkUserId and return
      if (loggedInUser) {
        const updatedUser = await db.user.update({
          where: {
            email: email,
          },
          data: {
            clerkUserId: user.id,
          },
        });
        return updatedUser;
      }
    }

    // If user doesn't exist at all, create a new one
    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: email,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error.message);
    
    // Handle unique constraint error specifically
    if (error.code === 'P2002') {
      // Unique constraint failed - this likely means another request already created the user
      // Let's try to find the user again
      try {
        const email = user.emailAddresses[0]?.emailAddress;
        if (email) {
          // Try to find the existing user by email
          const existingUser = await db.user.findUnique({
            where: {
              email: email,
            },
          });
          
          if (existingUser) {
            // Check if clerkUserId needs to be updated
            if (!existingUser.clerkUserId) {
              const updatedUser = await db.user.update({
                where: {
                  email: email,
                },
                data: {
                  clerkUserId: user.id,
                },
              });
              return updatedUser;
            }
            return existingUser;
          }
        }
      } catch (updateError) {
        console.error("Error updating existing user:", updateError.message);
      }
    }
    
    // If all else fails, return null
    return null;
  }
};