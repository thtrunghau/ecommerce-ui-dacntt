import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  AccountCircle,
  LockOutlined,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import useAuthStore from "../../store/authStore";

// Tạo theme tối cho trang đăng ký, tương tự Samsung
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0076d7",
    },
    secondary: {
      main: "#30336b",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: '"Samsung One", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderRadius: "4px",
              borderColor: "#444",
            },
            "&:hover fieldset": {
              borderColor: "#666",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0076d7",
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          textTransform: "none",
          fontWeight: 600,
          boxShadow: "none",
          padding: "12px 24px",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          backgroundColor: "#0076d7",
          "&:hover": {
            backgroundColor: "#0067be",
          },
        },
      },
    },
  },
});

interface FormData {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: FormData = {
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isAuthenticated, isLoading, error: authError } = useAuthStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [formError, setFormError] = useState<string | null>(null);
  
  // Get the intended destination from location state or default to home
  const from = location.state?.from?.pathname || "/";
  
  // Effect to handle successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Effect to handle authentication errors
  useEffect(() => {
    if (authError && !isLoading) {
      setFormError(authError);
    }
  }, [authError, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user types
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear general form error
    if (formError) {
      setFormError(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
        isValid = false;
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
      isValid = false;
    } else {
      // Kiểm tra số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone =
          "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)";
        isValid = false;
      }
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Create user object from form data
        const userData = {
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password,
          birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined,
        };

        // Register the user via the authStore
        await register(userData);
        
        // No need to navigate manually, useEffect will handle that
        // based on isAuthenticated state changes
      } catch (error) {
        setFormError("Đăng ký không thành công. Vui lòng thử lại sau.");
        console.error("Registration error:", error);
      }
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* Simple header */}
        <Box
          component="header"
          sx={{ py: 2, px: 3, display: "flex", alignItems: "center" }}
        >
          <IconButton
            edge="start"
            onClick={() => navigate("/")}
            sx={{ color: "text.primary", mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Đăng ký tài khoản
          </Typography>
        </Box>

        {/* Main content */}
        <Container component="main" maxWidth="sm" sx={{ mb: 8, mt: 4 }}>
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
              Tạo tài khoản mới
            </Typography>

            {formError && (
              <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                {formError}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: "100%" }}
            >
              {" "}
              <div className="flex flex-col gap-4">
                <TextField
                  name="username"
                  required
                  fullWidth
                  id="username"
                  label="Tên đăng nhập"
                  value={formData.username}
                  onChange={handleChange}
                  error={Boolean(errors.username)}
                  helperText={errors.username}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Địa chỉ email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />

                <TextField
                  required
                  fullWidth
                  id="phone"
                  label="Số điện thoại"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
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

                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Đăng ký
              </Button>{" "}
              <div className="flex justify-center">
                <Link
                  to="/login"
                  style={{ color: darkTheme.palette.primary.main }}
                >
                  Đã có tài khoản? Đăng nhập
                </Link>
              </div>
            </Box>
          </Paper>
        </Container>

        {/* Simple footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: "auto",
            backgroundColor: darkTheme.palette.background.paper,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} TECH ZONE. Bảo lưu mọi quyền.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Register;
