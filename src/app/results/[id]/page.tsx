'use client';

// ビルド時の静的生成をスキップ
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

type AIReport = {
  overallComment: string;
  contradictions: string[];
  priorityActions: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  successPath: string[];
  phaseAdvice: string;
};

interface SurveyResult {
  id: string;
  created_at: string;
  company_name: string;
  respondent_name: string;
  respondent_email: string;
  industry: string;
  business_phase: string;
  memo: string;
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
  ai_report: AIReport | null;
}

const QUESTIONS = [
  { id: 'q1_market_understanding', label: '市場理解', description: '自社の「理想的な顧客像（ターゲット）」が明確で、社内でも共有されている。' },
  { id: 'q2_competitive_analysis', label: '競合分析', description: '主な競合と自社の違いを、言語化して説明できる。' },
  { id: 'q3_self_analysis', label: '自社分析', description: '自社の強み・弱みを、第三者に説明できるレベルで把握している。' },
  { id: 'q4_value_proposition', label: '価値提案', description: '自社が「誰に」「どんな価値を」「なぜ提供できるのか」が明文化されている。' },
  { id: 'q5_uniqueness', label: '独自性', description: '競合が真似できない「独自の意味」や「世界観」がある。' },
  { id: 'q6_product_service', label: '商品・サービス', description: '提供する商品・サービスが、ブランドの理念と整合している。' },
  { id: 'q7_communication', label: 'コミュニケーション', description: 'ブランドのメッセージが、Web・営業・採用など全てで一貫している。' },
  { id: 'q8_inner_branding', label: 'インナーブランディング', description: '社員が自社のブランド価値を理解し、日常業務で体現している。' },
  { id: 'q9_kpi_management', label: 'KPI運用', description: 'ブランドに関する目標（KPI）や指標を定期的にモニタリングしている。' },
  { id: 'q10_results', label: '成果実感', description: 'ブランド施策によって、売上・採用・顧客満足度などに変化が出ている。' },
  { id: 'q11_ip_protection', label: '知的保護', description: 'ブランド名・ロゴ・デザインなど、法的保護（商標・特許）を意識している。' },
  { id: 'q12_growth_intent', label: '今後の方向性', description: '自社のブランドを資産として成長させたいという意思がある。' },
];

export default function ResultPage() {
  const params = useParams();
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedReport, setEditedReport] = useState<AIReport | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchResult = async () => {
      const { data, error } = await supabase
        .from('survey_results')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching result:', error);
      } else {
        setResult(data);
        
        // AI レポートがない場合は自動生成
        if (!data.ai_report) {
          await generateAIReport(data);
        }
      }
      setLoading(false);
    };

    if (params.id) {
      fetchResult();
    }
  }, [params.id]);

  async function generateAIReport(assessmentData: SurveyResult) {
    try {
      setGeneratingAI(true);

      const response = await fetch("/api/analyze-with-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scores: [
            assessmentData.q1_market_understanding,
            assessmentData.q2_competitive_analysis,
            assessmentData.q3_self_analysis,
            assessmentData.q4_value_proposition,
            assessmentData.q5_uniqueness,
            assessmentData.q6_product_service,
            assessmentData.q7_communication,
            assessmentData.q8_inner_branding,
            assessmentData.q9_kpi_management,
            assessmentData.q10_results,
            assessmentData.q11_ip_protection,
            assessmentData.q12_growth_intent,
          ],
          memo: assessmentData.memo,
          businessPhase: assessmentData.business_phase,
          companyName: assessmentData.company_name,
        }),
      });

      if (!response.ok) throw new Error("AI分析に失敗しました");

      const aiReport = await response.json();

      // データベースを更新
      const { error: updateError } = await supabase
        .from("survey_results")
        .update({ ai_report: aiReport })
        .eq("id", assessmentData.id);

      if (updateError) throw updateError;

      // 状態を更新
      setResult((prev) => (prev ? { ...prev, ai_report: aiReport } : null));
    } catch (err) {
      console.error("Error generating AI report:", err);
      alert("AI分析に失敗しました: " + (err as Error).message);
    } finally {
      setGeneratingAI(false);
    }
  }

  function handleEdit() {
    if (result?.ai_report) {
      // 深いコピーを作成
      setEditedReport(JSON.parse(JSON.stringify(result.ai_report)));
      setEditMode(true);
    }
  }

  function handleCancelEdit() {
    setEditedReport(null);
    setEditMode(false);
  }

  async function handleSaveEdit() {
    if (!editedReport || !result) return;

    try {
      const { error } = await supabase
        .from("survey_results")
        .update({ ai_report: editedReport })
        .eq("id", result.id);

      if (error) throw error;

      setResult({ ...result, ai_report: editedReport });
      setEditMode(false);
      setEditedReport(null);
      alert("レポートを保存しました");
    } catch (err) {
      console.error("Error saving report:", err);
      alert("保存に失敗しました: " + (err as Error).message);
    }
  }

  async function handleResetToAI() {
    if (!result) return;
    
    const confirm = window.confirm("AI生成の内容に戻しますか？編集内容は失われます。");
    if (!confirm) return;

    await generateAIReport(result);
    setEditMode(false);
    setEditedReport(null);
  }

  function updateField(field: keyof AIReport, value: any) {
    if (editedReport) {
      setEditedReport({ ...editedReport, [field]: value });
    }
  }

  function updateArrayField(field: keyof AIReport, index: number, value: string) {
    if (editedReport && Array.isArray(editedReport[field])) {
      const newArray = [...(editedReport[field] as string[])];
      newArray[index] = value;
      setEditedReport({ ...editedReport, [field]: newArray });
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">結果が見つかりません</h1>
          <p className="text-gray-600">指定されたIDのデータが存在しません。</p>
        </div>
      </div>
    );
  }

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
    result.q12_growth_intent,
  ];

  const avgScore = Number(
    result.avg_score || (scores.reduce((a, b) => a + b, 0) / 12)
  ).toFixed(1);

  const chartData = QUESTIONS.map((q) => ({
    category: q.label,
    value: (result as any)[q.id],
  }));

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-50';
    if (score >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return '優秀';
    if (score >= 4) return '良好';
    if (score >= 3) return '普通';
    if (score >= 2) return '要改善';
    return '要注意';
  };

  const displayAnalysis = editMode && editedReport ? editedReport : result.ai_report;

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

      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* ヘッダーボタン */}
          <div className="no-print mb-6 flex justify-end gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={handlePrint}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  PDF印刷
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!result.ai_report}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  編集
                </button>
                <a
                  href="/admin/brand-check"
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-block"
                >
                  管理画面に戻る
                </a>
              </>
            ) : (
              <>
                <button
                  onClick={handleResetToAI}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  AI生成に戻す
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  キャンセル
                </button>
              </>
            )}
          </div>

          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">ブランドチェック診断結果</h1>
            <p className="text-blue-100">Brand Check Assessment Report</p>
          </div>

          {/* AI生成中の表示 */}
          {generatingAI && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-blue-700 font-semibold">AI分析中...（5-10秒お待ちください）</p>
            </div>
          )}

          {/* 基本情報 */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">企業名</p>
                <p className="text-lg font-semibold text-gray-900">{result.company_name} 御中</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">回答者</p>
                <p className="text-lg font-semibold text-gray-900">{result.respondent_name} 様</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">業種</p>
                <p className="text-lg font-semibold text-gray-900">{result.industry || '未回答'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">事業フェーズ</p>
                <p className="text-lg font-semibold text-gray-900">{result.business_phase}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">回答日時</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(result.created_at).toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </div>

          {/* 総合スコア */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">総合スコア</h2>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-8 mb-4">
                  <p className="text-6xl font-bold text-white">{avgScore}</p>
                  <p className="text-xl text-blue-100">/ 5.0</p>
                </div>
                <p className={`text-2xl font-bold mt-4 px-6 py-2 rounded-full inline-block ${getScoreColor(Number(avgScore))}`}>
                  {getScoreLabel(Number(avgScore))}
                </p>
              </div>
            </div>
          </div>

          {/* レーダーチャート */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">スコア分布</h2>
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
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">項目別スコア</h2>
            <div className="space-y-4">
              {QUESTIONS.map((question, index) => {
                const score = (result as any)[question.id];
                return (
                  <div key={question.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-500">Q{index + 1}</span>
                          <h3 className="text-lg font-bold text-gray-900">{question.label}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{question.description}</p>
                      </div>
                      <div className="ml-4">
                        <span className={`text-2xl font-bold px-4 py-2 rounded-lg ${getScoreColor(score)}`}>
                          {score}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI分析レポート */}
          {displayAnalysis && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-6 border-b-2 border-blue-200 pb-2">
                AI分析レポート
              </h2>

              {/* 総合評価 */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span> 総合評価
                </h3>
                {editMode ? (
                  <textarea
                    value={editedReport?.overallComment || ''}
                    onChange={(e) => updateField('overallComment', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg"
                    rows={6}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {displayAnalysis.overallComment}
                  </p>
                )}
              </div>

              {/* 矛盾検知 */}
              {displayAnalysis.contradictions && displayAnalysis.contradictions.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-yellow-700 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span> 矛盾検知
                  </h3>
                  <ul className="space-y-2">
                    {displayAnalysis.contradictions.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-yellow-600 mt-1">•</span>
                        {editMode ? (
                          <textarea
                            value={editedReport?.contradictions?.[i] || ''}
                            onChange={(e) => updateArrayField('contradictions', i, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded"
                            rows={2}
                          />
                        ) : (
                          <span className="text-gray-700 flex-1">{item}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 優先アクション */}
              {displayAnalysis.priorityActions && displayAnalysis.priorityActions.length > 0 && (
                <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6">
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
                            onChange={(e) => updateArrayField('priorityActions', i, e.target.value)}
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
              {displayAnalysis.strengths && displayAnalysis.strengths.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-green-200">
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
                            onChange={(e) => updateArrayField('strengths', i, e.target.value)}
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
              )}

              {/* 改善が必要な領域 */}
              {displayAnalysis.weaknesses && displayAnalysis.weaknesses.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-orange-200">
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
                            onChange={(e) => updateArrayField('weaknesses', i, e.target.value)}
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

              {/* 具体的な改善提案 */}
              {displayAnalysis.recommendations && displayAnalysis.recommendations.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-md border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
                    <span className="text-2xl">💡</span> 具体的な改善提案
                  </h3>
                  <ol className="space-y-3">
                    {displayAnalysis.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {editMode ? (
                          <textarea
                            value={editedReport?.recommendations?.[i] || ''}
                            onChange={(e) => updateArrayField('recommendations', i, e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded"
                            rows={2}
                          />
                        ) : (
                          <span className="text-gray-700 flex-1">{rec}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* 成功への道筋 */}
              {displayAnalysis.successPath && displayAnalysis.successPath.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span> 成功への道筋
                  </h3>
                  <ul className="space-y-3">
                    {displayAnalysis.successPath.map((path: string, i: number) => (
                      <li key={i} className="bg-white rounded p-3 border border-green-200">
                        {editMode ? (
                          <textarea
                            value={editedReport?.successPath?.[i] || ''}
                            onChange={(e) => updateArrayField('successPath', i, e.target.value)}
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

              {/* 事業フェーズ別アドバイス */}
              {displayAnalysis.phaseAdvice && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 shadow-md border border-purple-300">
                  <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                    <span className="text-2xl">💡</span> {result.business_phase}フェーズのアドバイス
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
              )}
            </div>
          )}

          {/* メモ */}
          {result.memo && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 mt-8">
              <h3 className="text-xl font-bold mb-4">現状の課題・将来の展望</h3>
              <p className="text-base text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {result.memo}
              </p>
            </div>
          )}

          {/* フッター */}
          <div className="text-center text-gray-600 text-sm mt-12">
            <p>© 2025 HUV DESIGN OFFICE</p>
          </div>
        </div>
      </div>
    </>
  );
}