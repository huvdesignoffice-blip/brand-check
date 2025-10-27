'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

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
      }
      setLoading(false);
    };

    if (params.id) {
      fetchResult();
    }
  }, [params.id]);

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

  const avgScore = (scores.reduce((a, b) => a + b, 0) / 12).toFixed(1);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">ブランドチェック診断結果</h1>
          <p className="text-blue-100">Brand Check Assessment Report</p>
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">企業名</p>
              <p className="text-lg font-semibold text-gray-900">{result.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">回答者</p>
              <p className="text-lg font-semibold text-gray-900">{result.respondent_name}</p>
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
            {result.memo && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">現状の課題・将来の展望</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {result.memo}
                </p>
              </div>
            )}
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

        {/* フッター */}
        <div className="text-center text-gray-600 text-sm">
          <p>© 2025 HUV DESIGN OFFICE</p>
          <a href="/admin" className="text-blue-600 hover:underline mt-2 inline-block">
            管理画面に戻る
          </a>
        </div>
      </div>
    </div>
  );
}