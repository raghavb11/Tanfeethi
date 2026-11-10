import { useShell } from "@reach/shell-context"

import { team } from "./team"

/** "?persona=staff" demos the non-manager view for this load (read once, like "?lang=").
 *  The app runs under a hash router, so look in both the search and the hash query. */
const PERSONA_STAFF = (() => {
  try {
    const hashQuery = window.location.hash.split("?")[1] ?? ""
    return new URLSearchParams(`${window.location.search}&${hashQuery}`).get("persona") === "staff"
  } catch {
    return false
  }
})()

/** The signed-in employee is a line manager when he has direct reports
 *  (the same roster the board's "My team" scope uses). */
const isManager = () => !PERSONA_STAFF && team.length > 0

/** Owner rule: only managers and admins define sprints (create, edit, close,
 *  archive). Everyone else reads them and can still plan a task into one.
 *  Prototype UI rule only — the real app must enforce it server-side (BUILD-GUIDELINES S4). */
export function useCanManageSprints(): boolean {
  const { role } = useShell()
  return role === "admin" || isManager()
}
