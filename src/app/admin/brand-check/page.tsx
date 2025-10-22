"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

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
  { key: "q6_product_service", label: "商品・サービス" },
  { key: "q7_communication", label: "コミュニケーション" },
  { key: "q8_inner_branding", label: "インナーブランディング" },
  { key: "q9_kpi_management", label: "KPI運用" },
  { key: "q10_results", label: "成果実感" },
  { key: "q11_ip_protection", label: "知的保護" },
  { key: "q12_growth_intent", label: "今後の方向性" },
];

const COLORS = ["#0f172a", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function BrandCheckPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Assessment>>({});

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching assessments:", error);
    } else {
      setAssessments(data || []);
      if (data && data.length > 0 && selectedIds.length === 0) {
        setSelectedIds([data[0].id]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      if (selectedIds.length < 6) {
        setSelectedIds([...selectedIds, id]);
      } else {
        alert("最大6件まで選択できます");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このデータを削除してもよろしいですか？")) return;

    const { error } = await supabase.from("assessments").delete().eq("id", id);

    if (error) {
      alert("削除に失敗しました");
      console.error(error);
    } else {
      alert("削除しました");
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
      fetchData();
    }
  };

  const handleEdit = (assessment: Assessment) => {
    setEditingId(assessment.id);
    setEditForm(assessment);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from("assessments")
      .update({
        company_name: editForm.company_name,
        respondent_name: editForm.respondent_name,
        business_phase: editForm.business_phase,
      })
      .eq("id", editingId);

    if (error) {
      alert("更新に失敗しました");
      console.error(error);
    } else {
      alert("更新しました");
      setEditingId(null);
      fetchData();
    }
  };

  const chartData = CHART_CATEGORIES.map((cat) => {
    const dataPoint: any = { label: cat.label };
    selectedIds.forEach((id, index) => {
      const assessment = assessments.find((a) => a.id === id);
      if (assessment) {
        const value = ((assessment[cat.key as keyof Assessment] as number) || 0) * 20;
        dataPoint[`value${index}`] = value;
      }
    });
    return dataPoint;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "日時",
      "企業名",
      "回答者",
      "メール",
      "事業フェーズ",
      "市場理解",
      "競合分析",
      "自社分析",
      "価値提案",
      "独自性",
      "商品・サービス",
      "コミュニケーション",
      "インナーブランディング",
      "KPI運用",
      "成果実感",
      "知的保護",
      "今後の方向性",
      "平均スコア",
    ];

    const rows = assessments.map((a) => [
      new Date(a.created_at).toLocaleString("ja-JP"),
      a.company_name || "",
      a.respondent_name || "",
      a.respondent_email || "",
      a.business_phase || "",
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
      a.avg_score?.toFixed(1) || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `brand-check-results-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 no-print">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ブランドチェック結果</h1>
              <p className="text-sm text-gray-600 mt-1">
                {selectedIds.length}件選択中 {selectedIds.length > 1 && "（比較モード）"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                disabled={selectedIds.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                印刷・PDF保存
              </button>
              <button
                onClick={handleExportCSV}
                disabled={assessments.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSVエクスポート
              </button>
            </div>
          </div>
        </div>

        {selectedIds.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900">レーダーチャート（12カテゴリ）</h2>
              <div className="mt-2 space-y-1">
                {selectedIds.map((id, index) => {
                  const assessment = assessments.find((a) => a.id === id);
                  return assessment ? (
                    <div key={id} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                      <span className="text-gray-700">
                        {assessment.company_name} / {assessment.respondent_name} / 平均: {assessment.avg_score?.toFixed(1)} / 5.0
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div className="p-6" style={{ height: 550 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} outerRadius={150}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  {selectedIds.map((id, index) => {
                    const assessment = assessments.find((a) => a.id === id);
                    return (
                      <Radar
                        key={id}
                        name={assessment?.company_name || "Unknown"}
                        dataKey={`value${index}`}
                        stroke={COLORS[index]}
                        fill={COLORS[index]}
                        fillOpacity={0.2}
                      />
                    );
                  })}
                  <Tooltip formatter={(v: number) => `${(v / 20).toFixed(1)} / 5`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">チェックボックスで結果を選択してください</p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm no-print">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">過去の結果一覧</h2>
            <p className="text-xs text-gray-500 mt-1">チェックボックスで複数選択すると比較できます（最大6件）</p>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="py-3 pr-4 font-medium text-gray-600 w-12">選択</th>
                    <th className="py-3 pr-4 font-medium text-gray-600">日時</th>
                    <th className="py-3 pr-4 font-medium text-gray-600">企業名</th>
                    <th className="py-3 pr-4 font-medium text-gray-600">回答者</th>
                    <th className="py-3 pr-4 font-medium text-gray-600">事業フェーズ</th>
                    <th className="py-3 pr-4 font-medium text-gray-600">平均スコア</th>
                    <th className="py-3 pr-4 font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.length > 0 ? (
                    assessments.map((assessment) => (
                      <tr
                        key={assessment.id}
                        className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                          selectedIds.includes(assessment.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="py-3 pr-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(assessment.id)}
                            onChange={() => toggleSelection(assessment.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap text-gray-700">
                          {new Date(assessment.created_at).toLocaleString("ja-JP")}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{assessment.company_name ?? "-"}</td>
                        <td className="py-3 pr-4 text-gray-700">{assessment.respondent_name ?? "-"}</td>
                        <td className="py-3 pr-4 text-gray-700">{assessment.business_phase ?? "-"}</td>
                        <td className="py-3 pr-4 text-gray-700 font-medium">{assessment.avg_score?.toFixed(1) ?? "-"} / 5.0</td>
                        <td className="py-3 pr-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(assessment)}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(assessment.id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        まだデータがありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {editingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">データ編集</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">企業名</label>
                  <input
                    type="text"
                    value={editForm.company_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">回答者名</label>
                  <input
                    type="text"
                    value={editForm.respondent_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, respondent_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">事業フェーズ</label>
                  <select
                    value={editForm.business_phase || ""}
                    onChange={(e) => setEditForm({ ...editForm, business_phase: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    <option value="準備中">準備中</option>
                    <option value="上市直後">上市直後</option>
                    <option value="定着中">定着中</option>
                    <option value="改善中">改善中</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400">© 2025 HUV DESIGN OFFICE</div>
      </div>
    </main>
  );
}