/**
 * Utility functions for user data handling
 */

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
  };
}

/**
 * Get the display name for a user, with fallbacks
 * @param user - The user object
 * @returns The display name to show in the UI
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return "User";
  
  return (
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User"
  );
}

/**
 * Get the user's first name (for more casual greetings)
 * @param user - The user object
 * @returns The first name or fallback
 */
export function getUserFirstName(user: User | null): string {
  if (!user) return "there";
  
  const fullName = user.user_metadata?.name || user.user_metadata?.full_name;
  if (fullName) {
    return fullName.split(" ")[0];
  }
  
  return user.email?.split("@")[0] || "there";
}
