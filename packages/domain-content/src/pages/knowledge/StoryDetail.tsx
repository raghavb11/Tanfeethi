/** Shared template for the News / Announcement details pages
 *  (Figma 4758:25023 · 4758:25160): one wide card — section header with an
 *  "item 7 of 13" pager, a large 16:9 image (opens the lightbox), tag + meta,
 *  title, body, and Edit/Delete at the end when the viewer may manage it. */
import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { CardHead, Pager, Tag, type TagTone, WCard } from "../_wijha"
import { ImageLightbox } from "./KnowledgeModals"

export function StoryDetail({ isAr, icon, section, counter, onPrev, onNext, prevDisabled, nextDisabled, img, tag, tagTone, meta, title, children, actions }: {
  isAr: boolean
  icon: LucideIcon
  section: string
  counter: string
  onPrev: () => void
  onNext: () => void
  prevDisabled?: boolean
  nextDisabled?: boolean
  img?: string | null
  tag: string
  tagTone: TagTone
  meta: string
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  const [zoom, setZoom] = React.useState<string | null>(null)
  return (
    <WCard className="px-[18px] sm:px-[18px]">
      <CardHead icon={icon} title={section}
        actions={<div className="flex items-center gap-4">
          <span className="text-[12px] text-muted-foreground">{counter}</span>
          <Pager isAr={isAr} onPrev={onPrev} onNext={onNext} prevDisabled={prevDisabled} nextDisabled={nextDisabled} />
        </div>} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-6 pt-3.5">
          {img && (
            <button type="button" onClick={() => setZoom(img)} aria-label={isAr ? "عرض الصورة" : "View image"}
              className="mx-auto block w-full max-w-[900px] overflow-hidden rounded-xl">
              <img src={img} alt="" className="aspect-video w-full object-cover" />
            </button>
          )}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-2.5">
              <Tag tone={tagTone}>{tag}</Tag>
              <span className="text-[11px] text-muted-foreground">{meta}</span>
            </div>
            <h1 className="text-[15px] font-medium leading-[22px]">{title}</h1>
            <div className="max-w-[80ch] text-[13px] leading-6 text-foreground/90 [&_a]:text-primary [&_a]:underline [&_b]:font-semibold [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ps-5">
              {children}
            </div>
          </div>
        </div>
        {actions && <div className="flex flex-wrap justify-end gap-2">{actions}</div>}
      </div>
      <ImageLightbox src={zoom} onClose={() => setZoom(null)} isAr={isAr} />
    </WCard>
  )
}
