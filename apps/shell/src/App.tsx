import * as React from "react"
import { lazy } from "react"
import { Route, Routes, Navigate } from "react-router-dom"

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
const TaskEditorPage = lazy(() =>
  import("@reach/domain-work").then((m) => ({ default: m.TaskEditorPage })),
)
const ProjectsPage = lazy(() =>
  import("@reach/domain-work").then((m) => ({ default: m.ProjectsPage })),
)
const ProjectEditorPage = lazy(() =>
  import("@reach/domain-work").then((m) => ({ default: m.ProjectEditorPage })),
)
const ProjectDetailPage = lazy(() =>
  import("@reach/domain-work").then((m) => ({ default: m.ProjectDetailPage })),
)
const MilestoneEditorPage = lazy(() =>
  import("@reach/domain-work").then((m) => ({ default: m.MilestoneEditorPage })),
)
const EmployeePage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.EmployeePage })),
)
const LeaveBalancesPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.LeaveBalancesPage })),
)
const LeaveRequestPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.LeaveRequestPage })),
)
const AttendancePage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.AttendancePage })),
)
const OrgChartPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.OrgChartPage })),
)
const DirectoryPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.DirectoryPage })),
)
const BenefitsPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.BenefitsPage })),
)
const PartnerOffersPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.PartnerOffersPage })),
)
const PartnerOfferPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.PartnerOfferPage })),
)
const PartnersAdminPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.PartnersAdminPage })),
)
const PartnerEditorPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.PartnerEditorPage })),
)
const PartnerPortalPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.PartnerPortalPage })),
)
const PartnerOfferEditorPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.PartnerOfferEditorPage })),
)
const PartnerVouchersPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.PartnerVouchersPage })),
)
const DependantsPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.DependantsPage })),
)
const DependantEditorPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.DependantEditorPage })),
)
const PayslipPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.PayslipPage })),
)
const BusinessCardPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.BusinessCardPage })),
)
const ManagerDashboardPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.ManagerDashboardPage })),
)
const ApprovalDetailPage = lazy(() =>
  import("@reach/domain-employee").then((m) => ({ default: m.ApprovalDetailPage })),
)
const HomeV2 = lazy(() => import("@/pages/HomeV2"))
const NotificationHistoryPage = lazy(() => import("@/pages/NotificationHistory"))
const ServiceCatalogPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.ServiceCatalogPage })))
const TechnicalServicesPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.TechnicalServicesPage })))
const ServiceRequestPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.ServiceRequestPage })))
const ReportFaultPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.ReportFaultPage })))
const ServicesHistoryPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.ServicesHistoryPage })))
const StepsLeaderboardPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.StepsLeaderboardPage })))
const WaiterRequestPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.WaiterRequestPage })))
const ViolationsHubPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.ViolationsHubPage })))
const ViolationReportFormPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.ViolationReportFormPage })))
const ViolationFollowUpPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.ViolationFollowUpPage })))
const ViolationReportDetailPage = lazy(() => import("@reach/domain-services").then((m) => ({ default: m.ViolationReportDetailPage })))
const CalendarPage = lazy(() => import("@reach/domain-work").then((m) => ({ default: m.CalendarPage })))
const CalendarEventEditorPage = lazy(() => import("@reach/domain-work").then((m) => ({ default: m.CalendarEventEditorPage })))
const ProfilePage = lazy(() => import("@reach/domain-employee").then((m) => ({ default: m.ProfilePage })))
const AssetsPage = lazy(() => import("@reach/domain-employee").then((m) => ({ default: m.AssetsPage })))
const ShiftsPage = lazy(() => import("@reach/domain-employee").then((m) => ({ default: m.ShiftsPage })))
const OperationsHubPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.OperationsHubPage })))
const ChecklistRunPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.ChecklistRunPage })))
const DelegationRequestPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.DelegationRequestPage })))
const IncentivesPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.IncentivesPage })))
const EvaluationsLogPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.EvaluationsLogPage })))
const EmployeeEvaluationsPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.EmployeeEvaluationsPage })))
const EvaluationDetailPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.EvaluationDetailPage })))
const PersonalEvaluationPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.PersonalEvaluationPage })))
const GoalsListPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.GoalsListPage })))
const MyGoalResultsPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.MyGoalResultsPage })))
const HalfYearReviewPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.HalfYearReviewPage })))
const AnnualReviewPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.AnnualReviewPage })))
const MyChecklistEvaluationsPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.MyChecklistEvaluationsPage })))
const EmployeeReviewPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.EmployeeReviewPage })))
const TeamAnnualReviewPage = lazy(() => import("@reach/domain-operations").then((m) => ({ default: m.TeamAnnualReviewPage })))
const LearningPage = lazy(() => import("@reach/domain-learning").then((m) => ({ default: m.LearningPage })))
const ServicesPage = lazy(() =>
  import("@reach/domain-services").then((m) => ({ default: m.ServicesPage })),
)
const CafeteriaPage = lazy(() =>
  import("@reach/domain-services").then((m) => ({ default: m.CafeteriaPage })),
)
const CafeteriaOrdersPage = lazy(() =>
  import("@reach/domain-services").then((m) => ({ default: m.CafeteriaOrdersPage })),
)
const CafeteriaAdminPage = lazy(() =>
  import("@reach/domain-services").then((m) => ({ default: m.CafeteriaAdminPage })),
)
const TeaBoyLoginPage = lazy(() =>
  import("@reach/domain-services").then((m) => ({ default: m.TeaBoyLoginPage })),
)
const TeaBoyQueuePage = lazy(() =>
  import("@reach/domain-services").then((m) => ({ default: m.TeaBoyQueuePage })),
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
const ConfigurationPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.ConfigurationPage })))
const RuleEngineListPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.RuleEngineListPage })))
const RuleEditorPage = lazy(() => import("@reach/domain-content").then((m) => ({ default: m.RuleEditorPage })))
const HolidayCalendarPage = lazy(() =>
  import("@reach/domain-content").then((m) => ({ default: m.HolidayCalendarPage })),
)
const HolidayEditorPage = lazy(() =>
  import("@reach/domain-content").then((m) => ({ default: m.HolidayEditorPage })),
)
const MasterDataPage = lazy(() =>
  import("@reach/domain-content").then((m) => ({ default: m.MasterDataPage })),
)
const MasterRowEditorPage = lazy(() =>
  import("@reach/domain-content").then((m) => ({ default: m.MasterRowEditorPage })),
)
const CafeteriaConfigPage = lazy(() =>
  import("@reach/domain-services").then((m) => ({ default: m.CafeteriaConfigPage })),
)
const CafeteriaItemEditorPage = lazy(() =>
  import("@reach/domain-services").then((m) => ({ default: m.CafeteriaItemEditorPage })),
)
const PreviewHubPage = lazy(() =>
  import("@reach/domain-preview").then((m) => ({ default: m.PreviewHubPage })),
)
const KnowledgeCenterPage = lazy(() =>
  import("@reach/domain-preview").then((m) => ({ default: m.KnowledgeCenterPage })),
)

export default function App() {
  return (
    <Routes>
      <Route
        path="v2"
        element={
          <React.Suspense fallback={null}>
            <HomeV2 />
          </React.Suspense>
        }
      />
      <Route path="tea-boy/login" element={<React.Suspense fallback={null}><TeaBoyLoginPage /></React.Suspense>} />
      <Route path="tea-boy" element={<React.Suspense fallback={null}><TeaBoyQueuePage /></React.Suspense>} />
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="notifications" element={<NotificationHistoryPage />} />
        <Route path="work" element={<WorkPage />} />
        <Route path="tasks" element={<MyTasksPage />} />
        <Route path="tasks/new" element={<TaskEditorPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="employee" element={<EmployeePage />} />
        <Route path="employee/card" element={<BusinessCardPage />} />
        <Route path="employee/assets" element={<AssetsPage />} />
        <Route path="employee/shifts" element={<ShiftsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="employee/dependants" element={<DependantsPage />} />
        <Route path="employee/dependants/new" element={<DependantEditorPage />} />
        <Route path="employee/dependants/:id" element={<DependantEditorPage />} />
        <Route path="manager" element={<ManagerDashboardPage />} />
        {/* team tasks merged into /tasks — keep old links working */}
        <Route path="manager/tasks" element={<Navigate to="/tasks?scope=team" replace />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<ProjectEditorPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="projects/:id/edit" element={<ProjectEditorPage />} />
        <Route path="projects/:id/milestones/new" element={<MilestoneEditorPage />} />
        <Route path="projects/:id/milestones/:mid/edit" element={<MilestoneEditorPage />} />
        <Route path="manager/approvals/:id" element={<ApprovalDetailPage />} />
        <Route path="leave" element={<LeaveBalancesPage />} />
        <Route path="leave/request" element={<LeaveRequestPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="org-chart" element={<OrgChartPage />} />
        <Route path="directory" element={<DirectoryPage />} />
        <Route path="benefits" element={<BenefitsPage />} />
        <Route path="benefits/partners" element={<PartnerOffersPage />} />
        <Route path="benefits/partners/:id" element={<PartnerOfferPage />} />
        {/* administration: the partner master and the review queue */}
        <Route path="config/partners" element={<PartnersAdminPage />} />
        <Route path="config/partners/new" element={<PartnerEditorPage />} />
        <Route path="config/partners/:id/edit" element={<PartnerEditorPage />} />
        {/* the partner's own area — their offers and nothing else */}
        <Route path="partner" element={<PartnerPortalPage />} />
        <Route path="partner/offers/new" element={<PartnerOfferEditorPage />} />
        <Route path="partner/offers/:id/edit" element={<PartnerOfferEditorPage />} />
        <Route path="partner/vouchers" element={<PartnerVouchersPage />} />
        <Route path="payslip" element={<PayslipPage />} />
        <Route path="services" element={<ServicesPage />} />
        {/* specific catalog routes before :catalogId */}
        <Route path="services/catalog/it/technical" element={<TechnicalServicesPage />} />
        <Route path="services/catalog/it/report-fault" element={<ReportFaultPage />} />
        <Route path="services/catalog/:catalogId" element={<ServiceCatalogPage />} />
        <Route path="services/request/:serviceId" element={<ServiceRequestPage />} />
        <Route path="services/history" element={<ServicesHistoryPage />} />
        <Route path="services/health" element={<StepsLeaderboardPage />} />
        <Route path="services/hospitality/waiter" element={<WaiterRequestPage />} />
        <Route path="services/violations" element={<ViolationsHubPage />} />
        <Route path="services/violations/new" element={<ViolationReportFormPage />} />
        <Route path="services/violations/reports" element={<ViolationFollowUpPage mode="reporter" />} />
        <Route path="services/violations/reports/:reportId" element={<ViolationReportDetailPage mode="reporter" />} />
        <Route path="services/violations/queue" element={<ViolationFollowUpPage mode="investigator" />} />
        <Route path="services/violations/queue/:reportId" element={<ViolationReportDetailPage mode="investigator" />} />
        <Route path="cafeteria" element={<CafeteriaPage />} />
        <Route path="cafeteria/orders" element={<CafeteriaOrdersPage />} />
        <Route path="cafeteria/admin" element={<CafeteriaAdminPage />} />
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
        <Route path="config" element={<ConfigurationPage />} />
        <Route path="config/rules" element={<RuleEngineListPage />} />
        <Route path="config/rules/:id" element={<RuleEditorPage />} />
        <Route path="config/holidays" element={<HolidayCalendarPage />} />
        <Route path="config/holidays/new" element={<HolidayEditorPage />} />
        <Route path="config/holidays/:id" element={<HolidayEditorPage />} />
        <Route path="config/master-data" element={<MasterDataPage />} />
        <Route path="config/master-data/:list/new" element={<MasterRowEditorPage />} />
        <Route path="config/master-data/:list/:id" element={<MasterRowEditorPage />} />
        <Route path="config/cafeteria" element={<CafeteriaConfigPage />} />
        <Route path="config/cafeteria/items/new" element={<CafeteriaItemEditorPage kind="item" />} />
        <Route path="config/cafeteria/items/:id" element={<CafeteriaItemEditorPage kind="item" />} />
        <Route path="config/cafeteria/places/new" element={<CafeteriaItemEditorPage kind="place" />} />
        <Route path="config/cafeteria/places/:id" element={<CafeteriaItemEditorPage kind="place" />} />
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
        <Route path="knowledge" element={<KnowledgeCenterPage />} />
        <Route path="hubs/:hubId" element={<PreviewHubPage />} />
        {/* WIJHA rail destinations — stand-ins until their pages land */}
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="calendar/new" element={<CalendarEventEditorPage />} />
        <Route path="calendar/:id/edit" element={<CalendarEventEditorPage />} />
        <Route path="learning" element={<LearningPage />} />
        <Route path="operations" element={<OperationsHubPage />} />
        <Route path="operations/checklists/:runId" element={<ChecklistRunPage />} />
        <Route path="operations/delegation/new" element={<DelegationRequestPage />} />
        <Route path="operations/incentives" element={<IncentivesPage />} />
        <Route path="operations/evaluations" element={<EvaluationsLogPage />} />
        <Route path="operations/evaluations/employee/:employeeId" element={<EmployeeEvaluationsPage />} />
        <Route path="operations/evaluations/:evaluationId" element={<EvaluationDetailPage />} />
        <Route path="operations/personal" element={<PersonalEvaluationPage />} />
        <Route path="operations/personal/goals" element={<GoalsListPage />} />
        <Route path="operations/personal/history" element={<MyGoalResultsPage />} />
        <Route path="operations/personal/half-year" element={<HalfYearReviewPage />} />
        <Route path="operations/personal/annual" element={<AnnualReviewPage />} />
        <Route path="operations/personal/operational-log" element={<MyChecklistEvaluationsPage />} />
        <Route path="operations/evaluate" element={<TeamAnnualReviewPage />} />
        <Route path="operations/evaluate/:employeeId" element={<EmployeeReviewPage />} />
      </Route>
    </Routes>
  )
}
