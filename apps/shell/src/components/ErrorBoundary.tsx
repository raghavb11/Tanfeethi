import * as React from "react"

/** Catches render errors so a single bad component shows a message instead of
 *  unmounting the whole portal and leaving a blank screen. */
type State = { error: Error | null }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; label?: string },
  State
> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep the detail in the console for whoever is debugging.
    console.error("[ErrorBoundary]", this.props.label ?? "app", error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 text-start shadow-sm">
          <div className="text-[15px] font-bold">Something went wrong on this screen</div>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            حدث خطأ في هذه الشاشة. The rest of the portal is still working — go back, or reload.
          </p>

          <pre className="mt-4 max-h-40 overflow-auto rounded-xl border border-border/60 bg-muted/30 p-3 text-[11.5px] leading-relaxed text-muted-foreground">
            {error.message}
          </pre>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => this.setState({ error: null })}
              className="rounded-xl border border-border/60 px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-muted/40"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    )
  }
}
