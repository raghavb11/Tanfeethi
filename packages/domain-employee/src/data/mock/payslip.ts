/** Payslips for the Payroll page. Demo-only fixtures — a real build reads
 *  these from the payroll system. Figures line up with the Employee Center
 *  summary card and the allowance breakdown on the Benefits page. */

export type PayLine = {
  label: string; labelAr: string
  amount: number
  /** Deductions are stored positive and rendered with a minus. */
  kind: "earning" | "deduction"
  note?: string; noteAr?: string
}

export type Payslip = {
  id: string
  month: string; monthAr: string
  /** Sort key, newest first. */
  period: string
  payDate: string; payDateAr: string
  status: "Paid" | "Processing"
  statusAr: string
  earnings: PayLine[]
  deductions: PayLine[]
  /** Days absent / unpaid in the period, shown as a note when non-zero. */
  unpaidDays?: number
}

export const CURRENCY = { code: "SAR", ar: "ر.س" }
export const money = (n: number, isAr: boolean) =>
  isAr ? `${n.toLocaleString("en-US")} ${CURRENCY.ar}` : `${CURRENCY.code} ${n.toLocaleString("en-US")}`

const BASE_EARNINGS: PayLine[] = [
  { label: "Basic salary", labelAr: "الراتب الأساسي", amount: 15000, kind: "earning" },
  { label: "Housing allowance", labelAr: "بدل السكن", amount: 4500, kind: "earning", note: "25% of basic", noteAr: "٢٥٪ من الأساسي" },
  { label: "Transport allowance", labelAr: "بدل النقل", amount: 1200, kind: "earning" },
  { label: "Education allowance", labelAr: "بدل التعليم", amount: 1500, kind: "earning" },
  { label: "Communication allowance", labelAr: "بدل الاتصالات", amount: 300, kind: "earning" },
]

const BASE_DEDUCTIONS: PayLine[] = [
  { label: "GOSI contribution", labelAr: "اشتراك التأمينات", amount: 1794, kind: "deduction", note: "Employee share, 9.75%", noteAr: "حصة الموظف، ٩٫٧٥٪" },
  { label: "Company savings plan", labelAr: "برنامج الادخار", amount: 1500, kind: "deduction" },
  { label: "Salary advance recovery", labelAr: "استرداد سلفة", amount: 806, kind: "deduction", note: "4 of 6 instalments", noteAr: "٤ من ٦ أقساط" },
]

const slip = (
  id: string, period: string, month: string, monthAr: string,
  payDate: string, payDateAr: string,
  extra: { earnings?: PayLine[]; deductions?: PayLine[]; status?: Payslip["status"] } = {},
): Payslip => ({
  id, period, month, monthAr, payDate, payDateAr,
  status: extra.status ?? "Paid",
  statusAr: extra.status === "Processing" ? "قيد المعالجة" : "مدفوع",
  earnings: [...BASE_EARNINGS, ...(extra.earnings ?? [])],
  deductions: [...BASE_DEDUCTIONS, ...(extra.deductions ?? [])],
})

export const PAYSLIPS: Payslip[] = [
  slip("ps-2608", "2026-08", "August 2026", "أغسطس ٢٠٢٦", "Aug 27, 2026", "٢٧ أغسطس ٢٠٢٦", { status: "Processing" }),
  slip("ps-2607", "2026-07", "July 2026", "يوليو ٢٠٢٦", "Jul 27, 2026", "٢٧ يوليو ٢٠٢٦"),
  slip("ps-2606", "2026-06", "June 2026", "يونيو ٢٠٢٦", "Jun 26, 2026", "٢٦ يونيو ٢٠٢٦", {
    earnings: [{ label: "Eid Al-Adha bonus", labelAr: "مكافأة عيد الأضحى", amount: 7500, kind: "earning" }],
  }),
  slip("ps-2605", "2026-05", "May 2026", "مايو ٢٠٢٦", "May 27, 2026", "٢٧ مايو ٢٠٢٦"),
  slip("ps-2604", "2026-04", "April 2026", "أبريل ٢٠٢٦", "Apr 27, 2026", "٢٧ أبريل ٢٠٢٦", {
    earnings: [{ label: "Overtime", labelAr: "عمل إضافي", amount: 1250, kind: "earning", note: "12 hours", noteAr: "١٢ ساعة" }],
  }),
  slip("ps-2603", "2026-03", "March 2026", "مارس ٢٠٢٦", "Mar 27, 2026", "٢٧ مارس ٢٠٢٦"),
  slip("ps-2602", "2026-02", "February 2026", "فبراير ٢٠٢٦", "Feb 26, 2026", "٢٦ فبراير ٢٠٢٦"),
  slip("ps-2601", "2026-01", "January 2026", "يناير ٢٠٢٦", "Jan 27, 2026", "٢٧ يناير ٢٠٢٦", {
    earnings: [{ label: "Annual performance bonus", labelAr: "مكافأة الأداء السنوية", amount: 22500, kind: "earning", note: "2025 cycle", noteAr: "دورة ٢٠٢٥" }],
  }),
]

export const totals = (p: Payslip) => {
  const gross = p.earnings.reduce((s, l) => s + l.amount, 0)
  const deducted = p.deductions.reduce((s, l) => s + l.amount, 0)
  return { gross, deducted, net: gross - deducted }
}

/** Year-to-date across every paid slip in the current year. */
export function ytd(year = "2026") {
  const paid = PAYSLIPS.filter((p) => p.status === "Paid" && p.period.startsWith(year))
  return paid.reduce(
    (acc, p) => {
      const t = totals(p)
      return { gross: acc.gross + t.gross, deducted: acc.deducted + t.deducted, net: acc.net + t.net, months: acc.months + 1 }
    },
    { gross: 0, deducted: 0, net: 0, months: 0 },
  )
}

/** Where the money is paid — masked, as a real portal would show it. */
export const payment = {
  bank: "Al Rajhi Bank", bankAr: "مصرف الراجحي",
  iban: "SA•• •••• •••• •••• •••4 8210",
  method: "Bank transfer (WPS)", methodAr: "تحويل بنكي (نظام حماية الأجور)",
}
