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

