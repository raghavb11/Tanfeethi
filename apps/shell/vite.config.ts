import fs from "node:fs"
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

// Data file that persists authored CMS content across dev-server restarts.
const DATA_FILE = path.resolve(__dirname, "cms-data.json")
// Data file for the generic keyed collection stores (announcements, events, …).
const COLLECTIONS_FILE = path.resolve(__dirname, "collections-data.json")

/** Keyed collection store: GET returns the whole { key: items } map; POST
 *  { key, items } merges just that collection (so modules don't clobber each
 *  other). Dev-server only. */
function collectionsFileApi(): Plugin {
  const readAll = (): Record<string, unknown> => {
    try {
      return JSON.parse(fs.readFileSync(COLLECTIONS_FILE, "utf8"))
    } catch {
      return {}
    }
  }
  return {
    name: "collections-file-api",
    configureServer(server) {
      server.middlewares.use("/api/collections", (req, res) => {
        if (req.method === "GET") {
          res.setHeader("Content-Type", "application/json")
          res.end(JSON.stringify(readAll()))
          return
        }
        if (req.method === "POST") {
          let body = ""
          req.on("data", (chunk) => (body += chunk))
          req.on("end", () => {
            try {
              const { key, items } = JSON.parse(body || "{}")
              if (key) {
                const all = readAll()
                all[key] = items
                fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(all))
              }
            } catch {
              /* ignore write errors */
            }
            res.statusCode = 204
            res.end()
          })
          return
        }
        res.statusCode = 405
        res.end()
      })
    },
  }
}

/** Tiny file-backed API for the CMS store: GET/POST /api/cms.
 *  Dev-server only — a production build would use the real backend. */
function cmsFileApi(): Plugin {
  return {
    name: "cms-file-api",
    configureServer(server) {
      server.middlewares.use("/api/cms", (req, res) => {
        if (req.method === "GET") {
          let data = "{}"
          try {
            data = fs.readFileSync(DATA_FILE, "utf8")
          } catch {
            /* no file yet — return empty */
          }
          res.setHeader("Content-Type", "application/json")
          res.end(data)
          return
        }
        if (req.method === "POST") {
          let body = ""
          req.on("data", (chunk) => (body += chunk))
          req.on("end", () => {
            try {
              fs.writeFileSync(DATA_FILE, body || "{}")
            } catch {
              /* ignore write errors */
            }
            res.statusCode = 204
            res.end()
          })
          return
        }
        res.statusCode = 405
        res.end()
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  // Relative base so the built app works when served from a subpath
  // (GitHub Pages project site, e.g. /Tanfeethi/). Root in dev.
  base: mode === "production" ? "./" : "/",
  plugins: [react(), tailwindcss(), cmsFileApi(), collectionsFileApi()],
  server: {
    // Don't trigger an HMR reload when the data files are written.
    watch: { ignored: ["**/cms-data.json", "**/collections-data.json"] },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy, rarely-changing vendor libs into their own long-lived
        // cache chunks so they aren't re-downloaded on every app deploy. Route
        // chunks are produced automatically by the React.lazy splits in App.tsx.
        manualChunks(id) {
          if (!id.includes("node_modules")) return
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id))
            return "vendor-react"
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id))
            return "vendor-motion"
          if (id.includes("@radix-ui") || id.includes("@base-ui")) return "vendor-radix"
        },
      },
    },
  },
}))
