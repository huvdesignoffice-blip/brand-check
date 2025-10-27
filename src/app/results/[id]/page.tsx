"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type AssessmentData = {
  id: string;
  created_at: string;
  company_name: string | null;
  respondent_name: string | null;
  respondent_email: string | null;
  industry: string | null;
  business_phase: string | null;
  memo: string | null;
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
  avg_score: number;
};

const categories = [
  { key: "q1_market_understanding", label: "市場理解" },
  { key: "q2_competitive_analysis", label: "競合分析" },
  { key: "q3_self_analysis", label: "自社分析" },
  { key: "q4_value_proposition", label: "価値提案" },
  { key: "q5_uniqueness", label: "独自性" },
  { key: "q6_product_service", label: "製品・サービス" },
  { key: "q7_communication", label: "コミュニケーション" },
  { key: "q8_inner_branding", label: "インナーブランディング" },
  { key: "q9_kpi_management", label: "KPI管理" },
  { key: "q10_results", label: "成果" },
  { key: "q11_ip_protection", label: "知財保護" },
  { key: "q12_growth_intent", label: "成長意欲" },
];

export default function ResultsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    if (id) {
      fetchAssessment();
    }
  }, [id]);

  async function fetchAssessment() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("survey_results")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setAssessment(data);
    } catch (err) {
      console.error("Error fetching assessment:", err);
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">
          {error || "データが見つかりませんでした"}
        </div>
      </div>
    );
  }

  const chartData = categories.map((cat) => ({
    category: cat.label,
    value: assessment[cat.key as keyof AssessmentData] as number,
  }));

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          {/* 印刷時は非表示のヘッダー */}
          <div className="no-print mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">ブランドチェック結果</h1>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                PDF印刷
              </button>
              <a
                href="/admin/brand-check"
  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
>
  管理画面に戻る
</a>
            </div>
          </div>

          {/* 印刷用レポート */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* ヘッダー */}
            <div className="mb-8 border-b-2 border-gray-200 pb-6">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">
                ブランドチェック診断レポート
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">作成日：</span>
                  {new Date(assessment.created_at).toLocaleDateString("ja-JP")}
                </div>
                <div>
                  <span className="font-semibold">会社名：</span>
                  {assessment.company_name || "-"}
                </div>
                <div>
                  <span className="font-semibold">回答者：</span>
                  {assessment.respondent_name || "-"}
                </div>
                <div>
                  <span className="font-semibold">業界：</span>
                  {assessment.industry || "-"}
                </div>
                <div>
                  <span className="font-semibold">ビジネスフェーズ：</span>
                  {assessment.business_phase || "-"}
                </div>
              </div>
            </div>

            {/* 総合スコア */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">総合スコア</h3>
              <div className="text-4xl font-bold text-blue-600">
                {assessment.avg_score.toFixed(1)} / 5.0
              </div>
            </div>

            {/* レーダーチャート */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">スコア分布</h3>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis domain={[0, 5]} />
                    <Radar
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 詳細スコア */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">詳細スコア</h3>
              <div className="space-y-3">
                {categories.map((cat) => {
                  const score = assessment[
                    cat.key as keyof AssessmentData
                  ] as number;
                  return (
                    <div key={cat.key} className="flex items-center gap-4">
                      <div className="w-48 font-medium">{cat.label}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6">
                        <div
                          className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${(score / 5) * 100}%` }}
                        >
                          <span className="text-white text-sm font-bold">
                            {score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* メモ */}
            {assessment.memo && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">メモ</h3>
                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {assessment.memo}
                </div>
              </div>
            )}

            {/* フッター */}
            <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
              <p>このレポートは Brand Check システムによって生成されました</p>
              <p className="mt-1">
                発行日：{new Date().toLocaleDateString("ja-JP")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}