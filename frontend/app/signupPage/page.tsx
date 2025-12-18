
"use client";

import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Visibility,
  VisibilityOff,
  RestaurantMenu,
  ArrowForward,
  CheckCircle,
  Error as ErrorIcon,
  ArrowBack,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type SignupResponse = {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: "customer" | "restaurant";
    profileImage?: {
      asset?: {
        _ref: string;
        _type: "reference";
      };
      _type: "image";
    };
  };
};

type ApiError = {
  success: boolean;
  message: string;
  error?: string;
};

type SignupApiResponse = SignupResponse | ApiError;

// Type Guard
function isSignupResponse(data: SignupApiResponse): data is SignupResponse {
  return "success" in data && data.success === true && "user" in data;
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"customer" | "restaurant">("customer");
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantCategory, setRestaurantCategory] = useState("");
  const [restaurantDescription, setRestaurantDescription] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!name.trim()) errors.push("Name is required");
    if (!email.trim()) errors.push("Email is required");
    if (!password.trim()) errors.push("Password is required");
    if (!confirmPassword.trim()) errors.push("Please confirm your password");
    
    if (email && !isValidEmail(email)) errors.push("Please enter a valid email address");
    if (password && password.length < 6) errors.push("Password must be at least 6 characters");
    if (password && confirmPassword && password !== confirmPassword) errors.push("Passwords do not match");

    return errors;
  };

  const handleSignup = async () => {
    setError("");
    setSuccess("");
    setDebugInfo("");

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }

    setLoading(true);
    console.log("🚀 Starting signup process...");
    console.log("📝 Form data:", { name, email, password, role });

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          role,
          restaurantName: role === "restaurant" ? restaurantName.trim() : undefined,
          restaurantCategory: role === "restaurant" ? restaurantCategory.trim() : undefined,
          restaurantDescription: role === "restaurant" ? restaurantDescription.trim() : undefined,
        }),
      });

      const responseText = await response.text();
      console.log("📥 Response status:", response.status);
      console.log("📥 Response text:", responseText);

      let data: SignupApiResponse;
      try {
        data = JSON.parse(responseText);
        console.log("📊 Parsed response:", data);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON:", parseError);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        const errorMessage = "message" in data ? data.message : "Signup failed";
        console.log("❌ Signup failed:", errorMessage);

        setError(errorMessage);
        setDebugInfo(`
          Status: ${response.status}
          Error: ${errorMessage}
          Timestamp: ${new Date().toISOString()}
        `);
        setLoading(false);
        return;
      }

      if (role === "customer") {
        if (!isSignupResponse(data) || !data.user) {
          throw new Error("Invalid response data: missing user");
        }

        console.log("✅ Signup successful for user:", data.user.name);

        const userData = {
          ...data.user,
          loggedInAt: new Date().toISOString(),
        };

        localStorage.setItem("currentUser", JSON.stringify(userData));

        const successMessage = `Welcome ${data.user.name}! Your ${data.user.role} account has been created successfully.`;
        setSuccess(successMessage);

        setTimeout(() => {
          router.push("/loginPage");
        }, 1000);
      } else {
        setSuccess("Your signup request has been sent to the admin. You will be able to login after approval.");
        setLoading(false);
      }

    } catch (err: unknown) {
      console.error("🔥 Signup error:", err);
      
      let errorMessage = "Something went wrong. Please try again.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setDebugInfo(`
        Error Type: ${err instanceof Error ? err.name : typeof err}
        Message: ${err instanceof Error ? err.message : String(err)}
        Timestamp: ${new Date().toISOString()}
      `);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  const clearForm = () => {
    console.log("🧹 Clearing form...");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("customer");
    setRestaurantName("");
    setRestaurantCategory("");
    setRestaurantDescription("");
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setNameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setDebugInfo("");
  };

  // Field validation
  const nameError = nameTouched && !name.trim();
  const emailError = emailTouched && email && !isValidEmail(email);
  const passwordError = passwordTouched && password && password.length < 6;
  const confirmPasswordError = confirmPasswordTouched && confirmPassword && password !== confirmPassword;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0a0a0a",
        backgroundImage: `radial-gradient(circle at 50% 0%, rgba(78, 205, 196, 0.15) 0%, transparent 50%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, md: 4 },
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={() => router.push("/loginPage")}
        sx={{
          position: "absolute",
          left: 16,
          top: 16,
          color: "#4ecdc4",
          bgcolor: "rgba(26, 26, 26, 0.5)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(78, 205, 196, 0.2)",
          "&:hover": {
            bgcolor: "rgba(78, 205, 196, 0.1)",
          },
        }}
      >
        <ArrowBack />
      </IconButton>

      {/* Success Message */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="success"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{
            bgcolor: "rgba(46, 204, 113, 0.1)",
            color: "#2ecc71",
            border: "1px solid rgba(46, 204, 113, 0.2)",
            borderRadius: 2,
          }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Error Message */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity="error"
          icon={<ErrorIcon fontSize="inherit" />}
          sx={{
            bgcolor: "rgba(231, 76, 60, 0.1)",
            color: "#e74c3c",
            border: "1px solid rgba(231, 76, 60, 0.2)",
            borderRadius: 2,
            maxWidth: 400,
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
              {error}
            </Typography>
            {process.env.NODE_ENV === "development" && debugInfo && (
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1, color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}
              >
                Debug Info: {debugInfo}
              </Typography>
            )}
          </Box>
        </Alert>
      </Snackbar>

      {/* Main Form */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          bgcolor: "rgba(26, 26, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          overflow: "hidden",
          position: "relative",
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(78, 205, 196, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: "rgba(78, 205, 196, 0.1)",
            p: { xs: 3, md: 4 },
            textAlign: "center",
            borderBottom: "1px solid rgba(78, 205, 196, 0.2)",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <RestaurantMenu
              sx={{
                fontSize: 48,
                color: "#4ecdc4",
                filter: "drop-shadow(0 4px 8px rgba(78, 205, 196, 0.3))",
                mb: 2,
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(45deg, #4ecdc4, #44b7d6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 1,
                fontSize: { xs: "2rem", md: "2.5rem" },
              }}
            >
              Sign Up
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.95rem",
              }}
            >
              Create your new account
            </Typography>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Name Field */}
            <TextField
              label="Full Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameTouched(true);
              }}
              onBlur={() => setNameTouched(true)}
              onKeyPress={handleKeyPress}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!nameError}
              helperText={nameError ? "Name is required" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: nameError ? "#e74c3c" : "rgba(78, 205, 196, 0.7)" }} />
                  </InputAdornment>
                ),
                sx: {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: nameError ? "rgba(231, 76, 60, 0.5)" : "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: nameError ? "#e74c3c" : "rgba(78, 205, 196, 0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: nameError ? "#e74c3c" : "#4ecdc4",
                    borderWidth: "2px",
                  },
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 2,
                },
                inputProps: {
                  style: { color: "white" },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: nameError ? "#e74c3c" : "rgba(255, 255, 255, 0.5)",
                  "&.Mui-focused": {
                    color: nameError ? "#e74c3c" : "#4ecdc4",
                  },
                },
              }}
            />

            {/* Email Field */}
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailTouched(true);
              }}
              onBlur={() => setEmailTouched(true)}
              onKeyPress={handleKeyPress}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!emailError}
              helperText={emailError ? "Please enter a valid email address" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: emailError ? "#e74c3c" : "rgba(78, 205, 196, 0.7)" }} />
                  </InputAdornment>
                ),
                sx: {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: emailError ? "rgba(231, 76, 60, 0.5)" : "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: emailError ? "#e74c3c" : "rgba(78, 205, 196, 0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: emailError ? "#e74c3c" : "#4ecdc4",
                    borderWidth: "2px",
                  },
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 2,
                },
                inputProps: {
                  style: { color: "white" },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: emailError ? "#e74c3c" : "rgba(255, 255, 255, 0.5)",
                  "&.Mui-focused": {
                    color: emailError ? "#e74c3c" : "#4ecdc4",
                  },
                },
              }}
            />

            {/* Password Field */}
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordTouched(true);
              }}
              onBlur={() => setPasswordTouched(true)}
              onKeyPress={handleKeyPress}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!passwordError}
              helperText={passwordError ? "Password must be at least 6 characters" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: passwordError ? "#e74c3c" : "rgba(78, 205, 196, 0.7)" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: passwordError ? "#e74c3c" : "rgba(255, 255, 255, 0.5)" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: passwordError ? "rgba(231, 76, 60, 0.5)" : "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: passwordError ? "#e74c3c" : "rgba(78, 205, 196, 0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: passwordError ? "#e74c3c" : "#4ecdc4",
                    borderWidth: "2px",
                  },
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 2,
                },
                inputProps: {
                  style: { color: "white" },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: passwordError ? "#e74c3c" : "rgba(255, 255, 255, 0.5)",
                  "&.Mui-focused": {
                    color: passwordError ? "#e74c3c" : "#4ecdc4",
                  },
                },
              }}
            />

            {/* Confirm Password Field */}
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordTouched(true);
              }}
              onBlur={() => setConfirmPasswordTouched(true)}
              onKeyPress={handleKeyPress}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError ? "Passwords do not match" : ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: confirmPasswordError ? "#e74c3c" : "rgba(78, 205, 196, 0.7)" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: confirmPasswordError ? "#e74c3c" : "rgba(255, 255, 255, 0.5)" }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: confirmPasswordError ? "rgba(231, 76, 60, 0.5)" : "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: confirmPasswordError ? "#e74c3c" : "rgba(78, 205, 196, 0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: confirmPasswordError ? "#e74c3c" : "#4ecdc4",
                    borderWidth: "2px",
                  },
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 2,
                },
                inputProps: {
                  style: { color: "white" },
                },
              }}
              InputLabelProps={{
                sx: {
                  color: confirmPasswordError ? "#e74c3c" : "rgba(255, 255, 255, 0.5)",
                  "&.Mui-focused": {
                    color: confirmPasswordError ? "#e74c3c" : "#4ecdc4",
                  },
                },
              }}
            />

            {/* Role Selection */}
            <FormControl fullWidth error={false}>
              <InputLabel 
                sx={{ 
                  color: "rgba(255, 255, 255, 0.5)",
                  "&.Mui-focused": { color: "#4ecdc4" },
                  "&.MuiInputLabel-shrink": { color: "#4ecdc4" }
                }}
              >
                Account Type
              </InputLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as "customer" | "restaurant")}
                disabled={loading}
                label="Account Type"
                sx={{
                  color: "white",
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(78, 205, 196, 0.3)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4ecdc4",
                    borderWidth: "2px",
                  },
                  "& .MuiSelect-icon": {
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#1a1a1a",
                      color: "white",
                      "& .MuiMenuItem-root": {
                        "&:hover": {
                          bgcolor: "rgba(78, 205, 196, 0.1)",
                        },
                        "&.Mui-selected": {
                          bgcolor: "rgba(78, 205, 196, 0.2)",
                        },
                      },
                    },
                  },
                }}
              >
                <MenuItem value="customer">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 20, color: "#4ecdc4" }} />
                    Customer
                  </Box>
                </MenuItem>
                <MenuItem value="restaurant">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BusinessIcon sx={{ fontSize: 20, color: "#4ecdc4" }} />
                    Restaurant
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Restaurant extra fields when role is restaurant */}
            {role === "restaurant" && (
              <>
                <TextField
                  label="Restaurant Name"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon sx={{ color: "rgba(78, 205, 196, 0.7)" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(78, 205, 196, 0.3)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#4ecdc4",
                        borderWidth: "2px",
                      },
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                      borderRadius: 2,
                    },
                    inputProps: {
                      style: { color: "white" },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      color: "rgba(255, 255, 255, 0.5)",
                      "&.Mui-focused": {
                        color: "#4ecdc4",
                      },
                    },
                  }}
                />

                <TextField
                  select
                  label="Restaurant Category"
                  value={restaurantCategory}
                  onChange={(e) => setRestaurantCategory(e.target.value)}
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RestaurantMenu sx={{ color: "rgba(78, 205, 196, 0.7)" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(78, 205, 196, 0.3)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#4ecdc4",
                        borderWidth: "2px",
                      },
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                      borderRadius: 2,
                    },
                    inputProps: {
                      style: { color: "white" },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      color: "rgba(255, 255, 255, 0.5)",
                      "&.Mui-focused": {
                        color: "#4ecdc4",
                      },
                    },
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          bgcolor: "#050814",
                          color: "white",
                          borderRadius: 2,
                          border: "1px solid rgba(78,205,196,0.3)",
                          "& .MuiMenuItem-root.Mui-selected": {
                            bgcolor: "rgba(78,205,196,0.2)",
                          },
                          "& .MuiMenuItem-root:hover": {
                            bgcolor: "rgba(78,205,196,0.15)",
                          },
                        },
                      },
                    },
                  }}
                >
                  {["Fast Food", "Italian", "Asian", "Cafe", "Other"].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Restaurant Description"
                  value={restaurantDescription}
                  onChange={(e) => setRestaurantDescription(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  variant="outlined"
                  disabled={loading}
                  InputProps={{
                    sx: {
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(78, 205, 196, 0.3)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#4ecdc4",
                        borderWidth: "2px",
                      },
                      bgcolor: "rgba(255, 255, 255, 0.03)",
                      borderRadius: 2,
                    },
                    inputProps: {
                      style: { color: "white" },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      color: "rgba(255, 255, 255, 0.5)",
                      "&.Mui-focused": {
                        color: "#4ecdc4",
                      },
                    },
                  }}
                />
              </>
            )}

            {/* Signup Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                variant="contained"
                onClick={handleSignup}
                disabled={
                  loading ||
                  !name ||
                  !email ||
                  !password ||
                  !confirmPassword ||
                  !!nameError ||
                  !!emailError ||
                  !!passwordError ||
                  !!confirmPasswordError
                }
                endIcon={<ArrowForward />}
                sx={{
                  height: 56,
                  bgcolor: "#4ecdc4",
                  color: "#000",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  borderRadius: 2,
                  mt: 2,
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "#3db8af",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(78, 205, 196, 0.4)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "rgba(78, 205, 196, 0.3)",
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{
                        color: "#000",
                        mr: 2,
                      }}
                    />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </motion.div>


            <Box sx={{ textAlign: "center", mt: 2 }}>
  <Typography
    variant="body2"
    sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}
  >
    You already have an account?{" "}
    <Typography
      component="span"
      onClick={() => router.push("/loginPage")}
      sx={{
        color: "#4ecdc4",
        cursor: "pointer",
        fontWeight: 600,
        "&:hover": {
          textDecoration: "underline",
        },
      }}
    >
      Sign in
    </Typography>
  </Typography>
</Box>

          </Box>

        </Box>
      </Paper>
    </Box>
  );
}

