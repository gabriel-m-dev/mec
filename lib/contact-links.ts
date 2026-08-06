/**
 * Enlaces `tel:` y `mailto:` a partir de lo que el cliente carga en el Studio.
 *
 * Misma idea que `lib/whatsapp.ts`: devuelven `null` cuando el dato no sirve,
 * y ese `null` es lo que hace que el bloque no se muestre. Vaciar el campo en
 * el Studio saca el enlace del sitio, sin tocar código.
 */

const MIN_DIGITS = 6;
const MAX_DIGITS = 15; // Tope del estándar E.164.

/**
 * El teléfono se MUESTRA tal como lo escribió el cliente —"(011) 4444-5555"
 * se lee mejor que "01144445555"— pero el `href` no puede llevar esos
 * caracteres: se limpian acá.
 *
 * El `+` inicial sí sobrevive, y es lo único que hace funcionar un número
 * internacional desde un celular.
 */
export function telHref(phone: string | undefined | null): string | null {
  if (!phone) return null;

  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return null;

  return trimmed.startsWith("+") ? `tel:+${digits}` : `tel:${digits}`;
}

/**
 * No se valida el correo con una expresión regular: hacerlo bien es un pozo
 * sin fondo y hacerlo mal rechaza direcciones legítimas. El Studio ya usa
 * `Rule.email()`, y acá solo se descarta lo que rompería el enlace —espacios
 * y un `@` ausente o duplicado—.
 */
export function mailtoHref(email: string | undefined | null): string | null {
  if (!email) return null;

  const trimmed = email.trim();

  if (/\s/.test(trimmed)) return null;
  if (trimmed.split("@").length !== 2) return null;

  const [user, domain] = trimmed.split("@");

  if (!user || !domain.includes(".")) return null;

  return `mailto:${trimmed}`;
}
