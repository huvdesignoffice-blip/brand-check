'use client';

export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
  const supabase = createClientComponentClient();

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
  }, [session, status, router, supabase]);

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
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const newThisMonth = results.filter(r => new Date(r.created_at) >= thisMonth).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">管理ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                const scores = [
                  result.q1_market_understanding,
                  result.q2_competitive_analysis,
                  result.q3_self_analysis,
                  result.q4_value_proposition,
                  result.q5_uniqueness,
                  result.q6_product_service,
                  result.q7_communication,
                  result.q8_inner_branding,
                  result.q9_kpi_management,
                  result.q10_results,
                  result.q11_ip_protection,
                  result.q12_growth_intent
                ];
                const avg = (scores.reduce((a, b) => a + b, 0) / 12).toFixed(1);
                return (
                  <tr key={result.id} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{result.company_name}</td>
                    <td className="py-3 text-gray-600">{result.respondent_name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${Number(avg) >= 4 ? 'bg-green-100 text-green-700' : Number(avg) >= 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {avg}/5
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Complete</span>
                    </td>
                    <td className="py-3 text-gray-600">{new Date(result.created_at).toLocaleDateString()}</td>
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
    </div>
  );
}
