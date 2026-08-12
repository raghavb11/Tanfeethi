import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import { TooltipProvider } from "@reach/shared-ui"
import { ShellProvider } from "@reach/shell-context"
import { ThemeProvider } from "./providers/theme-provider"
import App from "./App.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider>
        <ShellProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ShellProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>
)
