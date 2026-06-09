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
