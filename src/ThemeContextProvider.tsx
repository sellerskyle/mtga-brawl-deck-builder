import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import React, { createContext } from "react";
import { defaultTheme, THEMES } from "./theme";

export const ThemeContext = createContext({
  mode: "dark",
  toggleTheme: () => {},
});

function getCookie(cname: string) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export const ThemeContextProvider = ({ children }) => {
  // const [theme, setTheme] = React.useState(getCookie("theme"));
  const [theme, setTheme] = React.useState("dark");

  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.cookie = `theme = ${newTheme}`;
  }, [theme]);

  const getTheme = React.useMemo(() => THEMES[theme], [theme]);
  return (
    <ThemeContext.Provider value={{ mode: theme, toggleTheme }}>
      <ThemeProvider theme={getTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  return React.useContext(ThemeContext);
};

export default ThemeContextProvider;
