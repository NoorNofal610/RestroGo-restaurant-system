"use client";

import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CategoryIcon from "@mui/icons-material/Category";
import Link from "next/link";
import { usePathname } from "next/navigation";

type User = {
  name: string;
  profileImage?: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const isMobile = useMediaQuery("(max-width:900px)");
  const showCategoriesToggle = isMobile && pathname.startsWith("/restaurantsPage");

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Restaurants", href: "/restaurantsPage" },
    { label: "Cart", href: "/cartPage" },
    { label: "Favorites", href: "/favorites" },
  ];

  // Hydration-safe + client-only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        setHydrated(true);

        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
          const parsed = JSON.parse(storedUser) as User;
          setCurrentUser(parsed);
        }
      }, 0);
    }
  }, []);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    handleMenuClose();
  };

  const toggleMobile = () => {
    setMobileOpen((prev) => !prev);
  };

  const toggleCategories = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("toggleCategoriesDrawer"));
  };

  if (!hydrated) return null; 

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: "transparent", boxShadow: "none" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
          RestroGo
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!isMobile &&
            navItems.map((item) => (
              <Link key={item.label} href={item.href} passHref>
                <Button sx={{ color: "white" }}>{item.label}</Button>
              </Link>
            ))}

          {showCategoriesToggle && (
            <IconButton
              sx={{ color: "white" }}
              onClick={toggleCategories}
              aria-label="Open categories"
            >
              <CategoryIcon />
            </IconButton>
          )}

          {isMobile && (
            <IconButton sx={{ color: "white" }} onClick={toggleMobile}>
              <MenuIcon />
            </IconButton>
          )}

          {currentUser ? (
            <>
              <IconButton onClick={handleAvatarClick} size="small">
                <Avatar
                  src={currentUser.profileImage}
                  alt={currentUser.name}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(15,15,15,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 18px 45px rgba(0,0,0,0.7)",
                    minWidth: 220,
                  },
                }}
              >
                <MenuItem
                  disabled
                  sx={{
                    cursor: "default",
                    opacity: 1,
                    py: 1.5,
                    alignItems: "flex-start",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}
                  >
                    Signed in as
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: "#fff", fontWeight: 600 }}>
                    {currentUser.name}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    mt: 0.5,
                    color: "#ff6b6b",
                    fontWeight: 500,
                    "&:hover": {
                      bgcolor: "rgba(255,107,107,0.1)",
                    },
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Link href="/loginPage" passHref>
              <Button sx={{ color: "white" }}>Login</Button>
            </Link>
          )}
        </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleMobile}
        PaperProps={{
          sx: {
            bgcolor: "#111",
            color: "#fff",
            width: 260,
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            Menu
          </Typography>
          <List sx={{ flex: 1 }}>
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} passHref onClick={toggleMobile}>
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              </Link>
            ))}
          </List>
          {currentUser ? (
            <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", pt: 2 }}>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Signed in as
              </Typography>
              <Typography sx={{ mb: 1, fontWeight: 600 }}>{currentUser.name}</Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  handleLogout();
                  toggleMobile();
                }}
                fullWidth
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", pt: 2 }}>
              <Link href="/loginPage" passHref onClick={toggleMobile}>
                <Button variant="contained" fullWidth sx={{ bgcolor: "#4ecdc4", color: "#000", fontWeight: "bold" }}>
                  Login
                </Button>
              </Link>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}
