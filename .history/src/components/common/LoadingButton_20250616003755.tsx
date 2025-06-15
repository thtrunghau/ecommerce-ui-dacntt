import React from "react";
import { Button, CircularProgress } from "@mui/material";
import type { ButtonProps } from "@mui/material";

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

/**
 * Button that shows a loading spinner when the loading prop is true
 */
const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  disabled,
  ...rest
}) => {
  return (
    <Button disabled={loading || disabled} {...rest}>
      {loading ? (
        <>
          <CircularProgress
            size={24}
            color="inherit"
            style={{ marginRight: "8px" }}
          />
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;
