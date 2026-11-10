import * as React from "react"
import { motion } from "framer-motion"

import { useShell } from "@reach/shell-context"

import { myTasks } from "../data/mock/home"
import { HeroSection } from "../components/home/HeroSection"
import { AgendaCard, ApprovalsCard, KpiTiles, LinksCard, MailCard, ProjectsCard, TasksCard } from "../components/home/HomeCards"
import { useMedia } from "../components/home/helpers"

/**
 * WIJHA home — Figma "Wijha - Homepage - Dark" (2013:5689).
 *
 * Wide (≥1024px of content): hero across the top, then two columns — the main
 * column (KPI tiles, Mail + Agenda, Projects, Links) at inline-start and the
 * side column (Approvals, My tasks) at inline-end, 729 : 480.
 * Medium (assistant docked, 315:680): one column of paired cards.
 * Narrow (phone, 3182:10048): single column in the phone order —
 * KPIs, agenda, approvals, mail, tasks, projects, links.
 * The column wrappers turn into `display: contents` below the wide breakpoint
 * so each card can be re-ordered without duplicating markup.
 */
export default function Dashboard() {
  const { locale, aiPanelOpen } = useShell()
  const isAr = locale === "ar"
  const t = (en: string, ar: string) => (isAr ? ar : en)
  const isDesktop = useMedia("(min-width: 1024px)")
  const [tasks, setTasks] = React.useState(myTasks)

  const toggleTask = (id: string) => setTasks((ts) => ts.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))
  const openTasks = tasks.filter((x) => !x.done).length
  // With the assistant docked beside the page the hero drops its ask bar (315:680).
  const compactHero = aiPanelOpen && isDesktop

  return (
    <div className="@container mx-auto w-full max-w-[1500px] px-4 pb-6 pt-6 md:px-10 md:pt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <HeroSection isAr={isAr} compact={compactHero} openTasks={openTasks} />
      </motion.div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 @2xl:grid-cols-2 @3xl:mt-10 @5xl:grid-cols-[minmax(0,729fr)_minmax(0,480fr)] @5xl:gap-5">
        {/* main column */}
        <div className="contents @5xl:flex @5xl:min-w-0 @5xl:flex-col @5xl:gap-6">
          <div className="order-1 @2xl:col-span-2 @5xl:order-none">
            <KpiTiles isAr={isAr} />
          </div>
          <div className="contents @5xl:grid @5xl:grid-cols-2 @5xl:items-start @5xl:gap-6">
            <MailCard isAr={isAr} t={t} className="order-4 @2xl:order-5 @5xl:order-none" />
            <AgendaCard isAr={isAr} t={t} className="order-2 @2xl:order-4 @5xl:order-none" />
          </div>
          <ProjectsCard isAr={isAr} t={t} className="order-6 @2xl:col-span-2 @5xl:order-none" />
          <LinksCard isAr={isAr} t={t} className="order-7 @2xl:col-span-2 @5xl:order-none" />
        </div>

        {/* side column */}
        <div className="contents @5xl:flex @5xl:min-w-0 @5xl:flex-col @5xl:gap-6">
          <ApprovalsCard isAr={isAr} t={t} className="order-3 @2xl:order-2 @5xl:order-none" />
          <TasksCard isAr={isAr} t={t} tasks={tasks} onToggle={toggleTask} className="order-5 @2xl:order-3 @5xl:order-none" />
        </div>
      </div>
    </div>
  )
}
