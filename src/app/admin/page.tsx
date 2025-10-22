export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Brands" value="12" subtitle="3 new this month" color="blue" />
        <StatCard title="Active Reports" value="5" subtitle="2 pending review" color="green" />
        <StatCard title="Avg Score" value="68" subtitle="+5 from last month" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <ActivityItem title="New brand check completed" time="2 hours ago" status="success" />
            <ActivityItem title="Report generated for HUV DESIGN" time="5 hours ago" status="success" />
            <ActivityItem title="Score updated: Brand X" time="1 day ago" status="pending" />
            <ActivityItem title="New user registered" time="2 days ago" status="success" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <ActionButton href="/admin/brand-check" label="View Brand Check Results" />
            <ActionButton href="/admin/reports" label="Generate New Report" disabled />
            <ActionButton href="/admin/settings" label="Manage Settings" disabled />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Brand Assessments</h2>
          <a href="/admin/brand-check" className="text-sm text-blue-600 hover:text-blue-700">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-gray-600">
              <tr>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Respondent</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              <TableRow company="株式会社HUV DESIGN OFFICE" respondent="入倉大亮" score={68} status="completed" date="2025-10-16" />
              <TableRow company="株式会社サンプル" respondent="山田太郎" score={72} status="completed" date="2025-10-15" />
              <TableRow company="テスト株式会社" respondent="佐藤花子" score={55} status="pending" date="2025-10-14" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }: { title: string; value: string; subtitle: string; color: "blue" | "green" | "orange" }) {
  const colors = { blue: "bg-blue-50 text-blue-700 border-blue-200", green: "bg-green-50 text-green-700 border-green-200", orange: "bg-orange-50 text-orange-700 border-orange-200" };
  return (
    <div className={`rounded-xl border p-6 ${colors[color]}`}>
      <div className="text-sm font-medium opacity-75 mb-1">{title}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs opacity-60">{subtitle}</div>
    </div>
  );
}

function ActivityItem({ title, time, status }: { title: string; time: string; status: "success" | "pending" | "error" }) {
  const statusColors = { success: "bg-green-500", pending: "bg-yellow-500", error: "bg-red-500" };
  return (
    <div className="flex items-start gap-3 py-2">
      <div className={`w-2 h-2 rounded-full mt-1.5 ${statusColors[status]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-900">{title}</div>
        <div className="text-xs text-gray-500">{time}</div>
      </div>
    </div>
  );
}

function ActionButton({ href, label, disabled }: { href: string; label: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="w-full px-4 py-2.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
        {label} <span className="text-xs">(Coming soon)</span>
      </div>
    );
  }
  return <a href={href} className="block w-full px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">{label}</a>;
}

function TableRow({ company, respondent, score, status, date }: { company: string; respondent: string; score: number; status: "completed" | "pending"; date: string }) {
  const statusStyles = status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
  const statusText = status === "completed" ? "完了" : "保留中";
  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="py-3 pr-4 text-gray-900">{company}</td>
      <td className="py-3 pr-4 text-gray-700">{respondent}</td>
      <td className="py-3 pr-4 text-gray-900 font-medium">{score}</td>
      <td className="py-3 pr-4"><span className={`px-2 py-1 text-xs rounded-full ${statusStyles}`}>{statusText}</span></td>
      <td className="py-3 pr-4 text-gray-500">{new Date(date).toLocaleDateString("ja-JP")}</td>
    </tr>
  );
}