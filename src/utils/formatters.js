export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retorna el nombre visible o alias de un animal evitando exponer UUIDs de base de datos.
 *
 * @param {Object|string} animal - Objeto de datos del porcino o cadena identificadora.
 * @returns {string} Nombre/alias formateado para visualización al usuario.
 */
export function getAnimalDisplayName(animal) {
  if (!animal) return "Porcino";

  if (typeof animal === "string") {
    const trimmed = animal.trim();
    if (UUID_REGEX.test(trimmed)) return "Ejemplar sin nombre";
    return trimmed || "Porcino";
  }

  const nombre = animal.nombre || animal.nombre_alias;
  if (nombre && !UUID_REGEX.test(String(nombre).trim())) {
    return String(nombre).trim();
  }

  const alias = animal.alias || animal.nombre_alias;
  if (alias && !UUID_REGEX.test(String(alias).trim())) {
    return String(alias).trim();
  }

  const arete = animal.arete || animal.codigo_arete || animal.arete_id;
  if (arete && !UUID_REGEX.test(arete.toString().trim())) {
    return `Arete #${arete.toString().trim()}`;
  }

  return "Ejemplar sin nombre";
}

export function formatWeight(kg) {
  if (kg === undefined || kg === null) return "0.00 kg";
  return `${Number(kg).toFixed(2)} kg`;
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCount(value) {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat("es-CO").format(value);
}

export function formatDateTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);
  return date.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
