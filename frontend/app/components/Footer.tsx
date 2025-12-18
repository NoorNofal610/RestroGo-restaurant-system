"use client";

import { Box, Typography, IconButton, TextField, Button, InputAdornment } from "@mui/material";
import { Facebook, Instagram, Email, LocalAtm, CreditCard, Payment } from "@mui/icons-material";
import Image from "next/image";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  const paymentMethods = [
    { src: "/img/visa.png", alt: "Visa", width: 70, height: 40 },
    { src: "/img/mestercard.png", alt: "Mastercard", width: 70, height: 40 },
    { src: "/img/paypal2.png", alt: "PayPal", width: 70, height: 40 },
    { src: "/img/apple-pay.png", alt: "Apple Pay", width: 70, height: 40 },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#0a0a0a",
        color: "white",
        px: { xs: 3, sm: 4, md: 6, lg: 10 },
        pt: 8,
        pb: 4,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #ff6b6b, #ffa726, #4ecdc4)",
        },
      }}
    >
      {/* Main Sections Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          justifyContent: "space-between",
          gap: 6,
          mb: 6,
        }}
      >
        {/* Left Section: Brand Info */}
        <Box sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          gap: 3,
          maxWidth: { lg: "300px" }
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: "bold",
              background: "linear-gradient(90deg, #4ecdc4, #44a08d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1
            }}
          >
            RestroGo
          </Typography>
          
          <Typography variant="body1" sx={{ 
            color: "rgba(255,255,255,0.8)", 
            lineHeight: 1.7,
            fontSize: "0.95rem"
          }}>
            Experience gourmet dining delivered. Discover the best restaurants 
            and enjoy exquisite meals from the comfort of your home.
          </Typography>

          {/* Social Icons */}
          <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
            <IconButton 
              href="#" 
              sx={{ 
                bgcolor: "rgba(255,255,255,0.08)",
                color: "white",
                "&:hover": { 
                  bgcolor: "#4267B2",
                  transform: "translateY(-3px)",
                  boxShadow: "0 4px 12px rgba(66, 103, 178, 0.3)"
                },
                transition: "all 0.3s ease",
                width: 44,
                height: 44,
              }}
            >
              <Facebook />
            </IconButton>
            <IconButton 
              href="#" 
              sx={{ 
                bgcolor: "rgba(255,255,255,0.08)",
                color: "white",
                "&:hover": { 
                  bgcolor: "#E1306C",
                  transform: "translateY(-3px)",
                  boxShadow: "0 4px 12px rgba(225, 48, 108, 0.3)"
                },
                transition: "all 0.3s ease",
                width: 44,
                height: 44,
              }}
            >
              <Instagram />
            </IconButton>
            <IconButton 
              href="#" 
              sx={{ 
                bgcolor: "rgba(255,255,255,0.08)",
                color: "white",
                "&:hover": { 
                  bgcolor: "#FFFC00",
                  color: "black",
                  transform: "translateY(-3px)",
                  boxShadow: "0 4px 12px rgba(255, 252, 0, 0.3)"
                },
                transition: "all 0.3s ease",
                width: 44,
                height: 44,
              }}
            >
              <Payment sx={{ fontSize: 24 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Center Section: Payment Methods */}
        <Box sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          gap: 2,
          alignItems: { xs: "flex-start", lg: "center" }
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <LocalAtm sx={{ color: "#4ecdc4", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
              Secure Payment
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ 
            color: "rgba(255,255,255,0.7)",
            mb: 2,
            textAlign: { xs: "left", lg: "center" }
          }}>
            We accept all major payment methods for your convenience
          </Typography>

          {/* Payment Icons Grid */}
          <Box sx={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: 2,
            justifyContent: { xs: "flex-start", lg: "center" },
            maxWidth: "400px"
          }}>
            {paymentMethods.map((method) => (
              <Box
                key={method.alt}
                sx={{
                  bgcolor: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 80,
                  height: 50,
                  transition: "all 0.3s ease",
                  border: "1px solid rgba(255,255,255,0.1)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(78, 205, 196, 0.2)",
                    borderColor: "rgba(78, 205, 196, 0.3)",
                  },
                }}
              >
                <Image 
                  src={method.src} 
                  alt={method.alt} 
                  width={method.width}
                  height={method.height}
                  style={{ 
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)"
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Section: Email Subscription */}
        <Box sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          gap: 2,
          maxWidth: { lg: "400px" }
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Email sx={{ color: "#4ecdc4", fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#fff" }}>
              Stay Updated
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ 
            color: "rgba(255,255,255,0.7)",
            mb: 3
          }}>
            Subscribe to receive exclusive deals, new restaurant alerts, 
            and special promotions directly to your inbox.
          </Typography>

          {/* Email Subscription Form */}
          <form onSubmit={handleSubscribe}>
            <Box sx={{ 
              display: "flex", 
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              alignItems: "stretch"
            }}>
              <TextField
                placeholder="Your email address"
                variant="outlined"
                size="medium"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "rgba(255,255,255,0.5)" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.05)",
                    borderRadius: "10px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.2)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(78, 205, 196, 0.5)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#4ecdc4",
                      borderWidth: "2px",
                    },
                  }
                }}
                sx={{
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255,255,255,0.4)",
                  },
                }}
              />
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#4ecdc4",
                  color: "#000",
                  fontWeight: "bold",
                  px: 4,
                  py: 1.5,
                  borderRadius: "10px",
                  minWidth: { xs: "100%", sm: "140px" },
                  "&:hover": {
                    bgcolor: "#3db8af",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(78, 205, 196, 0.4)",
                  },
                  transition: "all 0.3s ease",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Subscribe
              </Button>
            </Box>
          </form>
          
          <Typography variant="caption" sx={{ 
            color: "rgba(255,255,255,0.5)",
            mt: 1,
            fontSize: "0.75rem"
          }}>
            We respect your privacy. Unsubscribe at any time.
          </Typography>
        </Box>
      </Box>

      {/* Footer Bottom */}
      <Box sx={{ 
        width: "100%", 
        mt: 8, 
        pt: 4, 
        borderTop: "1px solid rgba(255,255,255,0.1)", 
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
      }}>
        <Typography variant="body2" sx={{ 
          color: "rgba(255,255,255,0.6)",
          fontSize: "0.9rem"
        }}>
          &copy; {new Date().getFullYear()} RestroGo. All rights reserved.
        </Typography>
        
        <Box sx={{ display: "flex", gap: 3 }}>
          <Typography variant="body2" sx={{ 
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            "&:hover": { color: "#4ecdc4" },
            transition: "color 0.3s ease",
            fontSize: "0.9rem"
          }}>
            Privacy Policy
          </Typography>
          <Typography variant="body2" sx={{ 
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            "&:hover": { color: "#4ecdc4" },
            transition: "color 0.3s ease",
            fontSize: "0.9rem"
          }}>
            Terms of Service
          </Typography>
          <Typography variant="body2" sx={{ 
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            "&:hover": { color: "#4ecdc4" },
            transition: "color 0.3s ease",
            fontSize: "0.9rem"
          }}>
            Contact Us
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}