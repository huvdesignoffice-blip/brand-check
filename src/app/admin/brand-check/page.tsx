"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Assessment = {
  id: string;
  created_at: string;
  company_name: string | null;
  respondent_name: string | null;
  industry: string | null;
  business_phase: string | null;
  avg_score: number | null;
};

export default function BrandCheckAdminPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [companyFilter, setCompanyFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assessments, companyFilter, industryFilter, phaseFilter, startDate, endDate]);

  async function fetchAssessments() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("brand_assessments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAssessments(data || []);
    } catch (err) {
      console.error("Error fetching assessments:", err);
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...assessments];

    if (companyFilter) {
      filtered = filtered.filter((a) =>
        a.company_name?.toLowerCase().includes(companyFilter.toLowerCase())
      );
    }

    if (industryFilter) {
      filtered = filtered.filter((a) =>
        a.industry?.toLowerCase().includes(industryFilter.toLowerCase())
      );
    }

    if (phaseFilter) {
      filtered = filtered.filter((a) =>
        a.business_phase?.toLowerCase().includes(phaseFilter.toLowerCase())
      );
    }

    if (startDate) {
      filtered = filtered.filter(
        (a) => new Date(a.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (a) => new Date(a.created_at) <= new Date(endDate)
      );
    }

    setFilteredAssessments(filtered);
  }

  function resetFilters() {
    setCompanyFilter("");
    setIndustryFilter("");
    setPhaseFilter("");
    setStartDate("");
    setEndDate("");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">ブランドチェック管理画面</h1>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">フィルター</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">会社名</label>
                <input
                  type="text"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="会社名で検索"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">業界</label>
                <input
                  type="text"
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="業界で検索"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ビジネスフェーズ
                </label>
                <input
                  type="text"
                  value={phaseFilter}
                  onChange={(e) => setPhaseFilter(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="フェーズで検索"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">開始日</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">終了日</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full p-2 bg-gray-300 hover:bg-gray-400 rounded"
                >
                  フィルターをリセット
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">総評価数</div>
                <div className="text-2xl font-bold">{assessments.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">フィルター結果</div>
                <div className="text-2xl font-bold">
                  {filteredAssessments.length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">平均スコア</div>
                <div className="text-2xl font-bold">
                  {filteredAssessments.length > 0
                    ? (
                        filteredAssessments.reduce(
                          (sum, a) => sum + (a.avg_score || 0),
                          0
                        ) / filteredAssessments.length
                      ).toFixed(1)
                    : "0.0"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">最新評価</div>
                <div className="text-sm font-medium">
                  {filteredAssessments.length > 0
                    ? new Date(
                        filteredAssessments[0].created_at
                      ).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border">作成日時</th>
                  <th className="p-3 text-left border">会社名</th>
                  <th className="p-3 text-left border">回答者名</th>
                  <th className="p-3 text-left border">業界</th>
                  <th className="p-3 text-left border">ビジネスフェーズ</th>
                  <th className="p-3 text-left border">平均スコア</th>
                  <th className="p-3 text-left border">詳細</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      該当するデータがありません
                    </td>
                  </tr>
                ) : (
                  filteredAssessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="p-3 border">
                        {new Date(assessment.created_at).toLocaleString()}
                      </td>
                      <td className="p-3 border">
                        {assessment.company_name || "-"}
                      </td>
                      <td className="p-3 border">
                        {assessment.respondent_name || "-"}
                      </td>
                      <td className="p-3 border">{assessment.industry || "-"}</td>
                      <td className="p-3 border">
                        {assessment.business_phase || "-"}
                      </td>
                      <td className="p-3 border">
                        {(assessment.avg_score || 0).toFixed(1)}
                      </td>
                      <td className="p-3 border">
                        <a
                          href={`/results/${assessment.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          詳細
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
