import { StrictMode } from "react"
import { MotionGlobalConfig } from "framer-motion"
import { createRoot } from "react-dom/client"
import { HashRouter } from "react-router-dom"

import { TooltipProvider } from "@reach/shared-ui"
import { ShellProvider } from "@reach/shell-context"
import { ThemeProvider } from "./providers/theme-provider"
import { ErrorBoundary } from "./components/ErrorBoundary"
import App from "./App.tsx"
import "./index.css"

// Pixel-comparison runs (scripts/pixel) load "/?static#/route": skip entrance
// animations so headless captures show the settled layout.
if (new URLSearchParams(window.location.search).has("static")) {
  MotionGlobalConfig.skipAnimations = true
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary label="root">
    <ThemeProvider>
      <TooltipProvider>
        <ShellProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </ShellProvider>
      </TooltipProvider>
    </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
)
