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
import { analyzeScores, AnalysisResult } from "@/lib/analysis";

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
  ai_report?: any;
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
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedReport, setEditedReport] = useState<AnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);

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

      // 保存されたレポートがあればそれを使用、なければAI分析を実行
      let analysisResult: AnalysisResult;
      
      if (data.ai_report) {
        analysisResult = data.ai_report;
      } else {
        const scores = [
          data.q1_market_understanding,
          data.q2_competitive_analysis,
          data.q3_self_analysis,
          data.q4_value_proposition,
          data.q5_uniqueness,
          data.q6_product_service,
          data.q7_communication,
          data.q8_inner_branding,
          data.q9_kpi_management,
          data.q10_results,
          data.q11_ip_protection,
          data.q12_growth_intent,
        ];

        analysisResult = analyzeScores(
          scores,
          data.business_phase || "",
          data.memo || undefined
        );
      }

      setAnalysis(analysisResult);
      setEditedReport(analysisResult);
    } catch (err) {
      console.error("Error fetching assessment:", err);
      setError("データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!editedReport) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("survey_results")
        .update({ ai_report: editedReport })
        .eq("id", id);

      if (error) throw error;

      setAnalysis(editedReport);
      setEditMode(false);
      alert("レポートを保存しました");
    } catch (err) {
      console.error("Error saving report:", err);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  function handleRegenerate() {
    if (!assessment) return;

    const scores = [
      assessment.q1_market_understanding,
      assessment.q2_competitive_analysis,
      assessment.q3_self_analysis,
      assessment.q4_value_proposition,
      assessment.q5_uniqueness,
      assessment.q6_product_service,
      assessment.q7_communication,
      assessment.q8_inner_branding,
      assessment.q9_kpi_management,
      assessment.q10_results,
      assessment.q11_ip_protection,
      assessment.q12_growth_intent,
    ];

    const newAnalysis = analyzeScores(
      scores,
      assessment.business_phase || "",
      assessment.memo || undefined
    );

    setEditedReport(newAnalysis);
  }

  function updateField(field: keyof AnalysisResult, value: any) {
    if (!editedReport) return;
    setEditedReport({ ...editedReport, [field]: value });
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

  if (error || !assessment || !analysis) {
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

  const displayAnalysis = editMode ? editedReport : analysis;
  if (!displayAnalysis) return null;

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
              {editMode ? (
                <>
                  <button
                    onClick={handleRegenerate}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    AI生成に戻す
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? "保存中..." : "保存"}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedReport(analysis);
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    PDF印刷
                  </button>
                  <a
                    href="/admin/brand-check"
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-block"
                  >
                    管理画面に戻る
                  </a>
                </>
              )}
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
                    src="/variation_logo_1.png"
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

            {/* AI診断レポート - 完全版（編集可能） */}
            <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg">
                  AI
                </div>
                <h2 className="text-2xl font-bold text-gray-900">診断レポート</h2>
              </div>

              {/* 総合評価 */}
              <div className="bg-white rounded-lg p-6 mb-6 shadow-md border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl font-bold text-purple-600">■ 総合評価</span>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-full font-bold text-lg shadow">
                    {displayAnalysis.overallRating}
                  </span>
                </div>
                {editMode ? (
                  <textarea
                    value={editedReport?.overallComment || ''}
                    onChange={(e) => updateField('overallComment', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed text-base">{displayAnalysis.overallComment}</p>
                )}
              </div>

              {/* リスクアラート */}
              {displayAnalysis.riskAlerts && displayAnalysis.riskAlerts.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6 shadow-md">
                  <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🚨</span> リスクアラート
                  </h3>
                  <ul className="space-y-3">
                    {displayAnalysis.riskAlerts.map((alert: string, i: number) => (
                      <li key={i} className="bg-white rounded p-3 border border-red-200">
                        <span className="text-red-800 font-medium">{alert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 矛盾検知 */}
              {displayAnalysis.contradictions && displayAnalysis.contradictions.length > 0 && (
  <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6 shadow-md">
    <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center gap-2">
      <span className="text-2xl">⚠️</span> 矛盾検知（{displayAnalysis.contradictions.length}件）
    </h3>
    <p className="text-sm text-orange-800 mb-4 font-medium">
      スコア間で論理的な矛盾が検出されました。順序立てて改善することが重要です。
    </p>
    <ul className="space-y-3">
      {displayAnalysis.contradictions.map((contradiction: string, i: number) => (
        <li key={i} className="bg-white rounded p-3 border border-orange-200">
          {editMode ? (
            <textarea
              value={editedReport?.contradictions?.[i] || ''}
              onChange={(e) => {
                const newContradictions = [...(editedReport?.contradictions || [])];
                newContradictions[i] = e.target.value;
                updateField('contradictions', newContradictions);
              }}
              className="w-full p-2 border border-gray-300 rounded"
              rows={3}
            />
          ) : (
            <span className="text-gray-800">{contradiction}</span>
          )}
        </li>
      ))}
    </ul>
  </div>
)}

              {/* 失敗パターン検知 */}
              {displayAnalysis.failurePatterns && displayAnalysis.failurePatterns.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6 shadow-md">
                  <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
                    <span className="text-2xl">❌</span> よくある失敗パターンを検知
                  </h3>
                  <ul className="space-y-3">
                    {displayAnalysis.failurePatterns.map((pattern: string, i: number) => (
                      <li key={i} className="bg-white rounded p-3 border border-yellow-200">
                        <span className="text-gray-800">{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 記述内容との照合分析 */}
              {displayAnalysis.memoAnalysis && displayAnalysis.memoAnalysis.length > 0 && (
                <div className="bg-cyan-50 border-2 border-cyan-300 rounded-lg p-6 mb-6 shadow-md">
                  <h3 className="text-xl font-bold text-cyan-700 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔍</span> 記述内容との照合分析
                  </h3>
                  <p className="text-sm text-cyan-800 mb-4 font-medium">
                    記述された課題・展望とスコアを照合し、整合性を分析しました。
                  </p>
                  <ul className="space-y-3">
                    {displayAnalysis.memoAnalysis.map((item: string, i: number) => (
                      <li key={i} className="bg-white rounded p-3 border border-cyan-200">
                        <span className="text-gray-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 優先アクション */}
              {displayAnalysis.priorityActions && displayAnalysis.priorityActions.length > 0 && (
  <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 mb-6 shadow-md">
    <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
      <span className="text-2xl">🎯</span> 優先アクション（緊急度順）
    </h3>
    <ol className="space-y-3">
      {displayAnalysis.priorityActions.map((action: string, i: number) => (
        <li key={i} className="bg-white rounded p-3 border border-red-200 flex items-start gap-3">
          <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
            {i + 1}
          </span>
          {editMode ? (
            <textarea
              value={editedReport?.priorityActions?.[i] || ''}
              onChange={(e) => {
                const newActions = [...(editedReport?.priorityActions || [])];
                newActions[i] = e.target.value;
                updateField('priorityActions', newActions);
              }}
              className="flex-1 p-2 border border-gray-300 rounded"
              rows={2}
            />
          ) : (
            <span className="leading-relaxed font-medium text-gray-800">{action}</span>
          )}
        </li>
      ))}
    </ol>
  </div>
)}

              {/* 強み */}
              <div className="bg-white rounded-lg p-6 mb-6 shadow-md border border-green-200">
  <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
    <span className="text-2xl">✓</span> 強み
  </h3>
  <ul className="space-y-2">
    {displayAnalysis.strengths.map((strength: string, i: number) => (
      <li key={i} className="flex items-start gap-3">
        <span className="text-green-500 text-xl mt-0.5">●</span>
        {editMode ? (
          <textarea
            value={editedReport?.strengths?.[i] || ''}
            onChange={(e) => {
              const newStrengths = [...(editedReport?.strengths || [])];
              newStrengths[i] = e.target.value;
              updateField('strengths', newStrengths);
            }}
            className="flex-1 p-2 border border-gray-300 rounded"
            rows={2}
          />
        ) : (
          <span className="text-gray-700">{strength}</span>
        )}
      </li>
    ))}
  </ul>
</div>

              {/* 改善が必要な領域 */}
              {displayAnalysis.weaknesses && displayAnalysis.weaknesses.length > 0 && (
  <div className="bg-white rounded-lg p-6 mb-6 shadow-md border border-orange-200">
    <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
      <span className="text-2xl">△</span> 改善が必要な領域
    </h3>
    <ul className="space-y-2">
      {displayAnalysis.weaknesses.map((weakness: string, i: number) => (
        <li key={i} className="flex items-start gap-3">
          <span className="text-orange-500 text-xl mt-0.5">●</span>
          {editMode ? (
            <textarea
              value={editedReport?.weaknesses?.[i] || ''}
              onChange={(e) => {
                const newWeaknesses = [...(editedReport?.weaknesses || [])];
                newWeaknesses[i] = e.target.value;
                updateField('weaknesses', newWeaknesses);
              }}
              className="flex-1 p-2 border border-gray-300 rounded"
              rows={2}
            />
          ) : (
            <span className="text-gray-700">{weakness}</span>
          )}
        </li>
      ))}
    </ul>
  </div>
)}

              {/* 成功への道筋 */}
              {displayAnalysis.successPath && displayAnalysis.successPath.length > 0 && (
  <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 mb-6 shadow-md">
    <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
      <span className="text-2xl">🎯</span> 成功への道筋
    </h3>
    <ul className="space-y-3">
      {displayAnalysis.successPath.map((path: string, i: number) => (
        <li key={i} className="bg-white rounded p-3 border border-green-200">
          {editMode ? (
            <textarea
              value={editedReport?.successPath?.[i] || ''}
              onChange={(e) => {
                const newPath = [...(editedReport?.successPath || [])];
                newPath[i] = e.target.value;
                updateField('successPath', newPath);
              }}
              className="w-full p-2 border border-gray-300 rounded"
              rows={2}
            />
          ) : (
            <span className="text-gray-800 font-medium">{path}</span>
          )}
        </li>
      ))}
    </ul>
  </div>
)}

              {/* 具体的な改善提案 */}
              <div className="bg-white rounded-lg p-6 mb-6 shadow-md border border-blue-200">
                <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
                  <span className="text-2xl">→</span> 具体的な改善提案
                </h3>
                <ol className="space-y-3">
                  {displayAnalysis.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 事業フェーズ別アドバイス */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 shadow-md border border-purple-300">
                <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span> {assessment.business_phase}フェーズのアドバイス
                </h3>
                {editMode ? (
                  <textarea
                    value={editedReport?.phaseAdvice || ''}
                    onChange={(e) => updateField('phaseAdvice', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-800 leading-relaxed font-medium">{displayAnalysis.phaseAdvice}</p>
                )}
              </div>
            </div>

            {assessment.memo && (
              <div className="mb-8 mt-8">
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