/**
 * Localized "N item(s)" label.
 * English: 1 Item / 2 Items.
 * Arabic: noun-first for 1 and 2 (عنصر واحد, عنصران), number-first with the
 * plural for 3–10 (3 عناصر), and the singular after the number for 11+ (11 عنصرًا).
 */
export function formatItemCount(count: number, isAr: boolean): string {
  if (isAr) {
    if (count === 0) return "لا عناصر"
    if (count === 1) return "عنصر واحد"
    if (count === 2) return "عنصران"
    if (count <= 10) return `${count.toLocaleString("ar-EG-u-nu-latn")} عناصر`
    return `${count.toLocaleString("ar-EG-u-nu-latn")} عنصرًا`
  }
  return `${count.toLocaleString()} ${count === 1 ? "Item" : "Items"}`
}
