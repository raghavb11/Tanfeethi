import type { ComponentType } from "react"
import { Navigate, useParams } from "react-router-dom"

import EngagementHub from "./hubs/Engagement"
import KnowledgeHub from "./hubs/Knowledge"
import ProductivityHub from "./hubs/Productivity"

const registry: Record<string, ComponentType> = {
  engagement: EngagementHub,
  // legacy alias: collaboration was merged into engagement
  collaboration: EngagementHub,
  knowledge: KnowledgeHub,
  productivity: ProductivityHub,
}

export default function PreviewHubPage() {
  const { hubId } = useParams()
  if (!hubId || !registry[hubId]) {
    return <Navigate to="/" replace />
  }
  const Component = registry[hubId]
  return <Component />
}
