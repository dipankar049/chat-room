export function validateUserInput({ email, username, password }) {
  const errors = { message: "" };

  if (!email) {
    errors.message = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.message = "Invalid email format";
  }

  if (!username) {
    errors.message = "Username is required";
  } else if (username.length < 3) {
    errors.message = "Username must be at least 3 characters";
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.message = "Username can only contain letters, numbers, and underscores";
  }

  if (!password) {
    errors.message = "Password is required";
  } else if (password.length < 6) {
    errors.message = "Password must be at least 6 characters";
  }

  return errors;
}
