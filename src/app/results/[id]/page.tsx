/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import { analyzeScores, AnalysisResult } from "@/lib/analysis";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function ResultPage({ params }: any) {
  const [id, setId] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedReport, setEditedReport] = useState<AnalysisResult | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then((p: any) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data: result, error } = await supabase
        .from("survey_results")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !result) {
        setLoading(false);
        return;
      }

      setData(result);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-xl text-gray-600">読み込み中...</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-xl text-red-600">データが見つかりません</div>
      </main>
    );
  }

  const scores = [
    data.q1_market_understanding, data.q2_competitive_analysis, data.q3_self_analysis,
    data.q4_value_proposition, data.q5_uniqueness, data.q6_product_service,
    data.q7_communication, data.q8_inner_branding, data.q9_kpi_management,
    data.q10_results, data.q11_ip_protection, data.q12_growth_intent,
  ];
  const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / 12;

  const items = [
    { name: "市場理解", val: data.q1_market_understanding },
    { name: "競合分析", val: data.q2_competitive_analysis },
    { name: "自社分析", val: data.q3_self_analysis },
    { name: "価値提案", val: data.q4_value_proposition },
    { name: "独自性", val: data.q5_uniqueness },
    { name: "商品サービス", val: data.q6_product_service },
    { name: "コミュニケーション", val: data.q7_communication },
    { name: "インナーブランディング", val: data.q8_inner_branding },
    { name: "KPI管理", val: data.q9_kpi_management },
    { name: "成果", val: data.q10_results },
    { name: "知財保護", val: data.q11_ip_protection },
    { name: "成長意欲", val: data.q12_growth_intent },
  ];

  const aiAnalysis = analyzeScores(scores, data.business_phase, data.memo || undefined);
  const analysis = data.edited_report || editedReport || aiAnalysis;
  const isEdited = !!data.edited_report || !!editedReport;

  const handleEdit = () => {
    setEditedReport(data.edited_report || aiAnalysis);
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedReport(null);
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!editedReport) return;
    setSaving(true);

    try {
      const response = await fetch('/api/update-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, editedReport }),
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setEditMode(false);
        alert('レポートを保存しました');
      } else {
        alert('保存に失敗しました');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('保存エラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToAI = async () => {
    if (!confirm('AI生成レポートに戻しますか？編集内容は失われます。')) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/update-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, editedReport: null }),
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setEditedReport(null);
        setEditMode(false);
        alert('AI生成レポートに戻しました');
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert('リセットエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof AnalysisResult, value: any) => {
    if (!editedReport) return;
    setEditedReport({ ...editedReport, [field]: value });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Brand Check Result</h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-600">Company</p><p className="text-lg font-semibold">{data.company_name}</p></div>
              <div><p className="text-sm text-gray-600">Respondent</p><p className="text-lg font-semibold">{data.respondent_name}</p></div>
              <div><p className="text-sm text-gray-600">Phase</p><p className="text-lg font-semibold">{data.business_phase}</p></div>
              <div><p className="text-sm text-gray-600">Date</p><p className="text-lg font-semibold">{new Date(data.created_at).toLocaleDateString()}</p></div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">Overall Score</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-green-600">{avgScore.toFixed(1)}</span>
              <span className="text-2xl text-gray-600">/ 5.0</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-md">
            <h2 className="text-xl font-semibold mb-6">レーダーチャート</h2>
            <div className="max-w-2xl mx-auto">
              <Radar
                data={{
                  labels: [
                    '市場理解',
                    '競合分析',
                    '自社分析',
                    '価値提案',
                    '独自性',
                    '商品サービス',
                    'コミュニケーション',
                    'インナーブランディング',
                    'KPI管理',
                    '成果',
                    '知財保護',
                    '成長意欲',
                  ],
                  datasets: [
                    {
                      label: 'スコア',
                      data: scores,
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      borderColor: 'rgb(59, 130, 246)',
                      borderWidth: 2,
                      pointBackgroundColor: 'rgb(59, 130, 246)',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: 'rgb(59, 130, 246)',
                    },
                  ],
                }}
                options={{
                  scales: {
                    r: {
                      min: 0,
                      max: 5,
                      ticks: {
                        stepSize: 1,
                      },
                      pointLabels: {
                        font: {
                          size: 12,
                        },
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  maintainAspectRatio: true,
                  aspectRatio: 1.5,
                }}
              />
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            {items.map((item, i) => {
              const pct = (item.val / 5) * 100;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-40 text-sm font-medium">{item.name}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                    <div className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2" style={{width: pct + "%"}}>
                      <span className="text-xs font-bold text-white">{item.val}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 mb-6 print:hidden">
            {!editMode ? (
              <>
                <button
                  onClick={handleEdit}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
                >
                  レポートを編集
                </button>
                {isEdited && (
                  <button
                    onClick={handleResetToAI}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium"
                    disabled={saving}
                  >
                    AI生成に戻す
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
                  disabled={saving}
                >
                  {saving ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium"
                  disabled={saving}
                >
                  キャンセル
                </button>
              </>
            )}
          </div>

          {isEdited && !editMode && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 font-medium">
                ✏️ このレポートは編集されています
              </p>
            </div>
          )}

          {/* AI診断レポート - 完全版 */}
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
                  {analysis.overallRating}
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
                <p className="text-gray-700 leading-relaxed text-base">{analysis.overallComment}</p>
              )}
            </div>

            {/* リスクアラート */}
            {analysis.riskAlerts && analysis.riskAlerts.length > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6 shadow-md">
                <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🚨</span> リスクアラート
                </h3>
                <ul className="space-y-3">
                  {analysis.riskAlerts.map((alert: string, i: number) => (
                    <li key={i} className="bg-white rounded p-3 border border-red-200">
                      <span className="text-red-800 font-medium">{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 矛盾検知 */}
            {analysis.contradictions && analysis.contradictions.length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6 shadow-md">
                <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span> 矛盾検知（{analysis.contradictions.length}件）
                </h3>
                <p className="text-sm text-orange-800 mb-4 font-medium">
                  スコア間で論理的な矛盾が検出されました。順序立てて改善することが重要です。
                </p>
                <ul className="space-y-3">
                  {analysis.contradictions.map((contradiction: string, i: number) => (
                    <li key={i} className="bg-white rounded p-3 border border-orange-200">
                      <span className="text-gray-800">{contradiction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 失敗パターン検知 */}
            {analysis.failurePatterns && analysis.failurePatterns.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-6 shadow-md">
                <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">❌</span> よくある失敗パターンを検知
                </h3>
                <ul className="space-y-3">
                  {analysis.failurePatterns.map((pattern: string, i: number) => (
                    <li key={i} className="bg-white rounded p-3 border border-yellow-200">
                      <span className="text-gray-800">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 記述内容との照合分析 */}
            {analysis.memoAnalysis && analysis.memoAnalysis.length > 0 && (
              <div className="bg-cyan-50 border-2 border-cyan-300 rounded-lg p-6 mb-6 shadow-md">
                <h3 className="text-xl font-bold text-cyan-700 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔍</span> 記述内容との照合分析
                </h3>
                <p className="text-sm text-cyan-800 mb-4 font-medium">
                  記述された課題・展望とスコアを照合し、整合性を分析しました。
                </p>
                <ul className="space-y-3">
                  {analysis.memoAnalysis.map((item: string, i: number) => (
                    <li key={i} className="bg-white rounded p-3 border border-cyan-200">
                      <span className="text-gray-800">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 優先アクション */}
            {analysis.priorityActions && analysis.priorityActions.length > 0 && (
              <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 mb-6 shadow-md">
                <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> 優先アクション（緊急度順）
                </h3>
                <ol className="space-y-3">
                  {analysis.priorityActions.map((action: string, i: number) => (
                    <li key={i} className="bg-white rounded p-3 border border-red-200 flex items-start gap-3">
                      <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed font-medium text-gray-800">{action}</span>
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
                {analysis.strengths.map((strength: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl mt-0.5">●</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 改善が必要な領域 */}
            {analysis.weaknesses && analysis.weaknesses.length > 0 && (
              <div className="bg-white rounded-lg p-6 mb-6 shadow-md border border-orange-200">
                <h3 className="text-xl font-bold text-orange-600 mb-4 flex items-center gap-2">
                  <span className="text-2xl">△</span> 改善が必要な領域
                </h3>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-orange-500 text-xl mt-0.5">●</span>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 成功への道筋 */}
            {analysis.successPath && analysis.successPath.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6 mb-6 shadow-md">
                <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span> 成功への道筋
                </h3>
                <ul className="space-y-3">
                  {analysis.successPath.map((path: string, i: number) => (
                    <li key={i} className="bg-white rounded p-3 border border-green-200">
                      <span className="text-gray-800 font-medium">{path}</span>
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
                {analysis.recommendations.map((rec: string, i: number) => (
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
                <span className="text-2xl">💡</span> {data.business_phase}フェーズのアドバイス
              </h3>
              {editMode ? (
                <textarea
                  value={editedReport?.phaseAdvice || ''}
                  onChange={(e) => updateField('phaseAdvice', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                />
              ) : (
                <p className="text-gray-800 leading-relaxed font-medium">{analysis.phaseAdvice}</p>
              )}
            </div>
          </div>

          {data.memo && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">現状の課題・将来の展望</h3>
              <p className="text-sm text-gray-600">{data.memo}</p>
            </div>
          )}

          <div className="mt-8">
            <a href="/admin" className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700">Back to Admin</a>
          </div>
        </div>
      </div>
    </main>
  );
}