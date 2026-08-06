/**
 * Arma el enlace de WhatsApp a partir de lo que el cliente cargó en el Studio.
 *
 * Vive aparte del componente porque un número mal escrito no rompe nada
 * visible: el botón se dibuja igual y recién se descubre cuando alguien lo
 * toca y cae en un chat que no existe. Acá se puede testear sin renderizar.
 *
 * Devuelve `null` cuando no hay número usable, y ese `null` es lo que hace
 * que el botón no se muestre: apagarlo es vaciar el campo, no tocar código.
 */

const MIN_DIGITS = 8;
const MAX_DIGITS = 15; // Tope del estándar E.164.

export function buildWhatsAppUrl(
  phone: string | undefined | null,
  message?: string | null,
): string | null {
  if (!phone) return null;

  // El schema ya obliga a que sean solo dígitos, pero se limpia igual: en el
  // dataset puede haber quedado un número cargado antes de esa validación, o
  // escrito desde la API, y "+54 9 11 2233-4455" es inequívoco. Es más útil
  // aceptarlo que dejar el botón apagado sin explicación.
  const digits = phone.replace(/\D/g, "");

  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return null;

  const url = `https://wa.me/${digits}`;
  const text = message?.trim();

  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}
