/** Слова видимого текста markdown-главы: разметка (#, *, _, ---, >) не считается словами. */
export function countWords(markdown: string): number {
  const visible = markdown
    .replace(/^---+\s*$/gm, ' ') // сцена-брейки
    .replace(/[#>*_`~\[\]()]/g, ' ');
  const words = visible.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  return words.length;
}
