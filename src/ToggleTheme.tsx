import { DarkMode, LightMode } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useThemeContext } from "./ThemeContextProvider";

const ToggleTheme = ({ className }) => {
  const { toggleTheme, mode } = useThemeContext();

  return (
    <IconButton className={className} onClick={toggleTheme}>
      {mode === "light" ? (
        <DarkMode fontSize="inherit" />
      ) : (
        <LightMode fontSize="inherit" />
      )}
    </IconButton>
  );
};

export default ToggleTheme;
