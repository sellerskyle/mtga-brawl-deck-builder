// @ts-nocheck
import ThemeContextProvider from "../ThemeContextProvider";
import Header from "../Header";
import Footer from "../Footer";
import CardTable from "../CardTable";
import React from "react";
import { Popper } from "@mui/material";
import { useArenaCards } from "../hooks/useArenaCards";

const AllCards = () => {
  const [previewImage, setPreviewImage] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { arenaCards } = useArenaCards();

  return (
    <ThemeContextProvider>
      <Header />
      <div className="main-content" style={{ height: "100%" }}>
        <CardTable
          data={arenaCards.map((card) => ({ ...card, id: card.name }))}
          onNameHoverStart={(element, image) => {
            setAnchorEl(element);
            setPreviewImage(image);
          }}
          onNameHoverEnd={() => {
            setAnchorEl(null);
            setPreviewImage(null);
          }}
        />
      </div>
      {!!previewImage && (
        <Popper
          sx={{ zIndex: 4000 }}
          open={!!previewImage}
          anchorEl={anchorEl}
          placement={"right"}
        >
          <img
            loading="lazy"
            src={previewImage}
            style={{
              borderRadius: "4.75% / 3.5%",
              aspectRatio: 5 / 7,
              width: "15em",
              marginLeft: "4em",
            }}
          />
        </Popper>
      )}
      <Footer />
    </ThemeContextProvider>
  );
};

export default AllCards;
