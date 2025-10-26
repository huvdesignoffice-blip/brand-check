'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface SurveyResult {
  id: string;
  company_name: string;
  respondent_name: string;
  business_phase: string;
  created_at: string;
  q1_market_understanding: number;
  q2_competitive_analysis: number;
  q3_self_analysis: number;
  q4_value_proposition: number;
  q5_uniqueness: number;
  q6_product_service: number;
  q7_communication: number;
  q8_inner_branding: number;
  q9_kpi_management: number;
  q10_results: number;
  q11_ip_protection: number;
  q12_growth_intent: number;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("survey_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching results:", error);
      } else {
        setResults(data || []);
      }
      setLoading(false);
    };

    fetchResults();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const totalCount = results.length;
  const avgScore = results.length > 0
    ? (results.reduce((sum, r) => {
        const scores = [
          r.q1_market_understanding, r.q2_competitive_analysis, r.q3_self_analysis,
          r.q4_value_proposition, r.q5_uniqueness, r.q6_product_service,
          r.q7_communication, r.q8_inner_branding, r.q9_kpi_management,
          r.q10_results, r.q11_ip_protection, r.q12_growth_intent
        ];
        return sum + scores.reduce((a, b) => a + b, 0) / 12;
      }, 0) / results.length).toFixed(1)
    : "0";

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const newThisMonth = results.filter(r => new Date(r.created_at) >= thisMonth).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
    <h1 className="text-2xl font-bold text-gray-900">Brand Check Admin</h1>
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">{session.user?.email}</span>
      <button onClick={() => router.push('/api/auth/signout')} className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Sign out</button>
    </div>
  </div>
</header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <a href="/admin" className="border-b-2 border-blue-600 text-blue-600 px-3 py-4 text-sm font-medium">Dashboard</a>
            <a href="/admin/brand-check" className="border-b-2 border-transparent text-gray-600 hover:text-gray-900 px-3 py-4 text-sm font-medium">Brand Check</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-sm text-blue-600 mb-2">Total Brands</h3>
            <p className="text-4xl font-bold text-blue-700">{totalCount}</p>
            <p className="text-sm text-blue-600 mt-2">{newThisMonth} new this month</p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <h3 className="text-sm text-green-600 mb-2">Active Reports</h3>
            <p className="text-4xl font-bold text-green-700">{totalCount}</p>
            <p className="text-sm text-green-600 mt-2">All completed</p>
          </div>
          <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <h3 className="text-sm text-orange-600 mb-2">Avg Score</h3>
            <p className="text-4xl font-bold text-orange-700">{avgScore}</p>
            <p className="text-sm text-orange-600 mt-2">out of 5.0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {results.slice(0, 5).map((result) => {
                const date = new Date(result.created_at);
                const now = new Date();
                const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
                const timeAgo = diffHours < 1 ? 'Just now' : diffHours < 24 ? `${diffHours} hours ago` : `${Math.floor(diffHours / 24)} days ago`;
                return (
                  <div key={result.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">New brand check: {result.company_name}</p>
                      <p className="text-xs text-gray-500">{timeAgo}</p>
                    </div>
                  </div>
                );
              })}
              {results.length === 0 && <p className="text-sm text-gray-500">まだアクティビティがありません</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href="/admin/brand-check" className="block w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">View Brand Check Results</a>
              <button disabled className="block w-full text-left px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">Generate New Report (Coming soon)</button>
              <button disabled className="block w-full text-left px-4 py-3 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">Manage Settings (Coming soon)</button>
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
                {results.slice(0, 10).map((result) => {
                  const scores = [result.q1_market_understanding, result.q2_competitive_analysis, result.q3_self_analysis, result.q4_value_proposition, result.q5_uniqueness, result.q6_product_service, result.q7_communication, result.q8_inner_branding, result.q9_kpi_management, result.q10_results, result.q11_ip_protection, result.q12_growth_intent];
                  const avg = (scores.reduce((a, b) => a + b, 0) / 12).toFixed(0);
                  return (
                    <tr key={result.id} className="border-b border-gray-100">
                      <td className="py-3">{result.company_name}</td>
                      <td className="py-3">{result.respondent_name}</td>
                      <td className="py-3">{avg}</td>
                      <td className="py-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">完了</span></td>
                      <td className="py-3">{new Date(result.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">まだデータがありません</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}