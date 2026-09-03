import { redirect } from "next/navigation";

export default async function LegacyInventoryProfilePage({ searchParams }) {
  const sp = await searchParams;
  const query = new URLSearchParams(sp || {}).toString();
  redirect(`/dashboard/animals/profile${query ? `?${query}` : ""}`);
}
