import React from "react";
import ReactDOM from "react-dom/client";
import Chat from "./components/chat";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider
      theme={createTheme({
        palette: {
          mode: "dark",
        },
      })}
    >
      <CssBaseline />
      <Chat />
    </ThemeProvider>
  </React.StrictMode>
);
