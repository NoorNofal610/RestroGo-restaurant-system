
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
  Snackbar
} from "@mui/material";
import { 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility, 
  VisibilityOff, 
  RestaurantMenu,
  Login as LoginIcon,
  ArrowForward,
  CheckCircle,
  Error as ErrorIcon
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowBack } from "@mui/icons-material";


type LoginResponse = {
  user: {
    _id: string;
    name?: string;
    email?: string;
    role?: "customer" | "restaurant";
    profileImage?: {
      asset?: { _ref: string; _type: "reference" };
      hotspot?: unknown;
      crop?: unknown;
      _type: "image";
    };
  };
};

type ApiError = {
  message: string;
};

type LoginApiResponse = LoginResponse | ApiError;



export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    setDebugInfo("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (loginAttempts >= 3) {
      setError("Too many failed attempts. Please try again later.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const responseText = await response.text();
      let data: LoginResponse | ApiError;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (!response.ok) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        const errorMessage = "message" in data ? data.message : "Login failed";
        const remainingAttempts = 3 - newAttempts;
        setError(`${errorMessage}${remainingAttempts > 0 ? ` (${remainingAttempts} attempts remaining)` : ""}.`);
        setDebugInfo(`Status: ${response.status}\nError: ${errorMessage}\nAttempts: ${newAttempts}/3\nTimestamp: ${new Date().toISOString()}`);
        setLoading(false);
        return;
      }

      if (!('user' in data) || !data.user) {
        throw new Error("Invalid response: missing user");
      }

      const userData = {
        ...data.user,
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem("currentUser", JSON.stringify(userData));

      setSuccess(`Welcome back, ${data.user.name}!`);
      setLoginAttempts(0);

      setTimeout(() => {
        if (data.user.email === "admin@gmail.com") {
          router.push("/admin");
        } else {
          router.push(data.user.role === "restaurant" ? "/restaurant-dashboard" : "/");
        }
      }, 1500);

    } catch (err: unknown) {
      let errorMessage = "Something went wrong. Please try again.";
      if (err instanceof Error) errorMessage = err.message;
      setError(errorMessage);
      setDebugInfo(`Error Type: ${err instanceof Error ? err.name : typeof err}\nMessage: ${err instanceof Error ? err.message : String(err)}\nTimestamp: ${new Date().toISOString()}`);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
    setShowPassword(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setDebugInfo("");
  };

  const emailError = emailTouched && email && !isValidEmail(email);
  const passwordError = passwordTouched && password && password.length < 6;

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


<IconButton
  onClick={() => router.push("/")}
  sx={{ position: "absolute", left: 16, top: 16, color: "#4ecdc4" }}
>
  <ArrowBack />
</IconButton>

      {/* Success Snackbar */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" icon={<CheckCircle />} sx={{ bgcolor: "rgba(46, 204, 113, 0.1)", color: "#2ecc71" }}>{success}</Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError("")} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" icon={<ErrorIcon />} sx={{ bgcolor: "rgba(231, 76, 60, 0.1)", color: "#e74c3c", maxWidth: 400 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{error}</Typography>
            {process.env.NODE_ENV === "development" && debugInfo && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.7)' }}>Debug Info: {debugInfo}</Typography>}
          </Box>
        </Alert>
      </Snackbar>

      {/* Paper Login Form */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          bgcolor: "rgba(26,26,26,0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <Box sx={{ bgcolor: "rgba(78, 205, 196, 0.1)", p: { xs: 3, md: 4 }, textAlign: "center", borderBottom: "1px solid rgba(78, 205, 196, 0.2)" }}>
          <RestaurantMenu sx={{ fontSize: 48, color: "#4ecdc4", mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: "bold", background: "linear-gradient(45deg, #4ecdc4, #44b7d6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 1 }}>Sign In</Typography>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem" }}>Access your account with email and password</Typography>
        </Box>

        {/* Form Content */}
        <Box sx={{ p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Email Field */}
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
            onBlur={() => setEmailTouched(true)}
            onKeyPress={handleKeyPress}
            fullWidth
            variant="outlined"
            disabled={loading}
            error={!!emailError}
            helperText={emailError ? "Please enter a valid email address" : ""}
            InputProps={{
              startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: emailError ? "#e74c3c" : "rgba(78,205,196,0.7)" }} /></InputAdornment>,
              sx: { color: "white", bgcolor: "rgba(255,255,255,0.03)", borderRadius: 2 },
              inputProps: { style: { color: "white" } },
            }}
          />

          {/* Password Field */}
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
            onBlur={() => setPasswordTouched(true)}
            onKeyPress={handleKeyPress}
            fullWidth
            variant="outlined"
            disabled={loading}
            error={!!passwordError}
            helperText={passwordError ? "Password must be at least 6 characters" : ""}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: passwordError ? "#e74c3c" : "rgba(78,205,196,0.7)" }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: passwordError ? "#e74c3c" : "rgba(255,255,255,0.5)" }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { color: "white", bgcolor: "rgba(255,255,255,0.03)", borderRadius: 2 },
              inputProps: { style: { color: "white" } },
            }}
          />

          {/* Login Button */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              variant="contained"
              onClick={handleLogin}
              disabled={loading || !email || !password || !!emailError || !!passwordError}
              startIcon={loading ? undefined : <LoginIcon />}
              endIcon={loading ? undefined : <ArrowForward />}
              sx={{ height: 56, bgcolor: "#4ecdc4", color: "#000", fontWeight: "bold", fontSize: "1rem", borderRadius: 2 }}
            >
              {loading ? <><CircularProgress size={24} sx={{ color: "#000", mr: 2 }} />Verifying...</> : "Sign In"}
            </Button>
          </motion.div>

          {/* Links */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setError("Password reset feature coming soon!"); }}>Forgot password?</a>
            </Typography>
            <Button size="small" onClick={clearForm} sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Clear Form</Button>
          </Box>

<Box sx={{ textAlign: "center", mt: 2 }}>
  <Typography
    variant="body2"
    sx={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}
  >
    Don’t have an account?{" "}
    <Typography
      component="span"
      onClick={() => router.push("/signupPage")}
      sx={{
        color: "#4ecdc4",
        cursor: "pointer",
        fontWeight: 600,
        "&:hover": {
          textDecoration: "underline",
        },
      }}
    >
      Sign up
    </Typography>
  </Typography>
</Box>

        </Box>
      </Paper>
    </Box>
  );
}
