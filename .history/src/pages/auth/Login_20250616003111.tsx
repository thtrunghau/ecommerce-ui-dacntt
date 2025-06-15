import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
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
  Button,
} from "@mui/material";
import LoadingButton from "../../components/common/LoadingButton";
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  LockOutlined,
} from "@mui/icons-material";
import useAuthStore from "../../store/authStore";

// Sử dụng lại theme tối tương tự trang Register
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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isAuthenticated, isLoading, error: authError } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  
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
      setGoogleLoading(false); // Reset Google loading state on error
    }
  }, [authError, isLoading]);
  
  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setFormError(null);
      
      // In a real implementation, we would integrate with Google OAuth API
      // For now, we'll simulate with a mock Google token
      const googleTokenMock = {
        idToken: "google-mock-token-" + Math.random().toString(36).substring(2),
      };
      
      await loginWithGoogle(googleTokenMock);
    } catch (error) {
      setFormError("Google đăng nhập không thành công. Vui lòng thử lại.");
      setGoogleLoading(false);
      console.error("Google login error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user types
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear general form error
    if (formError) {
      setFormError(null);
    }
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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Construct the login request
        const loginRequest = {
          email: formData.username, // Using username field for email
          password: formData.password,
        };

        // Call the login function from authStore
        await login(loginRequest);

        // No need to navigate manually, we can add a useEffect to handle that
        // when authentication state changes
        navigate("/");
      } catch (error) {
        setFormError("Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.");
        console.error("Login error:", error);
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
            Đăng nhập
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
              Đăng nhập
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
              </div>              <LoadingButton
                type="submit"
                loading={isLoading}
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Đăng nhập
              </LoadingButton>
              
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <div className="px-3 text-gray-500">hoặc</div>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              
              <Button
                fullWidth
                variant="outlined"
                sx={{
                  bgcolor: 'white',
                  color: 'rgba(0, 0, 0, 0.87)',
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                  mb: 2
                }}                onClick={handleGoogleSignIn}
                disabled={googleLoading || isLoading}
                startIcon={
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                }
              >
                Đăng nhập với Google
              </Button>{" "}
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
                    to="/register"
                    style={{ color: darkTheme.palette.primary.main }}
                  >
                    Chưa có tài khoản? Đăng ký
                  </Link>
                </div>
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

export default Login;
