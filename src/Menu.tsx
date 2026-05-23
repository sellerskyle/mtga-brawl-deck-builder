// @ts-nocheck
import {
  Menu as MuiMenu,
  MenuOpen,
  Inbox,
  Mail,
  Add,
  LibraryAdd,
  FormatListNumbered,
} from "@mui/icons-material";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const pages = [
  {
    name: "Create Deck",
    icon: <LibraryAdd />,
    to: "/",
  },
  {
    name: "All Cards",
    icon: <FormatListNumbered />,
    to: "/all-cards",
  },
];

const Menu = ({ className }) => {
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();
  return (
    <>
      <IconButton className={className} onClick={() => setOpen((cur) => !cur)}>
        {!open ? (
          <MuiMenu fontSize="inherit" />
        ) : (
          <MenuOpen fontSize="inherit" />
        )}
      </IconButton>
      <Drawer open={open} onClose={() => setOpen((cur) => !cur)}>
        <Box sx={{ width: "100%" }} onClick={() => setOpen(false)}>
          <List>
            {pages.map((page) => (
              <ListItem
                key={page.name}
                onClick={() => navigate(page.to)}
                disablePadding
              >
                <ListItemButton>
                  <ListItemIcon>{page.icon}</ListItemIcon>
                  <ListItemText
                    sx={{ pt: "1em", pb: "1em" }}
                    primary={page.name}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Menu;
