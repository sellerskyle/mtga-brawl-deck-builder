import { Typography } from "@mui/material";

const Footer = () => {
  return (
    <div id="footer" className="main-content">
      <Typography className="footer-item" variant="subtitle1">
        Have a suggestion? Found a bug? Contact us at{" "}
        <a href="mailto:oneforbrawl@gmail.co,">oneforbrawl@gmail.com</a>
      </Typography>
      <Typography className="footer-item" variant="subtitle1">
        Magic: The Gathering ® and Magic: The Gathering Arena are trademarks of{" "}
        <a href="https://company.wizards.com/">
          Wizards of the Coast LLC © 1993-2026
        </a>
        . All Rights Reserved.
      </Typography>
      <Typography className="footer-item" variant="subtitle1">
        Data provided by <a href="https://www.edhrec.com/">EDHRec</a> and{" "}
        <a href="https://www.scryfall.com/">Scryfall</a>.
      </Typography>
    </div>
  );
};

export default Footer;
