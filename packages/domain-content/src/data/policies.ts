import { createCollection, newId } from "../collections"

export type Policy = {
  id: string
  number: string
  title: string
  titleAr: string
  categories: string[]
  allDepartments?: boolean
  departments?: string[]
  version: string
  effective: string
  effectiveAr: string
  owner: string
  ownerAr: string
  summary: string
  summaryAr: string
  body?: string
  relatedDocs?: string[]
  applicableFrom?: string
  applicableTill?: string | null
  requiresAck?: boolean
  ackBaseline?: number
  acknowledgedBy?: string[]
  supersedes?: string | null
  supersededBy?: string | null
  status?: "active" | "sunset"
  featured?: boolean
}

export const POLICY_CATS = ["All", "Governance", "People", "Finance", "IT", "Operations"]
export const POLICY_CAT_META: Record<string, { ar: string; color: string }> = {
  Governance: { ar: "الحوكمة", color: "#c8794f" },
  People: { ar: "الموظفون", color: "#3f9d94" },
  Finance: { ar: "المالية", color: "#5f9d52" },
  IT: { ar: "تقنية المعلومات", color: "#5b8fce" },
  Operations: { ar: "العمليات", color: "#c99a3a" },
}
export const POLICY_CATS_AR: Record<string, string> = { All: "الكل", Governance: "الحوكمة", People: "الموظفون", Finance: "المالية", IT: "تقنية المعلومات", Operations: "العمليات" }
export const policyCatColor = (name: string) => POLICY_CAT_META[name]?.color
export const policyCatAr = (name: string) => POLICY_CAT_META[name]?.ar ?? name

const POLICIES: Policy[] = [
  { id: "p1", number: "TF-POL-001", title: "Code of Conduct", titleAr: "مدونة السلوك", categories: ["Governance"], allDepartments: true, version: "v3.1", effective: "Jan 1, 2026", effectiveAr: "١ يناير ٢٠٢٦", owner: "Legal & Compliance", ownerAr: "الشؤون القانونية والامتثال", summary: "The standards of behaviour, ethics and integrity expected of everyone at Tanfeethi.", summaryAr: "معايير السلوك والأخلاق والنزاهة المتوقعة من الجميع في التنفيذي.", requiresAck: true, ackBaseline: 612, featured: true },
  { id: "p2", number: "TF-POL-014", title: "Travel & Expense Policy", titleAr: "سياسة السفر والمصروفات", categories: ["Finance", "Operations"], allDepartments: true, version: "v2.4", effective: "Aug 2, 2026", effectiveAr: "٢ أغسطس ٢٠٢٦", owner: "Finance", ownerAr: "المالية", summary: "Booking, limits and reimbursement rules for business travel and expenses.", summaryAr: "قواعد الحجز والحدود والاسترداد لسفر ومصروفات العمل.", featured: true },
  { id: "p3", number: "TF-POL-022", title: "Leave & Attendance Policy", titleAr: "سياسة الإجازات والحضور", categories: ["People"], allDepartments: true, version: "v1.9", effective: "Mar 15, 2026", effectiveAr: "١٥ مارس ٢٠٢٦", owner: "People & Culture", ownerAr: "الموظفون والثقافة", summary: "Annual, sick and special leave entitlements and how attendance is recorded.", summaryAr: "استحقاقات الإجازات السنوية والمرضية والخاصة وكيفية تسجيل الحضور." },
  { id: "p4", number: "TF-POL-031", title: "Information Security Policy", titleAr: "سياسة أمن المعلومات", categories: ["IT", "Governance"], allDepartments: true, version: "v4.0", effective: "Feb 1, 2026", effectiveAr: "١ فبراير ٢٠٢٦", owner: "IT & Security", ownerAr: "تقنية المعلومات والأمن", summary: "Acceptable use, data handling and access rules across company systems and devices.", summaryAr: "الاستخدام المقبول ومعالجة البيانات وقواعد الوصول عبر أنظمة وأجهزة الشركة.", requiresAck: true, ackBaseline: 781 },
  { id: "p5", number: "TF-POL-018", title: "Procurement Policy", titleAr: "سياسة المشتريات", categories: ["Finance"], allDepartments: false, departments: ["dep-finance", "dep-commercial"], version: "v2.0", effective: "Jul 25, 2026", effectiveAr: "٢٥ يوليو ٢٠٢٦", owner: "Procurement", ownerAr: "المشتريات", summary: "The approval matrix and supplier rules governing purchases by value.", summaryAr: "مصفوفة الاعتماد وقواعد الموردين التي تحكم المشتريات حسب القيمة." },
  { id: "p6", number: "TF-POL-009", title: "Health, Safety & Environment", titleAr: "الصحة والسلامة والبيئة", categories: ["Operations"], allDepartments: false, departments: ["dep-ops", "dep-ground"], version: "v1.5", effective: "Jun 10, 2026", effectiveAr: "١٠ يونيو ٢٠٢٦", owner: "HSE", ownerAr: "الصحة والسلامة", summary: "Safety standards and responsibilities across offices and operational sites.", summaryAr: "معايير السلامة والمسؤوليات عبر المكاتب والمواقع التشغيلية.", requiresAck: true, ackBaseline: 480 },
  { id: "p7", number: "TF-POL-027", title: "Remote & Flexible Working", titleAr: "العمل عن بُعد والمرن", categories: ["People"], allDepartments: true, version: "v1.2", effective: "May 5, 2026", effectiveAr: "٥ مايو ٢٠٢٦", owner: "People & Culture", ownerAr: "الموظفون والثقافة", summary: "Eligibility and expectations for hybrid, remote and flexible arrangements.", summaryAr: "الأهلية والتوقعات لترتيبات العمل الهجين وعن بُعد والمرن." },
  { id: "p8", number: "TF-POL-005", title: "Data Privacy & Protection", titleAr: "خصوصية وحماية البيانات", categories: ["Governance", "IT"], allDepartments: true, version: "v2.1", effective: "Apr 18, 2026", effectiveAr: "١٨ أبريل ٢٠٢٦", owner: "Legal & Compliance", ownerAr: "الشؤون القانونية والامتثال", summary: "How personal data is collected, used and protected in line with regulation.", summaryAr: "كيفية جمع البيانات الشخصية واستخدامها وحمايتها وفق اللوائح.", requiresAck: true, ackBaseline: 430 },
]

const store = createCollection<Policy>(POLICIES, "policies")
export const usePolicies = () => store.use()
export const getPolicyById = (id: string) => store.getById(id)
export const addPolicy = (p: Policy) => store.append(p)
export const updatePolicy = (id: string, patch: Partial<Policy>) => store.update(id, patch)
export const deletePolicy = (id: string) => store.remove(id)

/** Record an acknowledgement by a user (idempotent). */
export function acknowledgePolicy(id: string, userId: string) {
  const p = store.getById(id)
  if (!p) return
  const acked = p.acknowledgedBy ?? []
  if (!acked.includes(userId)) store.update(id, { acknowledgedBy: [...acked, userId] })
}

/** Mark that `newId` supersedes `oldId`; the older policy either stays active or is sunset. */
export function markSuperseded(oldId: string, newId_: string, sunset: boolean) {
  store.update(oldId, { supersededBy: newId_, status: sunset ? "sunset" : "active" })
}

/** Total acknowledgements = synthetic baseline + real in-app acknowledgements. */
export function ackCount(p: Policy) {
  return (p.ackBaseline ?? 0) + (p.acknowledgedBy?.length ?? 0)
}

export function nextPolicyNumber(): string {
  return `TF-POL-${newId("").split("-")[1].padStart(3, "0")}`
}

/** Suggest the next sequential policy number (TF-POL-###) from the highest
 *  numeric suffix already in use. Used to pre-fill new policies. */
export function suggestPolicyNumber(policies: Policy[]): string {
  let max = 0
  for (const p of policies) {
    const m = /(\d+)\s*$/.exec(p.number || "")
    if (m) max = Math.max(max, Number(m[1]))
  }
  return `TF-POL-${String(max + 1).padStart(3, "0")}`
}

const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
/** Format an ISO date ("2026-08-12") for display; falls back to the raw string. */
export function formatPolicyDate(iso: string | null | undefined, isAr: boolean): string {
  if (!iso) return ""
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  const [, y, mo, d] = m
  const mon = (isAr ? MONTHS_AR : MONTHS_EN)[Number(mo) - 1] ?? mo
  return isAr ? `${Number(d)} ${mon} ${y}` : `${mon} ${Number(d)}, ${y}`
}

/** Fallback body for seed policies that have no authored rich-text body yet. */
export function policyBody(p: Policy, isAr: boolean): string {
  if (p.body && p.body.trim()) return p.body
  if (isAr) {
    return `
      <h2>الغرض</h2><p>${p.summaryAr} تحدّد هذه الوثيقة المعايير والمسؤوليات والإجراءات المطبّقة على مستوى التنفيذي.</p>
      <h2>النطاق</h2><p>تسري هذه السياسة على جميع الموظفين والمتعاقدين والأطراف الخارجية العاملة نيابة عن الشركة.</p>
      <h2>الأحكام الرئيسية</h2><ul><li>تُحدَّد الأدوار والمسؤوليات حسب الدرجة والوظيفة.</li><li>الالتزام إلزامي ويُراجَع دوريًا.</li><li>تتطلب الاستثناءات موافقة موثّقة من ${p.ownerAr}.</li></ul>
      <h2>المسؤولية والمراجعة</h2><p>مالك هذه السياسة هو ${p.ownerAr}. هذا هو الإصدار ${p.version}، ساري من ${p.effectiveAr}. تُراجَع سنويًا على الأقل.</p>`
  }
  return `
    <h2>Purpose</h2><p>${p.summary} This document sets out the standards, responsibilities and procedures that apply across Tanfeethi.</p>
    <h2>Scope</h2><p>This policy applies to all employees, contractors and third parties acting on behalf of the company.</p>
    <h2>Key provisions</h2><ul><li>Roles and responsibilities are defined by grade and function.</li><li>Compliance is mandatory and reviewed periodically.</li><li>Exceptions require documented approval from ${p.owner}.</li></ul>
    <h2>Ownership &amp; review</h2><p>This policy is owned by ${p.owner}. This is ${p.version}, effective ${p.effective}. It is reviewed at least annually.</p>`
}
