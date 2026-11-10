import { WorkItemDetail } from "../components/WorkItemDetail"

/** /tasks/new — the task screen (Figma 3580:8965) in edit mode over a blank record,
 *  so new and edit share one layout. Prefills from ?project= ?milestone= ?status=
 *  ?assignee=; ?from=project|manager and ?view=board decide where Cancel returns. */
export default function TaskEditorPage() {
  return <WorkItemDetail kind="task" create />
}
