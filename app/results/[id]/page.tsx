'use client';

// ビルド時の静的生成をスキップ
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

type AIReport = {
  // 新形式
  layerAnalysis?: {
    strategy: { avg: number; comment: string };
    execution: { avg: number; comment: string };
    outcome: { avg: number; comment: string };
    balance: string;
  };
  phaseGuide?: string;
  scoreGaps?: string[];
  top3Strengths?: Array<{
    rank: number;
    item: string;
    score: number;
    advice: string;
  }>;
  top3Bottlenecks?: Array<{
    rank: number;
    item: string;
    score: number;
    advice: string;
  }>;
  roadmap?: {
    months1to2: string[];
    months3to4: string[];
    months5to6: string[];
    summary: string;
  };
  // 旧形式（後方互換性のため残す）
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
  revenue_scale: string;
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
  adjusted_ai_report?: AIReport | null;
   adjusted_scores?: {  // ← この行を追加
    q1?: number;       // ← この行を追加
    q2?: number;       // ← この行を追加
    q3?: number;       // ← この行を追加
    q4?: number;       // ← この行を追加
    q5?: number;       // ← この行を追加
    q6?: number;       // ← この行を追加
    q7?: number;       // ← この行を追加
    q8?: number;       // ← この行を追加
    q9?: number;       // ← この行を追加
    q10?: number;      // ← この行を追加
    q11?: number;      // ← この行を追加
    q12?: number;      // ← この行を追加
  } | null;        
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
const [adjustedScores, setAdjustedScores] = useState<{[key: string]: number}>({}); // ← この行を追加

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
  
  // 修正スコアがあれば読み込む
  if (data.adjusted_scores) {
    setAdjustedScores(data.adjusted_scores);
  }
  
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
        .update({ adjusted_ai_report: aiReport })
        .eq("id", assessmentData.id);

      if (updateError) throw updateError;

      // 状態を更新
      setResult((prev) => prev ? { ...prev, adjusted_ai_report: aiReport, adjusted_scores: adjustedScores } : null);
    } catch (err) {
      console.error("Error generating AI report:", err);
      alert("AI分析に失敗しました: " + (err as Error).message);
    } finally {
      setGeneratingAI(false);
    }
  }

  function handleEdit() {
    if (result?.ai_report) {
      setEditedReport({ ...result.ai_report });
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
async function handleSaveAdjustedScores() {
  if (!result) return;

  try {
    setGeneratingAI(true);

    // 修正スコアをデータベースに保存
    const { error: updateError } = await supabase
      .from("survey_results")
      .update({ adjusted_scores: adjustedScores })
      .eq("id", result.id);

    if (updateError) throw updateError;

    // 修正スコアでAI分析を再実行
    const scoresArray = [
      adjustedScores.q1 ?? result.q1_market_understanding,
      adjustedScores.q2 ?? result.q2_competitive_analysis,
      adjustedScores.q3 ?? result.q3_self_analysis,
      adjustedScores.q4 ?? result.q4_value_proposition,
      adjustedScores.q5 ?? result.q5_uniqueness,
      adjustedScores.q6 ?? result.q6_product_service,
      adjustedScores.q7 ?? result.q7_communication,
      adjustedScores.q8 ?? result.q8_inner_branding,
      adjustedScores.q9 ?? result.q9_kpi_management,
      adjustedScores.q10 ?? result.q10_results,
      adjustedScores.q11 ?? result.q11_ip_protection,
      adjustedScores.q12 ?? result.q12_growth_intent,
    ];

    const response = await fetch("/api/analyze-with-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scores: scoresArray,
        memo: result.memo,
        businessPhase: result.business_phase,
        companyName: result.company_name,
      }),
    });

    if (!response.ok) throw new Error("AI分析に失敗しました");

    const aiReport = await response.json();

    // AI分析結果を保存
    const { error: aiUpdateError } = await supabase
      .from("survey_results")
      .update({ ai_report: aiReport })
      .eq("id", result.id);

    if (aiUpdateError) throw aiUpdateError;

    // 状態を更新
    setResult((prev) => prev ? { ...prev, ai_report: aiReport, adjusted_scores: adjustedScores } : null);
    alert("修正スコアを保存し、AI分析を更新しました");
  } catch (err) {
    console.error("Error saving adjusted scores:", err);
    alert("保存に失敗しました: " + (err as Error).message);
  } finally {
    setGeneratingAI(false);
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

// 修正後の平均スコアを計算
const adjustedAvgScore = Object.keys(adjustedScores).length > 0
  ? Number(
      [
        adjustedScores.q1 ?? result.q1_market_understanding,
        adjustedScores.q2 ?? result.q2_competitive_analysis,
        adjustedScores.q3 ?? result.q3_self_analysis,
        adjustedScores.q4 ?? result.q4_value_proposition,
        adjustedScores.q5 ?? result.q5_uniqueness,
        adjustedScores.q6 ?? result.q6_product_service,
        adjustedScores.q7 ?? result.q7_communication,
        adjustedScores.q8 ?? result.q8_inner_branding,
        adjustedScores.q9 ?? result.q9_kpi_management,
        adjustedScores.q10 ?? result.q10_results,
        adjustedScores.q11 ?? result.q11_ip_protection,
        adjustedScores.q12 ?? result.q12_growth_intent,
      ].reduce((a, b) => a + b, 0) / 12
    ).toFixed(1)
  : null;
  const chartData = QUESTIONS.map((q, index) => {
  const qNum = `q${index + 1}`;
  return {
    category: q.label,
    value: (result as any)[q.id],
    adjustedValue: adjustedScores[qNum] ?? (result as any)[q.id],
  };
});
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-50';
    if (score >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
        レポートを編集
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
      {Object.keys(adjustedScores).length > 0 && (
        <button
          onClick={handleSaveAdjustedScores}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          修正スコアを保存してAI再実行
        </button>
      )}
      <button
        onClick={handleSaveEdit}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        レポート編集を保存
      </button>
      <button
        onClick={handleResetToAI}
        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
      >
        AI生成に戻す
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">ブランドチェック診断結果</h1>
                <p className="text-blue-100">Brand Check Assessment Report</p>
              </div>
              <div className="flex-shrink-0">
                <Image
                  src="/variation logo_1.png"
                  alt="HUV Design Office Logo"
                  width={150}
                  height={60}
                  className="object-contain"
                  priority
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </div>
          </div>

          {/* AI生成中の表示 */}
          {generatingAI && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-blue-700 font-semibold">AI分析中...（5-10秒お待ちください）</p>
            </div>
          )}

          {/* スコアの読み方ガイド */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 スコアの読み方</h2>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-700 font-semibold">このブランドチェックでは、各項目を1〜5点で評価しています。</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-bold text-green-600">5点：</span>仕組みとしてほぼ理想的な状態。定期的に見直している</p>
                <p><span className="font-bold text-blue-600">4点：</span>概ねできているが、一部は属人的・場当たり的</p>
                <p><span className="font-bold text-yellow-600">3点：</span>重要性は理解しており、一部は実行できているが、まだ仕組みとして弱い</p>
                <p><span className="font-bold text-orange-600">2点：</span>必要だと分かっているが、ほぼ手つかず</p>
                <p><span className="font-bold text-red-600">1点：</span>ほとんど取り組めていない／知らないに近い</p>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-800 mb-3">⚠️ スコアについての重要な注意事項</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>このスコアは回答者の実感値を反映しています。絶対的な数値ではなく、現時点での主観的な評価である点にご留意ください。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>社内でより多くの方にご回答いただくことで、スコアの信頼性が相対的に向上します。可能であれば、経営陣・マネジメント層・現場メンバーなど、複数の立場からの回答を集めることを推奨します。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>このレポートは「現状の認識」を可視化するツールであり、定期的に測定することで、ブランド強化の進捗を追跡できます。</span>
                </li>
              </ul>
            </div>
          </div>

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
  <p className="text-sm text-gray-600 mb-1">年間売上規模</p>
  <p className="text-lg font-semibold text-gray-900">{result.revenue_scale || '未回答'}</p>
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
          
{/* メモ */}
          {result.memo && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 mt-8">
              <h3 className="text-xl font-bold mb-4">現状の課題・将来の展望</h3>
              <p className="text-base text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {result.memo}
              </p>
            </div>
          )}

          {/* {/* 総合スコア */}
<div className="bg-white rounded-xl shadow-lg p-8 mb-8">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">総合スコア</h2>
  <div className="flex items-center justify-center">
    {Object.keys(adjustedScores).length > 0 ? (
      // 修正スコアがある場合：2つ並べて表示
      <div className="flex gap-12 items-center">
        {/* 元のスコア */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">回答者スコア（自己評価）</p>
          <div className="inline-block bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-6">
            <p className="text-5xl font-bold text-white">{Number(avgScore).toFixed(1)}</p>
            <p className="text-lg text-blue-100">/ 5.0</p>
          </div>
        </div>
        
        {/* 矢印 */}
        <div className="text-4xl text-gray-400">→</div>
        
        {/* 修正後のスコア */}
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2 font-semibold">修正スコア（ヒアリング後）</p>
          <div className="inline-block bg-gradient-to-br from-red-500 to-red-600 rounded-full p-6">
            <p className="text-5xl font-bold text-white">{adjustedAvgScore}</p>
            <p className="text-lg text-red-100">/ 5.0</p>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            変化: {Number(adjustedAvgScore) > Number(avgScore) ? '+' : ''}{(Number(adjustedAvgScore) - Number(avgScore)).toFixed(1)}
          </p>
        </div>
      </div>
    ) : (
      // 修正スコアがない場合：元のスコアのみ表示
      <div className="text-center">
        <div className="inline-block bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-8 mb-4">
          <p className="text-6xl font-bold text-white">{Number(avgScore).toFixed(1)}</p>
          <p className="text-xl text-blue-100">/ 5.0</p>
        </div>
      </div>
    )}
  </div>
</div>

          {/* レーダーチャート */}
<div className="bg-white rounded-xl shadow-lg p-8 mb-8">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">スコア分布</h2>
  {Object.keys(adjustedScores).length > 0 && (
    <div className="mb-4 flex justify-center gap-6">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
        <span className="text-sm text-gray-600">回答者スコア（自己評価）</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-500 rounded"></div>
        <span className="text-sm text-gray-600">修正スコア（ヒアリング後）</span>
      </div>
    </div>
  )}
  <div className="flex justify-center">
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" />
        <PolarRadiusAxis domain={[0, 5]} />
        {/* 元のスコア（青） */}
        <Radar
          name="回答者スコア"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.6}
        />
        {/* 修正スコア（赤） */}
        {Object.keys(adjustedScores).length > 0 && (
          <Radar
            name="修正スコア"
            dataKey="adjustedValue"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.4}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  </div>
</div>

{/* レイヤー別スコア分析 */}
          {displayAnalysis?.layerAnalysis && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 レイヤー別スコア分析</h2>
              
              <p className="text-gray-700 mb-6">貴社のブランド構築状況を3つのレイヤーで分析しました：</p>

              <div className="space-y-6">
                {/* 戦略レイヤー */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-blue-900">【戦略レイヤー】</h3>
                    <span className="text-2xl font-bold text-blue-700">{displayAnalysis.layerAnalysis.strategy.avg}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">市場理解、競合分析、自社分析、価値提案、独自性（Q1〜Q5）</p>
                  <p className="text-gray-800">{displayAnalysis.layerAnalysis.strategy.comment}</p>
                </div>

                {/* 実行レイヤー */}
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-green-900">【実行レイヤー】</h3>
                    <span className="text-2xl font-bold text-green-700">{displayAnalysis.layerAnalysis.execution.avg}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">商品・サービス、コミュニケーション、インナーブランディング、KPI運用（Q6〜Q9）</p>
                  <p className="text-gray-800">{displayAnalysis.layerAnalysis.execution.comment}</p>
                </div>

                {/* 成果レイヤー */}
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-purple-900">【成果レイヤー】</h3>
                    <span className="text-2xl font-bold text-purple-700">{displayAnalysis.layerAnalysis.outcome.avg}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">成果実感、知的保護、今後の方向性（Q10〜Q12）</p>
                  <p className="text-gray-800">{displayAnalysis.layerAnalysis.outcome.comment}</p>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">💡 レイヤー間のバランス</h4>
                <p className="text-gray-700">{displayAnalysis.layerAnalysis.balance}</p>
              </div>
            </div>
          )}

          {/* 詳細スコア */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">項目別スコア</h2>
            <div className="space-y-4">
              {QUESTIONS.map((question, index) => {
                const score = (result as any)[question.id];
                 const qNum = `q${index + 1}`;  // ← この行を追加
  const adjustedScore = adjustedScores[qNum];  // ← この行を追加
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
                     {editMode && (
            <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <label className="text-sm font-semibold text-orange-700 block mb-2">
                修正スコア（ヒアリング後）
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={adjustedScore ?? ''}
                onChange={(e) => {
  const value = e.target.value ? parseInt(e.target.value) : null;
  if (value) {
    setAdjustedScores(prev => ({
      ...prev,
      [qNum]: value
    }));
  } else {
     const newScores = { ...adjustedScores };
    delete newScores[qNum];
    setAdjustedScores(newScores);
  }
}}
                placeholder={`元: ${score}`}
                className="w-20 px-3 py-2 border border-orange-300 rounded-lg text-red-600 font-bold text-lg"
              />
              {adjustedScore && adjustedScore !== score && (
                <span className="ml-3 text-sm text-orange-600">
                  変更: {score} → <span className="font-bold text-red-600">{adjustedScore}</span>
                </span>
              )}
            </div>
          )}
        </div>
      );
    })}
  </div>
</div>
          

 {/* フェーズ別読み方ガイド */}
          {displayAnalysis?.phaseGuide && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-indigo-700 mb-4">💡 {result.business_phase}における診断結果の読み方</h2>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{displayAnalysis.phaseGuide}</p>
            </div>
          )}

          {/* AI分析レポート */}
{displayAnalysis && (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-blue-600 mb-6 border-b-2 border-blue-200 pb-2">
      AI分析レポート
    </h2>

    {result.adjusted_ai_report ? (
      // 修正後レポートがある場合：2カラム表示
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左カラム：元のレポート */}
        <div className="space-y-6">
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-blue-800 text-center">
              📊 回答者スコアに基づく分析（自己評価）
            </h3>
          </div>

          {/* 総合評価 */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> 総合評価
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.ai_report?.overallComment}
            </p>
          </div>

          {/* 強みTOP3 */}
          {result.ai_report?.top3Strengths && result.ai_report.top3Strengths.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span> 強みTOP3
              </h3>
              <div className="space-y-4">
                {result.ai_report.top3Strengths.map((strength, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                      <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {strength.rank}位
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900 text-lg">{strength.item}</span>
                          <span className="text-green-600 font-bold text-xl">({strength.score}点)</span>
                        </div>
                        <p className="text-gray-700 text-sm">{strength.advice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ボトルネックTOP3 */}
          {result.ai_report?.top3Bottlenecks && result.ai_report.top3Bottlenecks.length > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔧</span> ボトルネックTOP3
              </h3>
              <div className="space-y-4">
                {result.ai_report.top3Bottlenecks.map((bottleneck, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                    <div className="flex items-start gap-3">
                      <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {bottleneck.rank}位
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900 text-lg">{bottleneck.item}</span>
                          <span className="text-orange-600 font-bold text-xl">({bottleneck.score}点)</span>
                        </div>
                        <p className="text-gray-700 text-sm">{bottleneck.advice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6か月ロードマップ */}
          {result.ai_report?.roadmap && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span> 6か月ロードマップ
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                  <h4 className="font-bold text-blue-900 mb-2">【1〜2か月目】</h4>
                  <ul className="space-y-1">
                    {result.ai_report.roadmap.months1to2.map((action: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
                  <h4 className="font-bold text-indigo-900 mb-2">【3〜4か月目】</h4>
                  <ul className="space-y-1">
                    {result.ai_report.roadmap.months3to4.map((action: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-indigo-500 mt-1">•</span>
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                  <h4 className="font-bold text-purple-900 mb-2">【5〜6か月目】</h4>
                  <ul className="space-y-1">
                    {result.ai_report.roadmap.months5to6.map((action: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-purple-500 mt-1">•</span>
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右カラム：修正後レポート */}
        <div className="space-y-6">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-red-800 text-center">
              📊 修正スコアに基づく分析（ヒアリング後）
            </h3>
          </div>

          {/* 総合評価 */}
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> 総合評価
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.adjusted_ai_report?.overallComment}
            </p>
          </div>

          {/* 強みTOP3 */}
          {result.adjusted_ai_report?.top3Strengths && result.adjusted_ai_report.top3Strengths.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span> 強みTOP3
              </h3>
              <div className="space-y-4">
                {result.adjusted_ai_report.top3Strengths.map((strength, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                      <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {strength.rank}位
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900 text-lg">{strength.item}</span>
                          <span className="text-green-600 font-bold text-xl">({strength.score}点)</span>
                        </div>
                        <p className="text-gray-700 text-sm">{strength.advice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ボトルネックTOP3 */}
          {result.adjusted_ai_report?.top3Bottlenecks && result.adjusted_ai_report.top3Bottlenecks.length > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔧</span> ボトルネックTOP3
              </h3>
              <div className="space-y-4">
                {result.adjusted_ai_report.top3Bottlenecks.map((bottleneck, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                    <div className="flex items-start gap-3">
                      <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {bottleneck.rank}位
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900 text-lg">{bottleneck.item}</span>
                          <span className="text-orange-600 font-bold text-xl">({bottleneck.score}点)</span>
                        </div>
                        <p className="text-gray-700 text-sm">{bottleneck.advice}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6か月ロードマップ */}
          {result.adjusted_ai_report?.roadmap && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span> 6か月ロードマップ
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                  <h4 className="font-bold text-red-900 mb-2">【1〜2か月目】</h4>
                  <ul className="space-y-1">
                    {result.adjusted_ai_report.roadmap.months1to2.map((action: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 mt-1">•</span>
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4 border-pink-500">
                  <h4 className="font-bold text-pink-900 mb-2">【3〜4か月目】</h4>
                  <ul className="space-y-1">
                    {result.adjusted_ai_report.roadmap.months3to4.map((action: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-pink-500 mt-1">•</span>
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4 border-rose-500">
                  <h4 className="font-bold text-rose-900 mb-2">【5〜6か月目】</h4>
                  <ul className="space-y-1">
                    {result.adjusted_ai_report.roadmap.months5to6.map((action: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-rose-500 mt-1">•</span>
                        <span className="text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ) : (
      // 修正後レポートがない場合：元のレポートのみ表示（従来の表示）
      <div className="space-y-6">
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

        {/* 強みTOP3 */}
        {displayAnalysis?.top3Strengths && displayAnalysis.top3Strengths.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span> 強みTOP3（対外的に打ち出すべき"推しポイント"）
            </h3>
            <div className="space-y-4">
              {displayAnalysis.top3Strengths.map((strength, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex items-start gap-3">
                    <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {strength.rank}位
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900 text-lg">{strength.item}</span>
                        <span className="text-green-600 font-bold text-xl">({strength.score}点)</span>
                      </div>
                      <p className="text-gray-700">{strength.advice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ボトルネックTOP3 */}
        {displayAnalysis?.top3Bottlenecks && displayAnalysis.top3Bottlenecks.length > 0 && (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-bold text-orange-700 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔧</span> ボトルネックTOP3（今後6か月で優先改善すべきテーマ）
            </h3>
            <div className="space-y-4">
              {displayAnalysis.top3Bottlenecks.map((bottleneck, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                  <div className="flex items-start gap-3">
                    <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {bottleneck.rank}位
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900 text-lg">{bottleneck.item}</span>
                        <span className="text-orange-600 font-bold text-xl">({bottleneck.score}点)</span>
                      </div>
                      <p className="text-gray-700">{bottleneck.advice}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 矛盾検知 */}
        {displayAnalysis.contradictions && displayAnalysis.contradictions.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <h3 className="text-xl font-bold text-yellow-700 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span> スコアのギャップ（強みとボトルネックのねじれ）
            </h3>
            <ul className="space-y-2">
              {displayAnalysis.contradictions.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  {editMode ? (
                    <textarea
                      value={editedReport?.contradictions?.[i] || ''}
                      onChange={(e) => {
                        const newContradictions = [...(editedReport?.contradictions || [])];
                        newContradictions[i] = e.target.value;
                        updateField('contradictions', newContradictions);
                      }}
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
                      onChange={(e) => {
                        const newRecommendations = [...(editedReport?.recommendations || [])];
                        newRecommendations[i] = e.target.value;
                        updateField('recommendations', newRecommendations);
                      }}
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

        {/* 6か月アクションロードマップ */}
        {displayAnalysis?.roadmap && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span> 6か月アクションロードマップ
            </h3>
            
            <div className="space-y-6">
              {/* 1-2ヶ月目 */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-900 mb-3">【1〜2か月目：基盤固め】</h4>
                <ul className="space-y-2">
                  {displayAnalysis.roadmap.months1to2.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3-4ヶ月目 */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
                <h4 className="font-bold text-indigo-900 mb-3">【3〜4か月目：実行準備】</h4>
                <ul className="space-y-2">
                  {displayAnalysis.roadmap.months3to4.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-500 mt-1">•</span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 5-6ヶ月目 */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                <h4 className="font-bold text-purple-900 mb-3">【5〜6か月目：成果検証】</h4>
                <ul className="space-y-2">
                  {displayAnalysis.roadmap.months5to6.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 bg-blue-100 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-2">💡 ロードマップのポイント</h4>
              <p className="text-gray-800">{displayAnalysis.roadmap.summary}</p>
            </div>
          </div>
        )}

        {/* 旧形式の成功への道筋（後方互換性のため残す） */}
        {!displayAnalysis?.roadmap && displayAnalysis?.successPath && displayAnalysis.successPath.length > 0 && (
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
  </div>
)}

{/* レポートの使い方と次のステップ */}
          {displayAnalysis && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 mt-8">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">📖 このレポートの活用方法</h2>
              
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">✅ 社内共有</h3>
                  <p className="text-gray-700">このレポートを経営陣・マネジメント層で共有し、「ブランド強化の優先順位」を合意形成するための材料としてご活用ください。</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">✅ 部門別アクション</h3>
                  <p className="text-gray-700">ボトルネックTOP3を各部門（営業・マーケ・人事）に割り振り、具体的な改善プロジェクトに落とし込んでください。</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">✅ 定期測定</h3>
                  <p className="text-gray-700">6か月後に再度Brand Checkを実施し、スコアの変化を追跡することで、ブランド強化の効果を可視化できます。</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-purple-700 mb-4">💡 次の一歩：HUVのサポートメニュー</h3>
                <p className="text-gray-700 mb-4">ブランド戦略をさらに深めたい方へ、以下のサポートをご用意しています：</p>
                
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded p-3">
                    <p className="font-semibold text-purple-900">【壁打ちセッション】</p>
                    <p className="text-sm text-gray-700">このレポートをもとに、貴社の課題を60分で整理するオンライン相談</p>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <p className="font-semibold text-purple-900">【BEナビ（ブランド戦略伴走支援）】</p>
                    <p className="text-sm text-gray-700">6か月間のブランド構築プロジェクトを、月次ミーティングで伴走</p>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <p className="font-semibold text-purple-900">【カスタムワークショップ】</p>
                    <p className="text-sm text-gray-700">社内でのターゲット定義・価値提案ワークショップの設計・ファシリテーション</p>
                  </div>
                </div>

                <p className="text-center mt-6 text-gray-700">
                  ご興味のある方は、
                  <a href="mailto:huvdesignoffice@gmail.com" className="text-purple-600 font-semibold hover:text-purple-800 underline ml-1">
                    huvdesignoffice@gmail.com
                  </a>
                  までお気軽にお問い合わせください。
                </p>
              </div>
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
