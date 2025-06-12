import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: 2,
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            transition: "all 0.2s ease-in-out",
            "& fieldset": {
              borderColor: "transparent",
              borderRadius: "8px",
            },
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(0, 118, 215, 0.05)",
              "& fieldset": { borderColor: "#0076d7" },
            },
          },
          "& .MuiInputBase-input": {
            padding: "12px 14px",
          },
          "& .MuiInputAdornment-root": {
            marginLeft: "12px",
            marginRight: "-4px",
          },
          "& .MuiFormHelperText-root": {
            marginLeft: "14px",
          },
          "& label.Mui-focused": {
            color: "#0076d7",
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
      <CssBaseline />{" "}
      <Container component="main" maxWidth="xs" sx={{ mb: 2, mt: 2 }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          {" "}
          <Typography
            component="h1"
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: 600,
              letterSpacing: "-0.5px",
            }}
          >
            Đăng nhập
          </Typography>
          {formError && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            {" "}
            <div className="flex flex-col gap-2">
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
            </div>{" "}
            <div className="mt-4 flex gap-3">
              <Button
                onClick={() => navigate(-1)}
                fullWidth
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: "9999px",
                  py: 1,
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.24)",
                  },
                }}
              >
                Trở về
              </Button>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="small"
                sx={{
                  borderRadius: "9999px",
                  py: 1,
                  bgcolor: "#0076d7",
                  "&:hover": {
                    bgcolor: "#0067be",
                  },
                }}
              >
                Đăng nhập
              </Button>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <Link
                to="/auth/forgot-password"
                className="text-primary hover:text-primary/90 transition-colors duration-200"
                style={{ color: darkTheme.palette.primary.main }}
              >
                Quên mật khẩu?
              </Link>
              <Link
                to="/auth/register"
                className="text-primary hover:text-primary/90 transition-colors duration-200"
                style={{ color: darkTheme.palette.primary.main }}
              >
                Chưa có tài khoản? Đăng ký
              </Link>
            </div>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default LoginStandalone;
