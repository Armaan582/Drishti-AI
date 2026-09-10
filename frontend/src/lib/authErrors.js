export function authErrorMessage(error) {
  const message = error?.message?.toLowerCase() || "";
  if (message.includes("invalid login credentials"))
    return "Incorrect email or password. Please try again.";
  if (message.includes("email not confirmed"))
    return "Please verify your email address before signing in.";
  if (
    message.includes("already registered") ||
    message.includes("already been registered")
  )
    return "An account already exists for this email address.";
  if (message.includes("password should be at least"))
    return "Your password must contain at least 8 characters.";
  if (message.includes("network") || message.includes("fetch"))
    return "Unable to reach the service. Check your connection and try again.";
  return "Something went wrong. Please try again shortly.";
}
