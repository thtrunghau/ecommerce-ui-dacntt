import React from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  Avatar,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface RegisterSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  userData: {
    username: string;
    email: string;
  };
}

const RegisterSuccessDialog: React.FC<RegisterSuccessDialogProps> = ({
  open,
  onClose,
  userData,
}) => {
  const navigate = useNavigate();
  const handleComplete = () => {
    onClose();
    setTimeout(() => {
      navigate("/");
    }, 100); // Đợi dialog đóng xong rồi mới chuyển trang
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 2,
        },
      }}
    >
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            py: 2,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 1, fontWeight: 400 }}
          >
            Chào mừng bạn đến với Tech Zone
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ mb: 3, color: "text.secondary" }}
          >
            Tài khoản của bạn
          </Typography>

          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "action.selected",
              mb: 2,
            }}
          >
            <AccountCircle sx={{ width: 40, height: 40 }} />
          </Avatar>

          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {userData.username}
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
            {userData.email}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 4,
              color: "text.secondary",
              maxWidth: 400,
            }}
          >
            Tài khoản mới của bạn cung cấp cho bạn quyền tiếp cận các ưu đãi và
            phần thưởng độc quyền khi bạn mua sắm trên Samsung.com.
          </Typography>

          <Button
            variant="contained"
            onClick={handleComplete}
            sx={{
              px: 6,
              py: 1,
              bgcolor: "#0076D7",
              "&:hover": {
                bgcolor: "#0067be",
              },
              borderRadius: 1,
            }}
          >
            Hoàn tất
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterSuccessDialog;
