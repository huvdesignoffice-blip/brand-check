'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

type Assessment = {
  id: string;
  created_at: string;
  company_name: string | null;
  respondent_name: string | null;
  respondent_email: string | null;
  business_phase: string | null;
  q1_market_understanding: number | null;
  q2_competitive_analysis: number | null;
  q3_self_analysis: number | null;
  q4_value_proposition: number | null;
  q5_uniqueness: number | null;
  q6_product_service: number | null;
  q7_communication: number | null;
  q8_inner_branding: number | null;
  q9_kpi_management: number | null;
  q10_results: number | null;
  q11_ip_protection: number | null;
  q12_growth_intent: number | null;
  avg_score: number | null;
};

const CHART_CATEGORIES = [
  { key: "q1_market_understanding", label: "市場理解" },
  { key: "q2_competitive_analysis", label: "競合分析" },
  { key: "q3_self_analysis", label: "自社分析" },
  { key: "q4_value_proposition", label: "価値提案" },
  { key: "q5_uniqueness", label: "独自性" },
  { key: "q6_product_service", label: "商品サービス" },
  { key: "q7_communication", label: "コミュニケーション" },
  { key: "q8_inner_branding", label: "インナーブランディング" },
  { key: "q9_kpi_management", label: "KPI管理" },
  { key: "q10_results", label: "成果" },
  { key: "q11_ip_protection", label: "知財保護" },
  { key: "q12_growth_intent", label: "成長意欲" },
];

export default function BrandCheckPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAssessments = async () => {
      const { data, error } = await supabase
        .from("survey_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching assessments:", error);
      } else {
        const assessmentsWithAvg = (data || []).map((item) => {
          const scores = [
            item.q1_market_understanding,
            item.q2_competitive_analysis,
            item.q3_self_analysis,
            item.q4_value_proposition,
            item.q5_uniqueness,
            item.q6_product_service,
            item.q7_communication,
            item.q8_inner_branding,
            item.q9_kpi_management,
            item.q10_results,
            item.q11_ip_protection,
            item.q12_growth_intent,
          ];
          const avg = scores.reduce((a, b) => (a || 0) + (b || 0), 0) / 12;
          return { ...item, avg_score: avg };
        });
        setAssessments(assessmentsWithAvg);
      }
      setLoading(false);
    };

    fetchAssessments();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(assessments.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length}件のデータを削除しますか？`)) return;

    const { error } = await supabase
      .from("survey_results")
      .delete()
      .in("id", selectedIds);

    if (error) {
      console.error("Delete error:", error);
      alert("削除に失敗しました");
    } else {
      setAssessments((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
      setSelectedIds([]);
      alert("削除しました");
    }
  };

  const handleExportCSV = () => {
    const selectedData = assessments.filter((a) => selectedIds.includes(a.id));
    if (selectedData.length === 0) {
      alert("エクスポートするデータを選択してください");
      return;
    }

    const headers = [
      "企業名", "回答者", "事業フェーズ", "平均スコア", "日時",
      "市場理解", "競合分析", "自社分析", "価値提案", "独自性", "商品サービス",
      "コミュニケーション", "インナーブランディング", "KPI管理", "成果", "知財保護", "成長意欲"
    ];

    const rows = selectedData.map((a) => [
      a.company_name || "",
      a.respondent_name || "",
      a.business_phase || "",
      (a.avg_score || 0).toFixed(1),
      new Date(a.created_at).toLocaleString(),
      a.q1_market_understanding || "",
      a.q2_competitive_analysis || "",
      a.q3_self_analysis || "",
      a.q4_value_proposition || "",
      a.q5_uniqueness || "",
      a.q6_product_service || "",
      a.q7_communication || "",
      a.q8_inner_branding || "",
      a.q9_kpi_management || "",
      a.q10_results || "",
      a.q11_ip_protection || "",
      a.q12_growth_intent || "",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `brand-check-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const selectedAssessments = assessments.filter((a) => selectedIds.includes(a.id));
  const chartData = CHART_CATEGORIES.map((cat) => {
    const values = selectedAssessments.map((a) => (a as any)[cat.key] || 0);
    const avg = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
    return { category: cat.label, value: avg };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ブランドチェック結果</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">{selectedIds.length}件選択中</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={selectedIds.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                削除
              </button>
              <button
                onClick={handleExportCSV}
                disabled={selectedIds.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                CSVエクスポート
              </button>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">選択データの平均スコア</h2>
              <div className="flex justify-center">
                <RadarChart width={500} height={400} data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                </RadarChart>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === assessments.length && assessments.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-3">日時</th>
                  <th className="p-3">企業名</th>
                  <th className="p-3">回答者</th>
                  <th className="p-3">事業フェーズ</th>
                  <th className="p-3">平均スコア</th>
                  <th className="p-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {assessments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      まだデータがありません
                    </td>
                  </tr>
                ) : (
                  assessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(assessment.id)}
                          onChange={() => handleSelect(assessment.id)}
                        />
                      </td>
                      <td className="p-3">{new Date(assessment.created_at).toLocaleString()}</td>
                      <td className="p-3">{assessment.company_name || "-"}</td>
                      <td className="p-3">{assessment.respondent_name || "-"}</td>
                      <td className="p-3">{assessment.business_phase || "-"}</td>
                      <td className="p-3">{(assessment.avg_score || 0).toFixed(1)}</td>
                      <td className="p-3">
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