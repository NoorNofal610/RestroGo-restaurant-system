
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Divider,
  Button,
  Stack,
  Chip,
  Alert,
  Snackbar,
  Paper,
  Fade,
  Modal,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  ArrowBack,
  ShoppingBag,
  RestaurantMenu,
  CheckCircle,
  ArrowForward,
  CreditCard,
  LocalAtm,
  Lock
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { urlFor } from "@/app/sanity/image";
import type { CartItem, SanityImage } from "@/src/sanity/types";

type CartOrder = {
  _id: string;
  status: string;
  totalPrice?: number;
  items: CartItem[];
};

type LocalUser = {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800";

type SnackbarState = {
  open: boolean;
  message: string;
  type: "success" | "error" | "warning" | "info";
};

export default function ProfessionalCartPage() {
  const [order, setOrder] = useState<CartOrder | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: "", type: "success" });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [processing, setProcessing] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const minFreeDelivery = 25;
  const deliveryFeeBase = 2;
  const discountPercent = Number(searchParams.get("discount") ?? 0);
  const hasDiscount = !Number.isNaN(discountPercent) && discountPercent > 0;

  const cartItems = (order?.items ?? []).filter((item) => item.dish);

  const getImageUrl = (image?: SanityImage | null) => {
    try {
      return image ? urlFor(image).width(800).height(600).url() : FALLBACK_IMG;
    } catch {
      return FALLBACK_IMG;
    }
  };

  const fetchCart = async (userId: string) => {
    setLoading(true);
    setSnackbar((prev) => ({ ...prev, open: false }));
    try {
      const res = await fetch(`/api/cart?userId=${userId}`);
      if (!res.ok) {
        throw new Error("Failed to load cart");
      }
      const data = await res.json();
      setOrder(data ?? null);
    } catch (err) {
      setOrder(null);
      setSnackbar({ open: true, message: err instanceof Error ? err.message : "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
    if (!storedUser) {
      setSnackbar({ open: true, message: "Please login to view your cart", type: "warning" });
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(storedUser) as LocalUser;
      setUser(parsed);
      fetchCart(parsed._id);
    } catch {
      setSnackbar({ open: true, message: "Failed to read user data", type: "error" });
      setLoading(false);
    }
  }, []);

  const handleQuantityChange = async (key: string, delta: number) => {
    if (!user) {
      setSnackbar({ open: true, message: "Please login first", type: "warning" });
      return;
    }
    const item = cartItems.find((i) => i._key === key);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);

    setUpdatingItem(key);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, itemKey: key, quantity: newQty }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      const data = await res.json();
      setOrder(data);
      setSnackbar({
        open: true,
        message: delta > 0 ? "Quantity increased" : "Quantity decreased",
        type: "info"
      });
    } catch (err) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : "Something went wrong", type: "error" });
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (key: string) => {
    if (!user) {
      setSnackbar({ open: true, message: "Please login first", type: "warning" });
      return;
    }
    setUpdatingItem(key);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, itemKey: key }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      const data = await res.json();
      setOrder(data);
      setSnackbar({ open: true, message: "Item removed from cart", type: "warning" });
    } catch (err) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : "Something went wrong", type: "error" });
    } finally {
      setUpdatingItem(null);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.dish?.price ?? 0) * item.quantity,
    0
  );
  const deliveryFee = subtotal >= minFreeDelivery || cartItems.length === 0 ? 0 : deliveryFeeBase;
  const totalBeforeDiscount = subtotal + deliveryFee;
  const discountAmount = hasDiscount ? (totalBeforeDiscount * discountPercent) / 100 : 0;
  const total = totalBeforeDiscount - discountAmount;
  const isFreeDelivery = subtotal >= minFreeDelivery;

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const method = event.target.value;
    setPaymentMethod(method);
    
    if (method === "card") {
      setShowCardModal(true);
    }
  };

  const handleCardInputChange = (field: keyof typeof cardDetails) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    
    // Format card number with spaces
    if (field === "cardNumber") {
      value = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      if (value.length > 19) value = value.substring(0, 19);
    }
    
    // Format expiry date
    if (field === "expiryDate") {
      value = value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
      }
      if (value.length > 5) value = value.substring(0, 5);
    }
    
    // Limit CVV to 3-4 digits
    if (field === "cvv") {
      value = value.replace(/\D/g, "");
      if (value.length > 4) value = value.substring(0, 4);
    }
    
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCardSubmit = () => {
    // Basic validation
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, "").length !== 16) {
      setSnackbar({ open: true, message: "Please enter a valid 16-digit card number", type: "error" });
      return;
    }
    
    if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      setSnackbar({ open: true, message: "Please enter a valid expiry date (MM/YY)", type: "error" });
      return;
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      setSnackbar({ open: true, message: "Please enter a valid CVV", type: "error" });
      return;
    }
    
    if (!cardDetails.cardholderName) {
      setSnackbar({ open: true, message: "Please enter cardholder name", type: "error" });
      return;
    }
    
    setShowCardModal(false);
    setSnackbar({ open: true, message: "Card details saved successfully", type: "success" });
  };

  const finalizeCheckout = async (): Promise<{ ok: boolean; message?: string }> => {
    if (!user) {
      return { ok: false, message: "Please login first" };
    }
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          discountPercent: hasDiscount ? discountPercent : 0,
        }),
      });
      if (!res.ok) throw new Error("Failed to complete order");
      setOrder(null);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : "Something went wrong" };
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    if (paymentMethod === "card") {
      if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, "").length !== 16) {
        setShowCardModal(true);
        return;
      }
    }

    setProcessing(true);
    const result = await finalizeCheckout();
    setProcessing(false);
    if (result.ok) {
      setShowSuccessModal(true);
    } else if (result.message) {
      setSnackbar({ open: true, message: result.message, type: "error" });
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    setSnackbar({ open: true, message: "Order confirmed! Enjoy your meal", type: "success" });
    setTimeout(() => {
      router.push("/");
    }, 2000);
  };

  return (
    <>
      {/* Navbar Component */}
      <Navbar />
      
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#0a0a0a",
          backgroundImage: `radial-gradient(circle at 50% 0%, rgba(78, 205, 196, 0.15) 0%, transparent 50%)`,
          p: { xs: 2, md: 4 },
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Poppins', sans-serif",
          pt: 8 
        }}
      >
        {/* Back Button */}
        <IconButton
          onClick={() => router.back()}
          sx={{
            position: "fixed",
            left: 16,
            top: 80,
            color: "#4ecdc4",
            bgcolor: "rgba(26,26,26,0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(78, 205, 196, 0.2)",
            zIndex: 100,
            '&:hover': {
              bgcolor: "rgba(78, 205, 196, 0.1)",
            }
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* Header */}
        <Box sx={{ maxWidth: 1200, mx: "auto", mb: { xs: 4, md: 6 }, mt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <RestaurantMenu sx={{ fontSize: 40, color: "#4ecdc4" }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(45deg, #4ecdc4, #44b7d6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your Shopping Cart
            </Typography>
            <Chip
              icon={<ShoppingBag />}
              label={`${cartItems.length} items`}
              color="primary"
              variant="outlined"
              sx={{
                ml: "auto",
                borderColor: "rgba(78, 205, 196, 0.3)",
                color: "#4ecdc4",
                fontWeight: 600
              }}
            />
          </Stack>
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Review your items and proceed to checkout
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", lg: "row" }} spacing={4} sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Left Column: Cart Items */}
          <Box sx={{ flex: 2 }}>
            {loading ? (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "rgba(26,26,26,0.6)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#fff"
                }}
              >
                Loading your cart...
              </Paper>
            ) : cartItems.length === 0 ? (
              <Alert
                severity="info"
                sx={{
                  bgcolor: "rgba(78,205,196,0.06)",
                  color: "#4ecdc4",
                  border: "1px solid rgba(78,205,196,0.3)"
                }}
              >
               No Dishes Yet.
              </Alert>
            ) : (
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item._key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        bgcolor: "rgba(26,26,26,0.8)",
                        backdropFilter: "blur(20px)",
                        borderRadius: 3,
                        border: "1px solid rgba(255,255,255,0.1)",
                        mb: 3,
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        '&:hover': {
                          borderColor: "rgba(78, 205, 196, 0.3)",
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 40px rgba(78, 205, 196, 0.15)"
                        }
                      }}
                    >
                      <Stack direction={{ xs: "column", sm: "row" }}>
                        <CardMedia
                          component="img"
                          image={getImageUrl(item.dish?.image)}
                          alt={item.dish?.name ?? "Dish image"}
                          sx={{
                            width: { xs: "100%", sm: 200 },
                            height: 200,
                            objectFit: "cover",
                            borderRight: { sm: "1px solid rgba(255,255,255,0.1)" }
                          }}
                        />
                        <CardContent sx={{ flex: 1, p: 3 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              {item.dish?.restaurant && typeof item.dish.restaurant === "object" && "name" in item.dish.restaurant && (
                                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                  { "logo" in item.dish.restaurant && (item.dish.restaurant as any).logo && (
                                    <Box
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        position: "relative",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <img
                                        src={urlFor((item.dish.restaurant as any).logo).width(80).height(80).url()}
                                        alt={(item.dish.restaurant as any).name || "Restaurant logo"}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                      />
                                    </Box>
                                  )}
                                  <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: 500 }}>
                                    {(item.dish.restaurant as any).name}
                                  </Typography>
                                </Stack>
                              )}
                              <Typography variant="h6" fontWeight="700" sx={{ color: "#fff" }}>
                                {item.dish?.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
                                {item.dish?.description}
                              </Typography>
                            </Box>
                            <Typography variant="h6" fontWeight="800" sx={{ color: "#4ecdc4" }}>
                              ${((item.dish?.price ?? 0) * item.quantity).toFixed(2)}
                            </Typography>
                          </Stack>

                          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3}>
                            {/* Quantity Controls */}
                            <Paper
                              variant="outlined"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                borderRadius: 2,
                                borderColor: "rgba(78, 205, 196, 0.3)",
                                overflow: "hidden",
                                bgcolor: "rgba(255,255,255,0.03)"
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item._key, -1)}
                                disabled={item.quantity <= 1 || updatingItem === item._key}
                                sx={{ 
                                  color: item.quantity <= 1 ? "rgba(255,255,255,0.3)" : "#4ecdc4",
                                  borderRadius: 0
                                }}
                              >
                                <Remove />
                              </IconButton>
                              <Typography sx={{ 
                                minWidth: 40, 
                                textAlign: "center", 
                                fontWeight: 600,
                                color: "#fff"
                              }}>
                                {item.quantity}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item._key, 1)}
                                disabled={updatingItem === item._key}
                                sx={{ 
                                  color: "#4ecdc4",
                                  borderRadius: 0
                                }}
                              >
                                <Add />
                              </IconButton>
                            </Paper>

                            {/* Unit Price & Delete */}
                            <Stack direction="row" alignItems="center" spacing={3}>
                              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)" }}>
                                ${(item.dish?.price ?? 0).toFixed(2)} each
                              </Typography>
                              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <IconButton
                                  onClick={() => handleRemoveItem(item._key)}
                                  disabled={updatingItem === item._key}
                                  sx={{ 
                                    color: "rgba(231, 76, 60, 0.8)",
                                    '&:hover': {
                                      bgcolor: "rgba(231, 76, 60, 0.1)"
                                    }
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </motion.div>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Stack>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </Box>

          {/* Right Column: Order Summary - Fixed Position */}
          <Box sx={{ flex: 1, position: "relative", mt: { xs: 4, lg: 0 } }}>
            <Paper
              sx={{
                bgcolor: "rgba(26,26,26,0.8)",
                backdropFilter: "blur(20px)",
                p: 4,
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.1)",
                position: "sticky",
                top: { xs: 80, md: 90 }, // Slightly higher and sticky while scrolling
                transition: "all 0.3s ease",
              }}
            >
              <Typography variant="h5" fontWeight="700" sx={{ color: "#fff", mb: 3 }}>
                Order Summary
              </Typography>

              {/* Price Breakdown */}
              <Stack spacing={2} mb={4}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Subtotal</Typography>
                  <Typography fontWeight="600" sx={{ color: "#fff" }}>
                    ${subtotal.toFixed(2)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Delivery</Typography>
                  <Typography fontWeight="600" sx={{ color: isFreeDelivery ? "#2ecc71" : "#fff" }}>
                    {isFreeDelivery ? "FREE" : `$${deliveryFee.toFixed(2)}`}
                  </Typography>
                </Stack>

                {hasDiscount && cartItems.length > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                      Discount ({discountPercent}%)
                    </Typography>
                    <Typography fontWeight="600" sx={{ color: "#2ecc71" }}>
                      -${discountAmount.toFixed(2)}
                    </Typography>
                  </Stack>
                )}

                <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" fontWeight="800" sx={{ color: "#fff" }}>
                    Total {hasDiscount ? "(after discount)" : ""}
                  </Typography>
                  <Typography variant="h5" fontWeight="800" sx={{ color: "#4ecdc4" }}>
                    ${total.toFixed(2)}
                  </Typography>
                </Stack>

                {!isFreeDelivery && cartItems.length > 0 && (
                  <Alert
                    severity="info"
                    sx={{
                      bgcolor: "rgba(52, 152, 219, 0.1)",
                      color: "#3498db",
                      border: "1px solid rgba(52, 152, 219, 0.3)",
                      borderRadius: 2,
                      mt: 2
                    }}
                  >
                    Add ${(Math.max(minFreeDelivery - subtotal, 0)).toFixed(2)} more for free delivery!
                  </Alert>
                )}
              </Stack>

              {/* Payment Method Selection */}
              <Box mb={4}>
                <Typography variant="body2" fontWeight="600" sx={{ color: "#fff", mb: 2 }}>
                  Select Payment Method
                </Typography>
                
                <RadioGroup
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  sx={{ gap: 2 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: paymentMethod === "cash" ? "#4ecdc4" : "rgba(255,255,255,0.1)",
                      bgcolor: paymentMethod === "cash" ? "rgba(78, 205, 196, 0.05)" : "rgba(255,255,255,0.03)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <FormControlLabel
                      value="cash"
                      control={
                        <Radio 
                          sx={{ 
                            color: paymentMethod === "cash" ? "#4ecdc4" : "rgba(255,255,255,0.3)",
                            '&.Mui-checked': { color: "#4ecdc4" }
                          }} 
                        />
                      }
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LocalAtm sx={{ color: "#4ecdc4" }} />
                          <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                            Cash on Delivery
                          </Typography>
                        </Stack>
                      }
                      sx={{ margin: 0 }}
                    />
                    {paymentMethod === "cash" && (
                      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", ml: 6, display: "block", mt: 1 }}>
                        Pay when you receive your order
                      </Typography>
                    )}
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: paymentMethod === "card" ? "#4ecdc4" : "rgba(255,255,255,0.1)",
                      bgcolor: paymentMethod === "card" ? "rgba(78, 205, 196, 0.05)" : "rgba(255,255,255,0.03)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <FormControlLabel
                      value="card"
                      control={
                        <Radio 
                          sx={{ 
                            color: paymentMethod === "card" ? "#4ecdc4" : "rgba(255,255,255,0.3)",
                            '&.Mui-checked': { color: "#4ecdc4" }
                          }} 
                        />
                      }
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CreditCard sx={{ color: "#4ecdc4" }} />
                          <Typography sx={{ color: "#fff", fontWeight: 500 }}>
                            Credit/Debit Card
                          </Typography>
                        </Stack>
                      }
                      sx={{ margin: 0 }}
                    />
                    {paymentMethod === "card" && cardDetails.cardNumber && (
                      <Typography variant="caption" sx={{ color: "#2ecc71", ml: 6, display: "block", mt: 1 }}>
                        ✓ Card ending in {cardDetails.cardNumber.slice(-4)}
                      </Typography>
                    )}
                  </Paper>
                </RadioGroup>
              </Box>

              {/* Checkout Button */}
              <motion.div whileHover={{ scale: cartItems.length > 0 ? 1.01 : 1 }} whileTap={{ scale: cartItems.length > 0 ? 0.99 : 1 }}>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || processing || loading}
                  startIcon={processing ? null : <CheckCircle />}
                  endIcon={processing ? null : <ArrowForward />}
                  sx={{
                    py: 2,
                    bgcolor: "#4ecdc4",
                    color: "#000",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    borderRadius: 2,
                    boxShadow: "0 4px 20px rgba(78, 205, 196, 0.3)",
                    '&:disabled': {
                      bgcolor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.3)"
                    },
                    '&:hover:not(:disabled)': {
                      bgcolor: "#44b7d6",
                      boxShadow: "0 6px 24px rgba(78, 205, 196, 0.4)"
                    }
                  }}
                >
                  {processing ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 20, height: 20, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        Processing...
                      </Box>
                    </>
                  ) : (
                    `Complete Order · $${total.toFixed(2)}`
                  )}
                </Button>
              </motion.div>

              {/* Security Note */}
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  textAlign: "center",
                  mt: 3,
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5
                }}
              >
                <Lock fontSize="small" /> Secure payment · Your information is protected
              </Typography>
            </Paper>
          </Box>
        </Stack>

        {/* Card Details Modal */}
        <Modal
          open={showCardModal}
          onClose={() => setShowCardModal(false)}
          aria-labelledby="card-details-modal"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2
          }}
        >
          <Fade in={showCardModal}>
            <Paper
              sx={{
                width: "100%",
                maxWidth: 500,
                bgcolor: "rgba(26,26,26,0.95)",
                backdropFilter: "blur(30px)",
                borderRadius: 3,
                border: "1px solid rgba(78, 205, 196, 0.3)",
                p: 4,
                outline: "none"
              }}
            >
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <CreditCard sx={{ color: "#4ecdc4", fontSize: 32 }} />
                  <Typography variant="h5" fontWeight="700" sx={{ color: "#fff" }}>
                    Enter Card Details
                  </Typography>
                </Stack>

                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardDetails.cardNumber}
                  onChange={handleCardInputChange("cardNumber")}
                  placeholder="1234 5678 9012 3456"
                  InputProps={{
                    startAdornment: <CreditCard sx={{ color: "#4ecdc4", mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiInputLabel-root': { color: "rgba(255,255,255,0.7)" },
                    '& .MuiOutlinedInput-root': {
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(78, 205, 196, 0.3)",
                      '&:hover': { borderColor: "#4ecdc4" }
                    }
                  }}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    value={cardDetails.expiryDate}
                    onChange={handleCardInputChange("expiryDate")}
                    placeholder="MM/YY"
                    sx={{
                      '& .MuiInputLabel-root': { color: "rgba(255,255,255,0.7)" },
                      '& .MuiOutlinedInput-root': {
                        color: "#fff",
                        bgcolor: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(78, 205, 196, 0.3)"
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="CVV"
                    type="password"
                    value={cardDetails.cvv}
                    onChange={handleCardInputChange("cvv")}
                    placeholder="123"
                    sx={{
                      '& .MuiInputLabel-root': { color: "rgba(255,255,255,0.7)" },
                      '& .MuiOutlinedInput-root': {
                        color: "#fff",
                        bgcolor: "rgba(255,255,255,0.03)",
                        borderColor: "rgba(78, 205, 196, 0.3)"
                      }
                    }}
                  />
                </Stack>

                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardDetails.cardholderName}
                  onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                  placeholder="John Doe"
                  sx={{
                    '& .MuiInputLabel-root': { color: "rgba(255,255,255,0.7)" },
                    '& .MuiOutlinedInput-root': {
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.03)",
                      borderColor: "rgba(78, 205, 196, 0.3)"
                    }
                  }}
                />

                <Stack direction="row" spacing={2} mt={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowCardModal(false)}
                    sx={{
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "rgba(255,255,255,0.7)",
                      '&:hover': { borderColor: "#fff", color: "#fff" }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleCardSubmit}
                    startIcon={<CheckCircle />}
                    sx={{
                      bgcolor: "#4ecdc4",
                      color: "#000",
                      fontWeight: "bold",
                      '&:hover': { bgcolor: "#44b7d6" }
                    }}
                  >
                    Save Card Details
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Fade>
        </Modal>

        {/* Order Success Modal */}
        <Modal
          open={showSuccessModal}
          onClose={() => {}}
          aria-labelledby="order-success-modal"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2
          }}
        >
          <Fade in={showSuccessModal}>
            <Paper
              sx={{
                width: "100%",
                maxWidth: 500,
                bgcolor: "rgba(26,26,26,0.95)",
                backdropFilter: "blur(30px)",
                borderRadius: 3,
                border: "1px solid rgba(46, 204, 113, 0.3)",
                p: 4,
                textAlign: "center",
                outline: "none"
              }}
            >
              <CheckCircle sx={{ fontSize: 80, color: "#2ecc71", mb: 3 }} />
              
              <Typography variant="h4" fontWeight="700" sx={{ color: "#2ecc71", mb: 2 }}>
                Order Confirmed! 🎉
              </Typography>
              
              <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>
                Your order has been successfully placed
              </Typography>
              
                <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}>
                  Thank you for your order! Your food is being prepared with care.
                  <br />
                  <strong>Order Total: ${total.toFixed(2)}</strong>
                  <br />
                  Estimated delivery: 30-45 minutes
                </Typography>
              
              <Typography variant="body2" sx={{ 
                color: "rgba(78, 205, 196, 0.8)", 
                fontStyle: "italic",
                mb: 4,
                p: 2,
                bgcolor: "rgba(78, 205, 196, 0.05)",
                borderRadius: 2
              }}>
                "Enjoy your meal! Bon appétit! 🍽️"
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleSuccessConfirm}
                startIcon={<CheckCircle />}
                sx={{
                  bgcolor: "#2ecc71",
                  color: "#000",
                  fontWeight: "bold",
                  py: 2,
                  fontSize: "1.1rem",
                  '&:hover': { bgcolor: "#27ae60" }
                }}
              >
                Continue to Home
              </Button>
            </Paper>
          </Fade>
        </Modal>

        {/* Snackbar Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={Fade}
        >
          <Alert
            severity={snackbar.type}
            icon={snackbar.type === "success" ? <CheckCircle /> : null}
            sx={{
              bgcolor: snackbar.type === "success" 
                ? "rgba(46, 204, 113, 0.1)" 
                : snackbar.type === "error"
                ? "rgba(231, 76, 60, 0.1)"
                : snackbar.type === "warning"
                ? "rgba(241, 196, 15, 0.1)"
                : "rgba(52, 152, 219, 0.1)",
              color: snackbar.type === "success" 
                ? "#2ecc71" 
                : snackbar.type === "error"
                ? "#e74c3c"
                : snackbar.type === "warning"
                ? "#f1c40f"
                : "#3498db",
              border: `1px solid ${snackbar.type === "success" 
                ? "rgba(46, 204, 113, 0.3)" 
                : snackbar.type === "error"
                ? "rgba(231, 76, 60, 0.3)"
                : snackbar.type === "warning"
                ? "rgba(241, 196, 15, 0.3)"
                : "rgba(52, 152, 219, 0.3)"}`,
              fontWeight: 500,
              alignItems: "center"
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

      </Box>
    </>
  );
}

