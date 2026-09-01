const { z } = require("zod");

// 🔐 Login validation
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// 📝 Signup validation
const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["doctor", "patient"], { errorMap: () => ({ message: "Role must be doctor or patient" }) }),
});

module.exports = { loginSchema, signupSchema };