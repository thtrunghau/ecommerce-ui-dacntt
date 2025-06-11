import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";

interface RoundedButtonProps extends ButtonProps {
  text: string;
}

const RoundedButton = ({ text, ...props }: RoundedButtonProps) => {
  return (
    <Button
      variant="contained"
      {...props}
      sx={{
        borderRadius: '9999px',
        textTransform: 'none',
        fontSize: '0.75rem',
        padding: '0.375rem 0.75rem',
        backgroundColor: 'black',
        border: '1px solid black',
        '&:hover': {
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid black'
        },
        ...props.sx
      }}
    >
      {text}
    </Button>
  );
};

export default RoundedButton;
