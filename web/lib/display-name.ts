// Explicit tokens only: do not infer acronyms from arbitrary short words.
export function normalizeDisplayName(name: string): string {
  return name.replace(/(?<![\p{L}\p{N}_])(LA|USA|DTLA|LLC|LP|LTD|II|III|CA|NY|GM|INC)(?![\p{L}\p{N}_])/giu,
    (token) => token.toUpperCase() === "INC" ? "Inc" : token.toUpperCase());
}
