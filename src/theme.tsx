import { createTheme } from "@mui/material";

const light = "#FFFFFF";
const dark = "#0C0F11";
const lightBackground = "#F7F7F7";
const darkBackground = "#222222";
export const magicRed = "#C52500";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    // primary: {
    //   main: dark,
    // },
    // secondary: {
    //   main: magicRed,
    // },
    // text: {
    //   primary: dark,
    // },
    // background: {
    //   default: lightBackground,
    // },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    // primary: {
    //   main: light,
    // },
    // secondary: {
    //   main: magicRed,
    // },
    // text: {
    //   primary: light,
    // },
    background: {
      default: darkBackground,
    },
  },
});

export const defaultTheme = darkTheme;

export const THEMES = {
  light: lightTheme,
  dark: darkTheme,
};
