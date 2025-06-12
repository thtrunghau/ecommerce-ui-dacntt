import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  InputAdornment,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import useAuthStore from "../../store/authStore";

// Sử dụng lại theme tối tương tự trang Register
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#0076d7" },
    secondary: { main: "#30336b" },
    background: { default: "#121212", paper: "#1e1e1e" },
  },
  typography: {
    fontFamily: '"Samsung One", "Roboto", "Helvetica", "Arial", sans-serif',
  },  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: 2,
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#444",
              borderRadius: "9999px",
            },
            "&:hover fieldset": { borderColor: "#666" },
            "&.Mui-focused fieldset": { borderColor: "#0076d7" },
          },
          "& .MuiInputBase-input": {
            padding: "12px 14px",
          },
          "& .MuiInputAdornment-root": {
            marginLeft: "12px",
            marginRight: "-4px",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          padding: "12px 24px",
          borderRadius: "9999px",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          backgroundColor: "#0076d7",
          "&:hover": { backgroundColor: "#0067be" },
        },
        outlined: {
          borderColor: "rgba(255, 255, 255, 0.12)",
          color: "#fff",
          "&:hover": {
            borderColor: "rgba(255, 255, 255, 0.24)",
            backgroundColor: "rgba(255, 255, 255, 0.04)",
          },
        },
      },
    },
  },
});

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

const initialFormData: LoginFormData = {
  username: "",
  password: "",
  rememberMe: false,
};

const LoginStandalone: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (formError) setFormError(null);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};
    let isValid = true;
    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập hoặc email là bắt buộc";
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const user = {
          id: crypto.randomUUID(),
          username: formData.username,
          email: formData.username.includes("@")
            ? formData.username
            : `${formData.username}@example.com`,
          phone: "0123456789", // Mock phone number
        };
        login(user);
        navigate("/");
      } catch (error) {
        setFormError("Tên đăng nhập hoặc mật khẩu không đúng.");
        console.error("Login error:", error);
      }
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container component="main" maxWidth="sm" sx={{ mb: 8, mt: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlined />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Đăng nhập
          </Typography>
          {formError && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <div className="flex flex-col gap-4">
              <TextField
                name="username"
                required
                fullWidth
                id="username"
                label="Tên đăng nhập hoặc email"
                value={formData.username}
                onChange={handleChange}
                error={Boolean(errors.username)}
                helperText={errors.username}
                autoComplete="username"
              />
              <TextField
                required
                fullWidth
                name="password"
                label="Mật khẩu"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={Boolean(errors.password)}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    color="primary"
                    checked={formData.rememberMe}
                    onChange={handleCheckboxChange}
                  />
                }
                label="Nhớ đăng nhập"
              />
            </div>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Đăng nhập
            </Button>
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <Link
                  to="/forgot-password"
                  style={{ color: darkTheme.palette.primary.main }}
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="sm:text-right">
                <Link
                  to="/register/standalone"
                  style={{ color: darkTheme.palette.primary.main }}
                >
                  Chưa có tài khoản? Đăng ký
                </Link>
              </div>
            </div>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default LoginStandalone;
