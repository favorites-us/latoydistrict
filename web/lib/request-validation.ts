export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}

export async function limitedJson(request: Request, limit = 12000): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return null;
  if (Number(request.headers.get("content-length")) > limit) return null;
  const reader = request.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); return null; }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const value = JSON.parse(new TextDecoder().decode(bytes));
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch { return null; }
}

export function textField(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validPhotoReport(body: Record<string, unknown>) {
  const name = textField(body.name, 120);
  const contact = textField(body.contact, 200);
  const reason = textField(body.reason, 1500);
  if (body.website || body.rights_holder !== "yes" || !name || reason.length < 10 || (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))) return null;
  return { name, contact, reason, locale: body.locale === "es" ? "es" : "en" };
}
