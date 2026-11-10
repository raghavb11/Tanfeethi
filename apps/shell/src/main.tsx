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

// Date/time fields: the app hides the native calendar button (custom icons
// sit on top, and in RTL they don't line up), so open the picker from a click
// anywhere in the field.
const PICKER_TYPES = new Set(["date", "time", "datetime-local", "month", "week"])
document.addEventListener("click", (e) => {
  const el = e.target
  if (!(el instanceof HTMLInputElement) || !PICKER_TYPES.has(el.type) || el.disabled || el.readOnly) return
  try { el.showPicker() } catch { /* not supported or already open */ }
})

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
