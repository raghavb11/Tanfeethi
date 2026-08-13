import { lazy } from "react"
import { Route, Routes } from "react-router-dom"

import { AppShell } from "@/layouts/AppShell"

// Route-based code splitting: each domain ships as its own chunk and is only
// fetched when its route is first visited (docs/ARCHITECTURE.md §8). The domain
// barrels export their page as a named export, so map it onto `default` for
// React.lazy.
const DashboardPage = lazy(() =>
  import("@reach/domain-dashboard").then((m) => ({ default: m.DashboardPage })),
)
const WorkPage = lazy(() =>
  import("@reach/domain-work").then((m) => ({ default: m.WorkPage })),
)
const MyTasksPage = lazy(() =>
  import("@reach/domain-work").then((m) => ({ default: m.MyTasksPage })),
)
const TaskDetailPage = lazy(() =>
  import("@reach/domain-work").then((m) => ({ default: m.TaskDetailPage })),
)
const EmployeePage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.EmployeePage })),
)
const ServicesPage = lazy(() =>
  import("@reach/domain-services").then((m) => ({ default: m.ServicesPage })),
)
const IntelligencePage = lazy(() =>
  import("@reach/domain-intelligence").then((m) => ({ default: m.IntelligencePage })),
)
const SurveysPage = lazy(() =>
  import("@reach/domain-surveys").then((m) => ({ default: m.SurveysPage })),
)
const SurveyBuilderPage = lazy(() =>
  import("@reach/domain-surveys").then((m) => ({ default: m.SurveyBuilderPage })),
)
const SurveyRespondPage = lazy(() =>
  import("@reach/domain-surveys").then((m) => ({ default: m.SurveyRespondPage })),
)
const NewsPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.NewsPage })))
const NewsEditorPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.NewsEditorPage })))
const ArticleReaderPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.ArticleReaderPage })))
const CircularEditorPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.CircularEditorPage })))
const CircularsPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.CircularsPage })))
const EventsPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.EventsPage })))
const EventEditorPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.EventEditorPage })))
const EventDetailPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.EventDetailPage })))
const PoliciesPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.PoliciesPage })))
const PolicyReaderPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.PolicyReaderPage })))
const PolicyEditorPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.PolicyEditorPage })))
const FAQsPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.FAQsPage })))
const FAQEditorPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.FAQEditorPage })))
const FaqCategoriesPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.FaqCategoriesPage })))
const DocumentsPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.DocumentsPage })))
const DocumentPreviewPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.DocumentPreviewPage })))
const DocumentEditorPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.DocumentEditorPage })))
const QuickLinksPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.QuickLinksPage })))
const CommunityPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.CommunityPage })))
const CmsAdminPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.CmsAdminPage })))
const AnnouncementsPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.AnnouncementsPage })))
const AnnouncementDetailPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.AnnouncementDetailPage })))
const AnnouncementEditorPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.AnnouncementEditorPage })))
const NotificationsAdminPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.NotificationsAdminPage })))
const RolesPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.RolesPage })))
const PermissionGroupEditorPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.PermissionGroupEditorPage })))
const PermissionGroupMembersPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.PermissionGroupMembersPage })))
const AuditLogPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.AuditLogPage })))
const PreviewHubPage = lazy(() =>
  import("@reach/domain-preview").then((m) => ({ default: m.PreviewHubPage })),
)

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="work" element={<WorkPage />} />
        <Route path="tasks" element={<MyTasksPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="employee" element={<EmployeePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="intelligence" element={<IntelligencePage />} />
        <Route path="surveys" element={<SurveysPage />} />
        <Route path="surveys/new" element={<SurveyBuilderPage />} />
        <Route path="surveys/:id/respond" element={<SurveyRespondPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/new" element={<NewsEditorPage />} />
        <Route path="news/edit/:id" element={<NewsEditorPage />} />
        <Route path="news/:id" element={<ArticleReaderPage />} />
        <Route path="circulars" element={<CircularsPage />} />
        <Route path="circulars/new" element={<CircularEditorPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/new" element={<EventEditorPage />} />
        <Route path="events/edit/:id" element={<EventEditorPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="policies" element={<PoliciesPage />} />
        <Route path="policies/new" element={<PolicyEditorPage />} />
        <Route path="policies/edit/:id" element={<PolicyEditorPage />} />
        <Route path="policies/:id" element={<PolicyReaderPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="documents/new" element={<DocumentEditorPage />} />
        <Route path="documents/:id" element={<DocumentPreviewPage />} />
        <Route path="links" element={<QuickLinksPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="cms" element={<CmsAdminPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="announcements/new" element={<AnnouncementEditorPage />} />
        <Route path="announcements/edit/:id" element={<AnnouncementEditorPage />} />
        <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="faqs" element={<FAQsPage />} />
        <Route path="faqs/new" element={<FAQEditorPage />} />
        <Route path="faqs/edit/:id" element={<FAQEditorPage />} />
        <Route path="admin/faq-categories" element={<FaqCategoriesPage />} />
        <Route path="admin/notifications" element={<NotificationsAdminPage />} />
        <Route path="admin/roles" element={<RolesPage />} />
        <Route path="admin/permission-groups" element={<RolesPage />} />
        <Route path="admin/permission-groups/new" element={<PermissionGroupEditorPage />} />
        <Route path="admin/permission-groups/edit/:id" element={<PermissionGroupEditorPage />} />
        <Route path="admin/permission-groups/:id" element={<PermissionGroupMembersPage />} />
        <Route path="admin/audit" element={<AuditLogPage />} />
        <Route path="hubs/:hubId" element={<PreviewHubPage />} />
      </Route>
    </Routes>
  )
}
