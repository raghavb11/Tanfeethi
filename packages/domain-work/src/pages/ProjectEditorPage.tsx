import { Navigate, useParams } from "react-router-dom"

import { WorkItemDetail } from "../components/WorkItemDetail"

/** /projects/new — the project screen (Figma 3580:8667) in edit mode over a blank
 *  record, so new and edit share one layout. ?from=task&back=… returns to the task
 *  form that asked for it, with the new project picked.
 *  /projects/:id/edit — the old routed form; editing is inline now (?edit=1). */
export default function ProjectEditorPage() {
  const { id } = useParams()
  if (id) return <Navigate to={`/projects/${id}?edit=1`} replace />
  return <WorkItemDetail kind="project" create />
}
