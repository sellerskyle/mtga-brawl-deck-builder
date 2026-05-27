// @ts-nocheck
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Link,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CollectionsIcon from "@mui/icons-material/Collections";
import { cleanName } from "./util";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const CollectionModal = ({ className }) => {
  const [open, setOpen] = React.useState(false);
  const [hasCollection, setHasCollection] = React.useState(false);
  const [uploadedAt, setUploadedAt] = React.useState(null);

  React.useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem("mtga_collection");
      const at = localStorage.getItem("mtga_collection_uploaded_at");
      setHasCollection(Boolean(stored));
      setUploadedAt(at);
    } catch {
      setHasCollection(false);
      setUploadedAt(null);
    }
  }, [open]);

  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const condensedData = data.reduce((acc, curr) => {
        const name = cleanName(curr.name);
        if (!acc[name]) {
          acc[name] = curr.count;
        } else {
          acc[name] = acc[name] + curr.count;
        }
        return acc;
      }, {});
      localStorage.setItem("mtga_collection", JSON.stringify(condensedData));
      const now = new Date().toISOString();
      localStorage.setItem("mtga_collection_uploaded_at", now);
      setHasCollection(true);
      setUploadedAt(now);
      alert(
        "Collection uploaded and saved to localStorage. Please refresh the page to reflect changes.",
      );
    } catch {
      alert("Failed to parse JSON file.");
    } finally {
      try {
        event.target.value = "";
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className={className}>
      <IconButton aria-label="collection" onClick={() => setOpen(true)}>
        <CollectionsIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6">Manage Collection</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                size="small"
                label={hasCollection ? "Stored" : "Empty"}
                color={hasCollection ? "success" : "default"}
              />
              <Typography variant="caption" color="text.secondary">
                {uploadedAt
                  ? new Date(uploadedAt).toLocaleString()
                  : "No upload date"}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
              p: 2,
            }}
          >
            <Card sx={{ width: "100%", maxWidth: 800, boxShadow: 3 }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: "#c52500" }}>1</Avatar>}
                title={<Typography variant="h6">Export Collection</Typography>}
                subheader="Generate a JSON export from MTGA"
              />
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Typography variant="body1">
                  Export your collection using{" "}
                  <Link
                    href="https://github.com/NthPhantom10/MTGA-collection-exporter"
                    underline="hover"
                  >
                    this tool
                  </Link>
                  .
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Depending on where MTGA files are stored, you may need to
                  clone the project, change 'base_paths', and run locally. See
                  the project README for more details.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ width: "100%", maxWidth: 800, boxShadow: 3 }}>
              <CardHeader
                avatar={<Avatar sx={{ bgcolor: "#c52500" }}>2</Avatar>}
                title={<Typography variant="h6">Upload Collection</Typography>}
                subheader="Load the exported collection JSON into local storage"
              />
              <CardContent
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Typography variant="body1" sx={{ flex: 1 }}>
                  Upload the <strong>mtga_collection.json</strong> created by
                  the tool.
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  style={{ backgroundColor: "#c52500" }}
                  startIcon={<CloudUploadIcon />}
                >
                  Upload
                  <VisuallyHiddenInput
                    type="file"
                    onChange={handleUpload}
                    multiple
                  />
                </Button>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CollectionModal;
