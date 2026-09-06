import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, Badge, Button, Card } from "@reach/shared-ui"
import { cn } from "@reach/shared-core"
import { Coffee, LogIn, MapPin } from "lucide-react"

import { locationById, setOnShift, signIn, useSignedInStaff, useStaff } from "../data/mock/cafeteria"

/** Tea-boy sign-in. Arabic-first: the service team works in Arabic, so this
 *  app defaults to Arabic with an English toggle — the reverse of the portal. */
export default function TeaBoyLoginPage() {
  const navigate = useNavigate()
  const staff = useStaff()
  const signed = useSignedInStaff()
  const [ar, setAr] = React.useState(true)
  const t = (en: string, arv: string) => (ar ? arv : en)

  React.useEffect(() => { if (signed) navigate("/tea-boy", { replace: true }) }, [signed, navigate])

  return (
    <div className="min-h-svh bg-background text-foreground" dir={ar ? "rtl" : "ltr"}>
      <div className="mx-auto flex max-w-md flex-col gap-6 px-5 py-10">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold tracking-[0.18em] text-muted-foreground">ALTANFEETHI</span>
          <button
            onClick={() => setAr(!ar)}
            className="rounded-full border border-border/60 px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-muted/40"
          >
            {ar ? "EN" : "ع"}
          </button>
        </div>

        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Coffee className="size-7" />
          </span>
          <h1 className="mt-4 text-[24px] font-bold tracking-tight">{t("Cafeteria Service", "خدمة الكافتيريا")}</h1>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {t("Choose your name to start your shift.", "اختر اسمك لبدء ورديتك.")}
          </p>
        </div>

        <Card className="ring-1 ring-foreground/10">
          <div className="divide-y divide-border/50">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3.5">
                <Avatar className="size-11 shrink-0">
                  <AvatarFallback className="bg-primary/12 text-[13px] font-bold text-primary">{s.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold">{ar ? s.nameAr : s.name}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", s.onShift
                        ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground")}
                    >
                      {s.onShift ? t("On shift", "في الوردية") : t("Off shift", "خارج الوردية")}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted-foreground">
                    <MapPin className="size-3" />
                    {s.covers.length === 0
                      ? t("All locations", "جميع المواقع")
                      : s.covers.map((c) => {
                          const l = locationById(c)
                          return l ? (ar ? l.siteAr : l.site) : c
                        }).filter((v, i, a) => a.indexOf(v) === i).join(" · ")}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => { if (!s.onShift) setOnShift(s.id, true); signIn(s.id) }}
                >
                  <LogIn className="size-4" />{t("Sign in", "دخول")}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-center text-[11.5px] text-muted-foreground/70">
          {t("Prototype sign-in — the real app uses the employee's own account.",
             "تسجيل دخول تجريبي — التطبيق الفعلي يستخدم حساب الموظف.")}
        </p>
      </div>
    </div>
  )
}
