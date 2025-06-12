import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Box } from "@mui/material";

const AuthHeader: React.FC = () => {
  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "#000",
        boxShadow: "none",
        height: "64px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "12px 0",
        }}
      >
        <Link to="/">
          <img
            src="/images/logo-ecommerce/logo-tech-zone-white.svg"
            alt="TechZone Logo"
            style={{
              height: "40px",
              width: "auto",
            }}
          />
        </Link>
      </Box>
    </AppBar>
  );
};

export default AuthHeader;
