"use client";

// ビルド時の静的生成をスキップ
export const dynamic = 'force-dynamic';

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

type SortField = "created_at" | "company_name" | "avg_score";
type SortDirection = "asc" | "desc";

export default function BrandCheckAdminPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [companyFilter, setCompanyFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [assessments, companyFilter, industryFilter, phaseFilter, startDate, endDate, sortField, sortDirection]);

  async function fetchAssessments() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("survey_results")
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

  function applyFiltersAndSort() {
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

    // ソート
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === "avg_score") {
        aVal = aVal || 0;
        bVal = bVal || 0;
      } else {
        aVal = aVal || "";
        bVal = bVal || "";
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredAssessments(filtered);
  }

  function resetFilters() {
    setCompanyFilter("");
    setIndustryFilter("");
    setPhaseFilter("");
    setStartDate("");
    setEndDate("");
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  async function handleDelete(id: string, companyName: string | null) {
    const confirmMessage = `以下のデータを削除しますか？\n\n会社名: ${
      companyName || "未入力"
    }\nID: ${id}\n\nこの操作は取り消せません。`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(id);

      const { error } = await supabase
        .from("survey_results")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("データを削除しました");
      setAssessments(assessments.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting result:", error);
      alert("削除に失敗しました: " + (error as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  function exportToCSV() {
    const headers = [
      "作成日時",
      "会社名",
      "回答者名",
      "業界",
      "ビジネスフェーズ",
      "平均スコア"
    ];

    const rows = filteredAssessments.map((a) => [
      new Date(a.created_at).toLocaleString("ja-JP"),
      a.company_name || "-",
      a.respondent_name || "-",
      a.industry || "-",
      a.business_phase || "-",
      (a.avg_score || 0).toFixed(1)
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      )
    ].join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `brand-check-export-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">ブランドチェック管理画面</h1>
            <button
              onClick={exportToCSV}
              disabled={filteredAssessments.length === 0}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            >
              CSVエクスポート ({filteredAssessments.length}件)
            </button>
          </div>

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
                  <th className="p-3 text-left border">
                    <button
                      onClick={() => handleSort("created_at")}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      作成日時
                      {sortField === "created_at" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="p-3 text-left border">
                    <button
                      onClick={() => handleSort("company_name")}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      会社名
                      {sortField === "company_name" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="p-3 text-left border">回答者名</th>
                  <th className="p-3 text-left border">業界</th>
                  <th className="p-3 text-left border">ビジネスフェーズ</th>
                  <th className="p-3 text-left border">
                    <button
                      onClick={() => handleSort("avg_score")}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      平均スコア
                      {sortField === "avg_score" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </button>
                  </th>
                  <th className="p-3 text-center border">詳細</th>
                  <th className="p-3 text-center border">削除</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
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
                      <td className="p-3 border text-center">
                        <a
                          href={`/results/${assessment.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          詳細
                        </a>
                      </td>
                      <td className="p-3 border text-center">
                        <button
                          onClick={() => handleDelete(assessment.id, assessment.company_name)}
                          disabled={deleting === assessment.id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === assessment.id ? "削除中..." : "削除"}
                        </button>
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
