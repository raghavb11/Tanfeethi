import { useParams } from "react-router-dom"

import { WorkItemDetail } from "../components/WorkItemDetail"

/** One task — Figma 3580:8521 (view), 3580:8965 (edit, ?edit=1),
 *  3580:9423 (release note edited inline). */
export default function TaskDetailPage() {
  const { id = "" } = useParams()
  return <WorkItemDetail kind="task" id={id} />
}
