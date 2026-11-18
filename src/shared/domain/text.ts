/**
 * Text ready to be compared by a search: no accents, no case, no surrounding
 * spaces. "Panadería " and "panaderia" become the same.
 */
export function normalizeForSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
}
