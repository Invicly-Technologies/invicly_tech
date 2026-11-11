/** True when a saved note has visible text. Kept apart from the editor so pages can check notes without loading it. */
export function hasNoteText(html: string | null | undefined) {
  return !!html && html.replace(/<[^>]+>/g, "").trim().length > 0;
}
