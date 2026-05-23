// @ts-nocheck
import { Typography } from "@mui/material";
import Menu from "./Menu";
import ToggleTheme from "./ToggleTheme";

const Header = () => {
  return (
    <div
      id="header"
      style={{ display: "flex", justifyContent: "space-between" }}
    >
      <div className="stack-view">
        <Menu />
        <ToggleTheme />
      </div>
      <Menu className="row-view" />
      <div
        className="site-info"
        style={{ display: "flex", gap: "1em", alignItems: "center" }}
      >
        <img src="/brawl.svg" style={{ height: "4em" }} />
        <div
          style={{
            display: "flex",
            gap: "0.25em",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <Typography className="header-text" variant="h4">
            One for Brawl
          </Typography>
          <Typography className="header-text" variant="subtitle1">
            MTGA Brawl Deck Builder
          </Typography>
        </div>
      </div>
      <ToggleTheme className="row-view" />
    </div>
  );
};

export default Header;
