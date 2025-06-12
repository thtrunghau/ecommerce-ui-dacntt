import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Alert,
} from "@mui/material";
import { ArrowBack, EmailOutlined } from "@mui/icons-material";

// Sử dụng lại theme tối tương tự trang Register và Login
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

interface ForgotPasswordFormData {
  email: string;
}

const initialFormData: ForgotPasswordFormData = {
  email: "",
};

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ForgotPasswordFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ForgotPasswordFormData>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user types
    if (errors[name as keyof ForgotPasswordFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    // Clear general form error
    if (formError) {
      setFormError(null);
    }
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ForgotPasswordFormData> = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
      isValid = false;
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Trong thực tế, đây sẽ là API call để gửi email reset mật khẩu
        // Ở đây chúng ta giả lập thành công
        console.log("Sending password reset email to:", formData.email);
        
        // Hiển thị thông báo thành công
        setIsSubmitted(true);
      } catch (error) {
        setFormError("Có lỗi xảy ra. Vui lòng thử lại sau.");
        console.error("Password reset error:", error);
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
            onClick={() => navigate("/login")}
            sx={{ color: "text.primary", mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quên mật khẩu
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
              <EmailOutlined />
            </Avatar>

            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              Khôi phục mật khẩu
            </Typography>

            {isSubmitted ? (
              <>
                <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
                  Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.
                </Alert>
                <Typography variant="body2" sx={{ mb: 3, textAlign: "center" }}>
                  Vui lòng kiểm tra hộp thư đến email của bạn và làm theo hướng dẫn 
                  để đặt lại mật khẩu. Liên kết sẽ có hiệu lực trong vòng 24 giờ.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  sx={{ mt: 1 }}
                >
                  Quay lại đăng nhập
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 3, textAlign: "center" }}>
                  Nhập địa chỉ email bạn đã sử dụng để đăng ký tài khoản.
                  Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
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
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        name="email"
                        required
                        fullWidth
                        id="email"
                        label="Địa chỉ email"
                        value={formData.email}
                        onChange={handleChange}
                        error={Boolean(errors.email)}
                        helperText={errors.email}
                        autoComplete="email"
                        autoFocus
                      />
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Gửi yêu cầu đặt lại mật khẩu
                  </Button>

                  <Grid container>
                    <Grid item xs>
                      <Button
                        onClick={() => navigate("/login")}
                        sx={{ color: "primary.main", textTransform: "none", p: 0 }}
                      >
                        Quay lại đăng nhập
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
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

export default ForgotPassword;
