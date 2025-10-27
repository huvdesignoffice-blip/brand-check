"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
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
          @page {
            margin: 1cm;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="no-print mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">ブランドチェック結果</h1>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                PDF印刷
              </button>
              
                href="/admin/brand-check"
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              <a>
                管理画面に戻る
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-8 border-b-2 border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-blue-600">
                    ブランドチェック診断レポート
                  </h2>
                </div>
                <div className="flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt="HUV Design Office Logo"
                    width={150}
                    height={60}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">作成日：</span>
                  {new Date(assessment.created_at).toLocaleDateString("ja-JP")}
                </div>
                <div>
                  <span className="font-semibold">会社名：</span>
                  {assessment.company_name ? `${assessment.company_name} 御中` : "-"}
                </div>
                <div>
                  <span className="font-semibold">回答者：</span>
                  {assessment.respondent_name ? `${assessment.respondent_name} 様` : "-"}
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

            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-xl font-bold mb-2">総合スコア</h3>
              <div className="text-4xl font-bold text-blue-600">
                {assessment.avg_score.toFixed(1)} / 5.0
              </div>
            </div>

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

            {/* 分析レポート */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">分析レポート</h3>
              
              {/* 弱点アラート */}
              <div className="mb-6">
                <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>改善が必要な項目</span>
                </h4>
                <div className="space-y-2">
                  {categories
                    .filter((cat) => {
                      const score = assessment[cat.key as keyof AssessmentData] as number;
                      return score < 3;
                    })
                    .map((cat) => {
                      const score = assessment[cat.key as keyof AssessmentData] as number;
                      return (
                        <div key={cat.key} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                          <div className="font-medium text-red-800">
                            {cat.label}：スコア {score.toFixed(1)}
                          </div>
                          <div className="text-sm text-red-600 mt-1">
                            {getImprovement(cat.key)}
                          </div>
                        </div>
                      );
                    })}
                  {categories.every((cat) => {
                    const score = assessment[cat.key as keyof AssessmentData] as number;
                    return score >= 3;
                  }) && (
                    <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                      <div className="text-green-800">
                        すべての項目で基準スコア（3.0以上）を達成しています！
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 強みの項目 */}
              <div className="mb-6">
                <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <span>✨</span>
                  <span>強みの項目</span>
                </h4>
                <div className="space-y-2">
                  {categories
                    .filter((cat) => {
                      const score = assessment[cat.key as keyof AssessmentData] as number;
                      return score >= 4;
                    })
                    .map((cat) => {
                      const score = assessment[cat.key as keyof AssessmentData] as number;
                      return (
                        <div key={cat.key} className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                          <div className="font-medium text-green-800">
                            {cat.label}：スコア {score.toFixed(1)}
                          </div>
                          <div className="text-sm text-green-600 mt-1">
                            この強みを活かして、さらなる成長を目指しましょう。
                          </div>
                        </div>
                      );
                    })}
                  {categories.every((cat) => {
                    const score = assessment[cat.key as keyof AssessmentData] as number;
                    return score < 4;
                  }) && (
                    <div className="p-3 bg-gray-50 border-l-4 border-gray-300 rounded">
                      <div className="text-gray-600">
                        スコア4.0以上の項目はありません。全体的な底上げを目指しましょう。
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 優先順位 */}
              <div className="mb-6">
                <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                  <span>📊</span>
                  <span>優先的に取り組むべき項目（スコアの低い順）</span>
                </h4>
                <div className="space-y-2">
                  {[...categories]
                    .sort((a, b) => {
                      const scoreA = assessment[a.key as keyof AssessmentData] as number;
                      const scoreB = assessment[b.key as keyof AssessmentData] as number;
                      return scoreA - scoreB;
                    })
                    .slice(0, 5)
                    .map((cat, index) => {
                      const score = assessment[cat.key as keyof AssessmentData] as number;
                      return (
                        <div key={cat.key} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-blue-800">
                              {cat.label}：スコア {score.toFixed(1)}
                            </div>
                            <div className="text-sm text-blue-600 mt-1">
                              {getActionPlan(cat.key)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* 総合評価 */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">総合評価</h4>
                <div className="text-sm text-gray-700">
                  {assessment.avg_score >= 4.0 && (
                    <p>優れたブランド戦略が構築されています。現在の強みを維持しながら、さらなる成長を目指しましょう。</p>
                  )}
                  {assessment.avg_score >= 3.0 && assessment.avg_score < 4.0 && (
                    <p>基本的なブランド戦略は整っていますが、改善の余地があります。優先項目に集中して取り組むことで、大きな成果が期待できます。</p>
                  )}
                  {assessment.avg_score < 3.0 && (
                    <p>ブランド戦略の強化が必要です。まずは優先順位の高い項目から着手し、段階的に改善を進めましょう。専門家のサポートを検討することをお勧めします。</p>
                  )}
                </div>
              </div>
            </div>

            {assessment.memo && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">メモ</h3>
                <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {assessment.memo}
                </div>
              </div>
            )}

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

// 改善提案を取得
function getImprovement(key: string): string {
  const improvements: Record<string, string> = {
    q1_market_understanding: "市場調査を実施し、ターゲット顧客のニーズを深く理解しましょう。",
    q2_competitive_analysis: "競合他社の戦略を分析し、自社の差別化ポイントを明確にしましょう。",
    q3_self_analysis: "SWOT分析などを活用し、自社の強み・弱みを客観的に把握しましょう。",
    q4_value_proposition: "顧客に提供する独自の価値を明確化し、わかりやすく伝えましょう。",
    q5_uniqueness: "他社にはない独自性を強化し、ブランドの差別化を図りましょう。",
    q6_product_service: "製品・サービスの品質を向上させ、顧客満足度を高めましょう。",
    q7_communication: "一貫性のあるブランドメッセージを、適切なチャネルで発信しましょう。",
    q8_inner_branding: "社員にブランド価値を浸透させ、全員がブランドアンバサダーになりましょう。",
    q9_kpi_management: "ブランド関連のKPIを設定し、定期的に測定・改善しましょう。",
    q10_results: "ブランド戦略の成果を可視化し、PDCAサイクルを回しましょう。",
    q11_ip_protection: "商標登録など、知的財産権の保護を強化しましょう。",
    q12_growth_intent: "長期的なブランド成長戦略を策定し、実行に移しましょう。",
  };
  return improvements[key] || "この項目の改善に取り組みましょう。";
}

// アクションプランを取得
function getActionPlan(key: string): string {
  const plans: Record<string, string> = {
    q1_market_understanding: "顧客インタビューの実施、市場データの収集・分析",
    q2_competitive_analysis: "競合調査レポートの作成、ポジショニングマップの作成",
    q3_self_analysis: "内部リソース監査、強み・弱みの棚卸し",
    q4_value_proposition: "バリュープロポジションキャンバスの作成",
    q5_uniqueness: "USP（独自の売り）の明確化と強化",
    q6_product_service: "顧客フィードバックの収集と改善実施",
    q7_communication: "ブランドガイドラインの策定、統一メッセージの展開",
    q8_inner_branding: "社内ワークショップの開催、ブランドブックの作成",
    q9_kpi_management: "測定指標の設定、ダッシュボードの構築",
    q10_results: "成果の定量化、レポーティング体制の確立",
    q11_ip_protection: "商標登録申請、法的保護体制の構築",
    q12_growth_intent: "3-5年のブランド戦略ロードマップの策定",
  };
  return plans[key] || "具体的なアクションプランを策定しましょう。";
}