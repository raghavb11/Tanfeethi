import { useParams } from "react-router-dom"

import { WorkItemDetail } from "../components/WorkItemDetail"

/** One project — Figma 3580:8261 (view), 3580:8667 (edit, ?edit=1),
 *  3580:9156 (release note edited inline). Milestones are kept as a card. */
export default function ProjectDetailPage() {
  const { id = "" } = useParams()
  return <WorkItemDetail kind="project" id={id} />
}
