import { createCollection, newId } from "../collections"

export type FaqCategory = { id: string; name: string; nameAr: string; color: string }

/** A readable-in-both-themes palette for category badges. */
export const CATEGORY_COLORS = [
  "#c8794f", "#3f9d94", "#5f9d52", "#c99a3a", "#9a6dc0",
  "#c65a63", "#5b8fce", "#7a8f45", "#b06fa0", "#4aa0a8",
]

const SEED: FaqCategory[] = [
  { id: "cat-people", name: "People", nameAr: "الموظفون", color: "#c8794f" },
  { id: "cat-it", name: "IT", nameAr: "تقنية المعلومات", color: "#3f9d94" },
  { id: "cat-finance", name: "Finance", nameAr: "المالية", color: "#5f9d52" },
  { id: "cat-facilities", name: "Facilities", nameAr: "المرافق", color: "#c99a3a" },
  { id: "cat-travel", name: "Travel", nameAr: "السفر", color: "#9a6dc0" },
]

const store = createCollection<FaqCategory>(SEED, "faqCategories")
export const useCategories = () => store.use()
export const getCategories = () => store.get()
export const addCategory = (c: FaqCategory) => store.append(c)
export const updateCategory = (id: string, patch: Partial<FaqCategory>) => store.update(id, patch)
export const deleteCategory = (id: string) => store.remove(id)
export const newCategoryId = () => newId("cat")

/** Resolve a category definition by its stored name (FAQs reference categories by name). */
export function findCategory(cats: FaqCategory[], name: string): FaqCategory | undefined {
  return cats.find((c) => c.name === name)
}
