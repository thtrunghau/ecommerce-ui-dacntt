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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  LockOutlined,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import useAuthStore from "../../store/authStore";

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
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderRadius: "9999px", borderColor: "#444" },
            "&:hover fieldset": { borderColor: "#666" },
            "&.Mui-focused fieldset": { borderColor: "#0076d7" },
          },          "& .MuiInputBase-input": {
            padding: "12px 14px",
          },
          "& .MuiInputAdornment-root": {
            marginLeft: "8px",
            marginRight: "-4px",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          textTransform: "none",
          fontWeight: 600,            boxShadow: "none",
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

interface FormData {
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: FormData = {
  username: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  password: "",
  confirmPassword: "",
};

const RegisterStandalone: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (formError) setFormError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    let isValid = true;
    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
      isValid = false;    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
      isValid = false;
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh là bắt buộc";
      isValid = false;
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.dateOfBirth = "Ngày sinh không hợp lệ";
        isValid = false;
      }
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const newUser = {
          id: crypto.randomUUID(),
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
        };
        register(newUser);
        navigate("/");
      } catch (error) {
        setFormError("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
        console.error("Registration error:", error);
      }
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />      <Container component="main" maxWidth="xs" sx={{ mb: 4, mt: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Avatar sx={{ mb: 1, bgcolor: "primary.main", width: 32, height: 32 }}>
            <LockOutlined sx={{ fontSize: 20 }} />
          </Avatar>
          <Typography component="h1" variant="h6" sx={{ mb: 2 }}>
            Tạo tài khoản mới
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
              />              <TextField
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
              <TextField
                required
                fullWidth
                id="dateOfBirth"
                label="Ngày sinh"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                error={Boolean(errors.dateOfBirth)}
                helperText={errors.dateOfBirth}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& input[type=date]::-webkit-calendar-picker-indicator": {
                    filter: "invert(0.7)",
                  },
                }}
              />
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                onClick={() => navigate(-1)}
                fullWidth
                variant="outlined"
                sx={{
                  borderRadius: "9999px",
                  py: 1.5,
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
                sx={{
                  borderRadius: "9999px",
                  py: 1.5,
                  bgcolor: "#0076d7",
                  "&:hover": {
                    bgcolor: "#0067be",
                  },
                }}
              >
                Đăng ký
              </Button>
            </div>            <div className="flex justify-center mt-4">
              <Link
                to="/auth/login"
                className="text-primary hover:text-primary/90 transition-colors duration-200"
                style={{ color: darkTheme.palette.primary.main }}
              >
                Đã có tài khoản? Đăng nhập ngay
              </Link>
            </div>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default RegisterStandalone;
