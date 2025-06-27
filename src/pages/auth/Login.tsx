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
} from "@mui/material";
import LoadingButton from "../../components/common/LoadingButton";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import useAuthStore from "../../store/authStore";
import toast from "react-hot-toast";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

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
  const {
    login,
    isAuthenticated,
    isLoading,
    error: authError,
  } = useAuthStore();

  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Get the intended destination from location state or default to home
  const from = location.state?.from?.pathname || "/";

  // Effect to handle successful authentication
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Đăng nhập thành công!");
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Effect to handle authentication errors
  useEffect(() => {
    if (authError && !isLoading) {
      setFormError(authError);
      toast.error(authError || "Đăng nhập không thành công. Vui lòng thử lại.");
      console.error("[Login] Auth error:", authError);
    }
  }, [authError, isLoading]);

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
    console.log("[Login] Submit login", formData);
    if (validateForm()) {
      try {
        // Construct the login request
        const loginRequest = {
          email: formData.username, // Using username field for email
          password: formData.password,
        };
        console.log("[Login] Call login with", loginRequest);
        // Call the login function from authStore
        await login(loginRequest);
        console.log(
          "[Login] Login finished, isAuthenticated:",
          isAuthenticated,
        );
        // No need to navigate manually, we can add a useEffect to handle that
        // when authentication state changes
        // navigate("/");
      } catch (error) {
        setFormError(
          "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.",
        );
        toast.error(
          "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.",
        );
        console.error("[Login] Login error:", error);
      }
    } else {
      console.log("[Login] Validate form failed", errors);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Paper elevation={6} sx={{ mt: 8, p: 4 }}>
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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            <LoadingButton
              type="submit"
              loading={isLoading}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Đăng nhập
            </LoadingButton>
            <div className="my-4 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="px-3 text-gray-500">hoặc</div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            <GoogleLoginButton
              type="login"
              onSuccess={(result) => {
                // Khi login Google thành công, chỉ cần set token vào local store (không gọi lại loginWithGoogle)
                if ("accessToken" in result && result.accessToken) {
                  // Ví dụ: lưu accessToken vào localStorage hoặc gọi hàm setAuth nếu có
                  localStorage.setItem("accessToken", result.accessToken);
                  // Nếu muốn, có thể trigger reload hoặc chuyển hướng
                  window.location.reload();
                }
              }}
              onError={(err) => {
                setFormError(
                  "Google đăng nhập không thành công. Vui lòng thử lại.",
                );
                console.error("Google login error:", err);
              }}
            />
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
                  to="/auth/register"
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

export default Login;
