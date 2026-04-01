import PublicDashboardClient from "@/components/dashboard/public-dashboard-client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PublicDashboard() {
  return <PublicDashboardClient />;
}
