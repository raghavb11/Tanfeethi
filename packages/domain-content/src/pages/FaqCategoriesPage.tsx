import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Button, Card, Input,
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@reach/shared-ui"
import { useShell } from "@reach/shell-context"
import { cn } from "@reach/shared-core"
import { ArrowLeft, Check, Pencil, Plus, Tags, Trash2, X } from "lucide-react"

import { CategoryBadge } from "./_ui"
import { addCategory, CATEGORY_COLORS, deleteCategory, type FaqCategory, newCategoryId, updateCategory, useCategories } from "../data/faqCategories"

export default function FaqCategoriesPage() {
  const { locale, role } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const navigate = useNavigate()
  const cats = useCategories()

  React.useEffect(() => { if (role !== "admin") navigate("/faqs", { replace: true }) }, [role, navigate])

  // new-category form
  const [name, setName] = React.useState("")
  const [nameAr, setNameAr] = React.useState("")
  const [color, setColor] = React.useState(CATEGORY_COLORS[0])

  // inline edit
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [eName, setEName] = React.useState("")
  const [eNameAr, setENameAr] = React.useState("")
  const [eColor, setEColor] = React.useState(CATEGORY_COLORS[0])
  const [confirmId, setConfirmId] = React.useState<string | null>(null)
  const confirmItem = cats.find((c) => c.id === confirmId)

  const add = () => {
    const nm = name.trim()
    if (!nm) return
    addCategory({ id: newCategoryId(), name: nm, nameAr: nameAr.trim() || nm, color })
    setName(""); setNameAr(""); setColor(CATEGORY_COLORS[0])
  }
  const startEdit = (c: FaqCategory) => { setEditingId(c.id); setEName(c.name); setENameAr(c.nameAr); setEColor(c.color) }
  const saveEdit = () => {
    if (!editingId || !eName.trim()) return
    updateCategory(editingId, { name: eName.trim(), nameAr: eNameAr.trim() || eName.trim(), color: eColor })
    setEditingId(null)
  }

  const swatches = (selected: string, onPick: (c: string) => void) => (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORY_COLORS.map((c) => (
        <button key={c} type="button" aria-label={`${t("Colour", "لون")} ${c}`} onClick={() => onPick(c)} className={cn("grid size-6 place-items-center rounded-full ring-2 ring-offset-1 ring-offset-[var(--card)] transition-transform", selected === c ? "scale-110" : "ring-transparent hover:scale-105")} style={{ backgroundColor: c, ...(selected === c ? { boxShadow: `0 0 0 2px ${c}` } : {}) }}>
          {selected === c && <Check className="size-3.5 text-white" />}
        </button>
      ))}
    </div>
  )

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button onClick={() => navigate("/faqs")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className={cn("size-4", isAr && "rotate-180")} />{t("Back to FAQs", "العودة إلى الأسئلة")}
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2 text-primary">
        <Tags className="size-4" />
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{t("FAQ topics", "مواضيع الأسئلة")}</span>
      </div>
      <h1 className="mb-1 font-heading text-2xl font-semibold">{t("Manage topics", "إدارة المواضيع")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("Topics are the coloured tags you can attach to FAQs. Add, rename, recolour or remove them here.", "المواضيع هي الوسوم الملوّنة التي تُرفق بالأسئلة. أضِفها أو أعِد تسميتها أو غيّر لونها أو احذفها هنا.")}</p>

      {/* add new */}
      <Card className="mb-6 p-5">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">{t("Add a topic", "إضافة موضوع")}</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="cat-name" className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("Name (English)", "الاسم (إنجليزي)")}</label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("e.g. Payroll", "مثال: الرواتب")} className="h-10" />
          </div>
          <div>
            <label htmlFor="cat-namear" className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("Name (Arabic)", "الاسم (عربي)")}</label>
            <Input id="cat-namear" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder={t("optional", "اختياري")} dir="rtl" className="h-10" />
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{t("Colour", "اللون")}</label>
          {swatches(color, setColor)}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div>{name.trim() && <><span className="me-2 text-xs text-muted-foreground">{t("Preview", "معاينة")}</span><CategoryBadge label={isAr ? (nameAr.trim() || name.trim()) : name.trim()} color={color} /></>}</div>
          <Button disabled={!name.trim()} onClick={add}><Plus className="size-4" />{t("Add topic", "إضافة موضوع")}</Button>
        </div>
      </Card>

      {/* list */}
      <div className="space-y-2.5">
        {cats.map((c) => (
          <Card key={c.id} className="p-4">
            {editingId === c.id ? (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input value={eName} onChange={(e) => setEName(e.target.value)} className="h-10" placeholder={t("Name (English)", "الاسم (إنجليزي)")} />
                  <Input value={eNameAr} onChange={(e) => setENameAr(e.target.value)} dir="rtl" className="h-10" placeholder={t("Name (Arabic)", "الاسم (عربي)")} />
                </div>
                {swatches(eColor, setEColor)}
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge label={isAr ? (eNameAr || eName) : eName} color={eColor} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}><X className="size-4" />{t("Cancel", "إلغاء")}</Button>
                    <Button size="sm" disabled={!eName.trim()} onClick={saveEdit}><Check className="size-4" />{t("Save", "حفظ")}</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-row items-center gap-4">
                <CategoryBadge label={isAr ? c.nameAr : c.name} color={c.color} />
                {isAr && <span className="text-sm text-muted-foreground">{c.name}</span>}
                {!isAr && <span className="text-sm text-muted-foreground" dir="rtl">{c.nameAr}</span>}
                <div className="ms-auto flex gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label={t("Edit", "تحرير")} onClick={() => startEdit(c)}><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="icon-sm" aria-label={t("Delete", "حذف")} className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmId(c.id)}><Trash2 className="size-4" /></Button>
                </div>
              </div>
            )}
          </Card>
        ))}
        {cats.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center">
            <Tags className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">{t("No topics yet — add your first one above.", "لا توجد مواضيع بعد — أضف أول موضوع أعلاه.")}</p>
          </div>
        )}
      </div>

      <Dialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        {confirmItem && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{t("Delete this topic?", "حذف هذا الموضوع؟")}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">{t("FAQs tagged with it will keep the tag but lose its colour. This can't be undone.", "ستحتفظ الأسئلة الموسومة به بالوسم لكنها ستفقد لونه. لا يمكن التراجع.")}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmId(null)}>{t("Cancel", "إلغاء")}</Button>
              <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={() => { deleteCategory(confirmItem.id); setConfirmId(null) }}><Trash2 className="size-4" />{t("Delete", "حذف")}</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </main>
  )
}
