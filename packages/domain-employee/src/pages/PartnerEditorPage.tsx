import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Input } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { useShell } from "@reach/shell-context"
import { ArrowLeft, Check, Contact, Handshake, MapPin, Navigation, Plus, Search, Store, X } from "lucide-react"
import { Empty, FieldLabel, fieldClass, GoldButton, OutlineButton, Page, SectionCard, Tile } from "../components/wijha"

import {
  addPartner, type Branch, CATEGORY, coordsFromMapsUrl, directionsUrl, getPartner,
  hoursLine, mapsSearchUrl, newPartnerId, nextPartnerCode, type PartnerCategory,
  type PartnerStatus, updatePartner,
} from "../data/mock/partners"

const CATEGORIES = Object.keys(CATEGORY) as PartnerCategory[]

/** Add or edit one partner. A full routed page, not a dialog — the branches
 *  alone are more than a dialog should hold. */
export default function PartnerEditorPage() {
  const { locale } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const { id } = useParams()

  const partner = id ? getPartner(id) : undefined
  const editing = !!partner
  const back = "/config/partners"

  const [code] = React.useState(partner?.code ?? nextPartnerCode())
  const [name, setName] = React.useState(partner?.name ?? "")
  const [nameAr, setNameAr] = React.useState(partner?.nameAr ?? "")
  const [category, setCategory] = React.useState<PartnerCategory>(partner?.category ?? "wellness")
  const [status, setStatus] = React.useState<PartnerStatus>(partner?.status ?? "active")
  const [contactName, setContactName] = React.useState(partner?.contact.name ?? "")
  const [contactNameAr, setContactNameAr] = React.useState(partner?.contact.nameAr ?? "")
  const [phone, setPhone] = React.useState(partner?.contact.phone ?? "")
  const [email, setEmail] = React.useState(partner?.contact.email ?? "")
  const [agreementToISO, setAgreementToISO] = React.useState(partner?.agreementToISO ?? "")
  const [branches, setBranches] = React.useState<Branch[]>(partner?.branches ?? [])

  const pretty = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""

  const addBranch = () => setBranches((b) => [...b, {
    id: `b-${Date.now().toString(36)}-${b.length}`,
    name: "", nameAr: "", city: "", cityAr: "", phone: "", hours: "", hoursAr: "",
    days: "Sat–Thu", daysAr: "السبت–الخميس",
    opensAt: "09:00", closesAt: "21:00",
  }])
  const setBranch = (i: number, fields: Partial<Branch>) =>
    setBranches((b) => b.map((x, j) => (j === i ? { ...x, ...fields } : x)))

  /** Pull the pin out of whatever Google Maps link was pasted. */
  const setMapsUrl = (i: number, url: string) => {
    const at = coordsFromMapsUrl(url)
    setBranch(i, { mapsUrl: url, lat: at?.lat, lng: at?.lng })
  }
  const removeBranch = (i: number) => setBranches((b) => b.filter((_, j) => j !== i))

  const label = (s: string, required = false) => <FieldLabel required={required}>{s}</FieldLabel>
  const inputCls = "h-9 rounded-lg bg-background"

  const canSave = name.trim() !== "" && agreementToISO !== ""

  const save = () => {
    if (!canSave) return
    const clean = branches
      .filter((b) => b.name.trim() !== "")
      .map((b) => ({
        ...b,
        name: b.name.trim(), nameAr: b.nameAr.trim() || b.name.trim(),
        city: b.city.trim(), cityAr: b.cityAr.trim() || b.city.trim(),
        // the displayed line is derived, so it can never drift from the times
        hours: hoursLine(b) || b.hours.trim(),
        hoursAr: hoursLine({ ...b, days: b.daysAr }, true) || b.hoursAr.trim() || b.hours.trim(),
      }))
    const fields = {
      name: name.trim(), nameAr: nameAr.trim() || name.trim(),
      category, status,
      contact: {
        name: contactName.trim(), nameAr: contactNameAr.trim() || contactName.trim(),
        phone: phone.trim(), email: email.trim(),
      },
      branches: clean,
      agreementTo: pretty(agreementToISO), agreementToISO,
    }
    if (partner) updatePartner(partner.id, fields)
    else addPartner({ id: newPartnerId(), code, ...fields })
    navigate(back)
  }

  return (
    <Page className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(back)} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to partners", "العودة إلى الشركاء")}
        </button>
        <div className="flex gap-2">
          <OutlineButton onClick={() => navigate(back)}>{t("Cancel", "إلغاء")}</OutlineButton>
          <GoldButton disabled={!canSave} onClick={save}>
            <Check className="size-4" />{editing ? t("Save changes", "حفظ التغييرات") : t("Create partner", "إنشاء الشريك")}
          </GoldButton>
        </div>
      </div>

      <SectionCard icon={Handshake} title={editing ? t("Edit partner", "تعديل الشريك") : t("New partner", "شريك جديد")}>
        <p className="-mt-1 mb-5 text-[12.5px] text-muted-foreground">
          {t("The vendor and its agreement. Offers are created by the partner and point back at this record.",
             "بيانات الجهة واتفاقيتها. يُنشئ الشريك العروض وتُربط بهذا السجل.")}
        </p>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Partner code", "رمز الشريك"))}
              <Input value={code} readOnly dir="ltr" className={cn(inputCls, "bg-secondary/50 tabular-nums text-muted-foreground")} />
              <p className="mt-1 text-[12px] text-muted-foreground">
                {t("Allocated once and never reused.", "يُمنح مرة واحدة ولا يُعاد استخدامه.")}
              </p>
            </div>
            <div>
              {label(t("Category", "الفئة"))}
              <select
                value={category} onChange={(e) => setCategory(e.target.value as PartnerCategory)}
                className={fieldClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{isAr ? CATEGORY[c].ar : CATEGORY[c].en}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Name", "الاسم"), true)}
              <Input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Al Masa Spa & Wellness", "منتجع الماسة للعافية")} />
            </div>
            <div>
              {label(t("Name in Arabic", "الاسم بالعربية"))}
              <Input className={inputCls} value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              {label(t("Agreement valid to", "الاتفاقية سارية حتى"), true)}
              <Input className={inputCls} type="date" value={agreementToISO} onChange={(e) => setAgreementToISO(e.target.value)} />
            </div>
            <div>
              {label(t("Status", "الحالة"))}
              <div className="flex gap-2">
                {(["active", "suspended"] as PartnerStatus[]).map((s) => (
                  <button
                    key={s} type="button" onClick={() => setStatus(s)}
                    className={cn("h-9 flex-1 rounded-lg text-[13px] font-medium transition-colors",
                      status === s
                        ? s === "active" ? "bg-success-fill text-success" : "bg-error-fill text-error"
                        : "bg-secondary text-muted-foreground hover:text-foreground")}
                  >
                    {s === "active" ? t("Active", "نشِط") : t("Suspended", "موقوف")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Contact} title={t("Contact", "جهة الاتصال")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                {label(t("Contact name", "اسم جهة الاتصال"))}
                <Input className={inputCls} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder={t("Partnerships desk", "مكتب الشراكات")} />
              </div>
              <div>
                {label(t("Contact name in Arabic", "الاسم بالعربية"))}
                <Input className={inputCls} value={contactNameAr} onChange={(e) => setContactNameAr(e.target.value)} dir="rtl" />
              </div>
              <div>
                {label(t("Phone", "الهاتف"))}
                <Input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 11 000 0000" dir="ltr" />
              </div>
              <div>
                {label(t("Email", "البريد الإلكتروني"))}
                <Input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="corporate@vendor.sa" dir="ltr" />
              </div>
            </div>
      </SectionCard>

      <SectionCard
        icon={Store}
        title={t("Branches", "الفروع")}
        action={
          <OutlineButton size="sm" onClick={addBranch}>
            <Plus className="size-3.5" />{t("Add branch", "إضافة فرع")}
          </OutlineButton>
        }
      >
            {branches.length === 0 && (
              <Empty icon={MapPin} title={t("No branches yet", "لا توجد فروع بعد")}
                hint={t("Offers can still be created; they will show no locations.", "يمكن إنشاء العروض، لكنها لن تعرض مواقع.")} />
            )}

            <div className="space-y-3">
              {branches.map((b, i) => (
                <Tile key={b.id}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[13px] font-medium text-primary">
                      {t(`Branch ${i + 1}`, `الفرع ${i + 1}`)}
                    </span>
                    <button
                      onClick={() => removeBranch(i)} aria-label={t("Remove branch", "إزالة الفرع")}
                      className="grid size-7 place-items-center rounded-lg text-icon hover:bg-error-fill hover:text-error"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input className={inputCls} value={b.name} onChange={(e) => setBranch(i, { name: e.target.value })} placeholder={t("Branch name", "اسم الفرع")} />
                    <Input className={inputCls} value={b.nameAr} onChange={(e) => setBranch(i, { nameAr: e.target.value })} placeholder={t("Name in Arabic", "الاسم بالعربية")} dir="rtl" />
                    <Input className={inputCls} value={b.city} onChange={(e) => setBranch(i, { city: e.target.value })} placeholder={t("City", "المدينة")} />
                    <Input className={inputCls} value={b.phone} onChange={(e) => setBranch(i, { phone: e.target.value })} placeholder={t("Phone", "الهاتف")} dir="ltr" />
                  </div>

                  {/* opening hours — days, then from and until */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                    <div>
                      {label(t("Days", "الأيام"))}
                      <Input
                        className={inputCls}
                        value={b.days ?? ""} onChange={(e) => setBranch(i, { days: e.target.value })}
                        placeholder={t("Sat–Thu", "السبت–الخميس")}
                      />
                    </div>
                    <div>
                      {label(t("Open from", "يفتح من"))}
                      <Input
                        type="time" value={b.opensAt ?? ""} className={cn(inputCls, "w-[9.5rem]")}
                        onChange={(e) => setBranch(i, { opensAt: e.target.value })}
                      />
                    </div>
                    <div>
                      {label(t("Until", "حتى"))}
                      <Input
                        type="time" value={b.closesAt ?? ""} className={cn(inputCls, "w-[9.5rem]")}
                        onChange={(e) => setBranch(i, { closesAt: e.target.value })}
                      />
                    </div>
                  </div>
                  {b.opensAt && b.closesAt && (
                    <p className="mt-1.5 text-[12px] text-muted-foreground">
                      {t("Staff see", "يرى الموظف")}: <span className="font-medium text-foreground">{hoursLine(b)}</span>
                    </p>
                  )}

                  {/* the map pin, so staff can ask for directions */}
                  <div className="mt-3">
                    {label(t("Location on Google Maps", "الموقع على خرائط جوجل"))}
                    <div className="flex flex-wrap gap-2">
                      <Input
                        value={b.mapsUrl ?? ""} onChange={(e) => setMapsUrl(i, e.target.value)}
                        placeholder={t("Paste the Google Maps link, or 24.7136, 46.6753",
                                       "الصق رابط خرائط جوجل، أو 24.7136, 46.6753")}
                        className={cn(inputCls, "min-w-0 flex-1 sm:min-w-[16rem]")} dir="ltr"
                      />
                      <a
                        href={mapsSearchUrl([name, b.name, b.city].filter(Boolean).join(" ") || "Riyadh")}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--btn-outline-border)] px-3 text-[13px] font-medium transition-colors hover:bg-[var(--btn-outline-hover)] hover:text-primary"
                      >
                        <Search className="size-3.5" />{t("Find on Maps", "ابحث في الخرائط")}
                      </a>
                    </div>
                    {b.lat != null && b.lng != null ? (
                      <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-success">
                        <MapPin className="size-3.5" />
                        {t("Pinned at", "محدّد عند")} <span className="tabular-nums">{b.lat.toFixed(5)}, {b.lng.toFixed(5)}</span>
                        <a
                          href={directionsUrl(b, name)} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                        >
                          <Navigation className="size-3" />{t("Check directions", "تحقق من الاتجاهات")}
                        </a>
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[12px] text-muted-foreground">
                        {t("Find the branch on Google Maps, copy the link from the address bar and paste it here. Without a pin, directions search for the branch by name.",
                           "ابحث عن الفرع في خرائط جوجل، وانسخ الرابط والصقه هنا. بدون تحديد، تبحث الاتجاهات عن الفرع بالاسم.")}
                      </p>
                    )}
                  </div>
                </Tile>
              ))}
            </div>
      </SectionCard>
    </Page>
  )
}
