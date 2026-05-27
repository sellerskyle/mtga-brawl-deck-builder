// @ts-nocheck
import ThemeContextProvider from "../ThemeContextProvider";
import Header from "../Header";
import Footer from "../Footer";
import React from "react";
import {
  Box,
  Button,
  Link,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { cleanName } from "../util";

const STEPS = {
  EXPORT: {
    name: "Export Collection",
    index: 0,
  },
  UPLOAD: {
    name: "Upload Collection",
    index: 1,
  },
};

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

const Collection = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  console.log(activeStep);

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
      console.log("Saved collection to localStorage", condensedData);
      alert("Collection uploaded and saved to localStorage.");
    } catch (err) {
      console.error("Failed to read or parse file", err);
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
    <ThemeContextProvider>
      <Header />
      <div className="main-content" style={{ height: "100%" }}>
        <Stepper activeStep={activeStep}>
          {Object.values(STEPS).map(({ name }) => (
            <Step key={name}>
              <StepLabel>{name}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <React.Fragment>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              p: 2,
            }}
          >
            {activeStep === STEPS.EXPORT.index && (
              <Box
                style={{ display: "flex", flexDirection: "column", gap: "1em" }}
              >
                <Typography variant="h5">
                  Export your collection using{" "}
                  <Link href="#" underline="hover">
                    this tool
                  </Link>
                  .
                </Typography>
                <Typography variant="h5">
                  Depending on where MTGA files are stored, you may need to
                  clone the project, change 'base_paths', and run locally. See
                  the project README for more details.
                </Typography>
              </Box>
            )}
            {activeStep === STEPS.UPLOAD.index && (
              <Box
                style={{ display: "flex", flexDirection: "column", gap: "1em" }}
              >
                <Typography variant="h5">
                  Upload the 'mtga_collection.json' created by the tool.
                </Typography>
                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                >
                  Upload
                  <VisuallyHiddenInput
                    type="file"
                    onChange={handleUpload}
                    multiple
                  />
                </Button>
              </Box>
            )}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button
              disabled={activeStep === Object.values(STEPS).length - 1}
              onClick={() =>
                setActiveStep((prev) =>
                  Math.min(prev + 1, Object.values(STEPS).length - 1),
                )
              }
            >
              {"Next"}
            </Button>
          </Box>
        </React.Fragment>
      </div>
      <Footer />
    </ThemeContextProvider>
  );
};

export default Collection;
