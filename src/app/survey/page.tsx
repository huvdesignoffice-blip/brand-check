"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
const INDUSTRIES = [
  // IT・テクノロジー
  "ソフトウェア開発",
  "SaaS・クラウドサービス",
  "Web制作・デザイン",
  "システムインテグレーション",
  "ITコンサルティング",
  "セキュリティ",
  
  // 製造業
  "食品製造",
  "繊維・アパレル製造",
  "化学・医薬品製造",
  "金属・機械製造",
  "電子部品・デバイス製造",
  "自動車・輸送機器製造",
  
  // 小売・EC
  "百貨店・総合小売",
  "専門小売（食品）",
  "専門小売（アパレル）",
  "専門小売（家電・雑貨）",
  "EC・オンライン販売",
  "卸売",
  
  // 飲食・宿泊
  "飲食店（レストラン）",
  "カフェ・喫茶店",
  "居酒屋・バー",
  "ホテル・旅館",
  "民泊",
  "観光・レジャー施設",
  
  // 建設・不動産
  "建設・土木",
  "建築設計",
  "不動産売買・仲介",
  "不動産管理",
  "リフォーム・リノベーション",
  
  // 医療・福祉
  "病院・クリニック",
  "歯科医院",
  "介護・福祉施設",
  "薬局・ドラッグストア",
  "整体・鍼灸",
  
  // 教育
  "学習塾・予備校",
  "語学教室",
  "専門学校・各種スクール",
  "企業研修",
  "オンライン教育",
  
  // 金融・保険
  "銀行・信用金庫",
  "証券",
  "保険",
  "ファイナンス",
  
  // 専門サービス
  "経営コンサルティング",
  "マーケティング・PR",
  "広告代理店",
  "デザイン事務所",
  "法律事務所",
  "会計・税理士事務所",
  "人材紹介・派遣",
  
  // メディア・エンタメ
  "出版・印刷",
  "放送・映像制作",
  "イベント企画・運営",
  "芸能・音楽",
  "ゲーム制作",
  
  // 物流・インフラ
  "運輸・配送",
  "倉庫・物流",
  "エネルギー",
  "通信",
  
  // その他
  "農業",
  "漁業",
  "美容・理容",
  "クリーニング",
  "その他サービス",
  "その他",
];
const QUESTIONS = [
  { id: "q1", label: "市場理解", question: "自社の「理想的な顧客像（ターゲット）」が明確で、社内でも共有されている。", trend: "顧客理解・ターゲティング力" },
  { id: "q2", label: "競合分析", question: "主な競合と自社の違いを、言語化して説明できる。", trend: "差別化軸・競争理解" },
  { id: "q3", label: "自社分析", question: "自社の強み・弱みを、第三者に説明できるレベルで把握している。", trend: "内省力・自己理解度" },
  { id: "q4", label: "価値提案", question: "自社が「誰に」「どんな価値を」「なぜ提供できるのか」が明文化されている。", trend: "バリュープロポジションの成熟度" },
  { id: "q5", label: "独自性", question: "競合が真似できない「独自の意味」や「世界観」がある。", trend: "ブランドパーソナリティ／独自価値" },
  { id: "q6", label: "商品・サービス", question: "提供する商品・サービスが、ブランドの理念と整合している。", trend: "一貫性・体験設計" },
  { id: "q7", label: "コミュニケーション", question: "ブランドのメッセージが、Web・営業・採用など全てで一貫している。", trend: "統合的コミュニケーション(IMC)" },
  { id: "q8", label: "インナーブランディング", question: "社員が自社のブランド価値を理解し、日常業務で体現している。", trend: "組織文化・理念浸透" },
  { id: "q9", label: "KPI運用", question: "ブランドに関する目標（KPI）や指標を定期的にモニタリングしている。", trend: "運用・測定力" },
  { id: "q10", label: "成果実感", question: "ブランド施策によって、売上・採用・顧客満足度などに変化が出ている。", trend: "成果感・ROI意識" },
  { id: "q11", label: "知的保護", question: "ブランド名・ロゴ・デザインなど、法的保護（商標・特許）を意識している。", trend: "知的資産管理" },
  { id: "q12", label: "今後の方向性", question: "自社のブランドを資産として成長させたいという意思がある。", trend: "成長意欲・ブランディング志向" },
];

const BUSINESS_PHASES = ["準備中", "上市直後", "定着中", "改善中"];

const RATING_LABELS = ["1: 全くそう思わない", "2: そう思わない", "3: どちらでもない", "4: そう思う", "5: 強くそう思う"];

export default function SurveyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
  companyName: "",
  respondentName: "",
  respondentEmail: "",
  memo: "",
  businessPhase: "",
  industry: "", // ← 追加
  scores: {} as Record<string, number>,
});

  const handleMetaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(1);
  };

  const handleScoreChange = (questionId: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      scores: { ...prev.scores, [questionId]: value },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 平均スコアを計算
      const totalScore = Object.values(formData.scores).reduce((sum, score) => sum + score, 0);
      const avgScore = totalScore / 12;

      // Supabaseにデータを保存（IDを取得するために.select()を追加）
      const { data: insertData, error: insertError } = await supabase
  .from('survey_results')
  .insert({
    company_name: formData.companyName,
    respondent_name: formData.respondentName,
    respondent_email: formData.respondentEmail,
    memo: formData.memo,
    business_phase: formData.businessPhase,
    industry: formData.industry, // ← 追加
    q1_market_understanding: formData.scores.q1 || 1,
    q2_competitive_analysis: formData.scores.q2 || 1,
    q3_self_analysis: formData.scores.q3 || 1,
    q4_value_proposition: formData.scores.q4 || 1,
    q5_uniqueness: formData.scores.q5 || 1,
    q6_product_service: formData.scores.q6 || 1,
    q7_communication: formData.scores.q7 || 1,
    q8_inner_branding: formData.scores.q8 || 1,
    q9_kpi_management: formData.scores.q9 || 1,
    q10_results: formData.scores.q10 || 1,
    q11_ip_protection: formData.scores.q11 || 1,
    q12_growth_intent: formData.scores.q12 || 1,
  })
  .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        alert('送信に失敗しました');
        return;
      }

      // 挿入されたデータのIDを取得
      const resultId = insertData?.[0]?.id;

      // メール通知を送信
      try {
        console.log('Sending email notification...');
        const notificationResponse = await fetch('/api/send-notification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
  company_name: formData.companyName,
  respondent_name: formData.respondentName,
  respondent_email: formData.respondentEmail,
  avg_score: avgScore.toFixed(1),
  business_phase: formData.businessPhase,
  industry: formData.industry, // ← 追加
  result_id: resultId,
  scores: {
    '市場理解': formData.scores.q1 || 1,
    '競合分析': formData.scores.q2 || 1,
    '自社分析': formData.scores.q3 || 1,
    '価値提案': formData.scores.q4 || 1,
    '独自性': formData.scores.q5 || 1,
    '商品・サービス': formData.scores.q6 || 1,
    'コミュニケーション': formData.scores.q7 || 1,
    'インナーブランディング': formData.scores.q8 || 1,
    'KPI運用': formData.scores.q9 || 1,
    '成果実感': formData.scores.q10 || 1,
    '知的保護': formData.scores.q11 || 1,
    '今後の方向性': formData.scores.q12 || 1,
  },
}),
});

        if (!notificationResponse.ok) {
          console.error('Email notification failed:', await notificationResponse.text());
        } else {
          const result = await notificationResponse.json();
          console.log('Email notification sent successfully:', result);
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // メール送信失敗してもアンケートは成功とする
      }

      // 成功メッセージとリダイレクト
      alert("回答を送信しました！");
      router.push("/survey/complete");

    } catch (error: any) {
      console.error("Error details:", error);
      console.error("Error message:", error?.message);
      alert(`送信に失敗しました: ${error?.message || "不明なエラー"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allScoresFilled = QUESTIONS.every((q) => formData.scores[q.id] !== undefined);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {currentStep === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ブランドチェック</h1>
            <p className="text-gray-600 mb-8">HUV DESIGN OFFICE</p>

            <form onSubmit={handleMetaSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">企業名 *</label>
                <input type="text" required value={formData.companyName} onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例：株式会社HUV DESIGN OFFICE" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">回答者名 *</label>
                <input type="text" required value={formData.respondentName} onChange={(e) => setFormData((prev) => ({ ...prev, respondentName: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例：入倉大亮" />
              </div>

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
  <input 
    type="email" 
    value={formData.respondentEmail} 
    onChange={(e) => setFormData((prev) => ({ ...prev, respondentEmail: e.target.value }))} 
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
    placeholder="例：example@company.com" 
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">業種 *</label>
  <select
    value={formData.industry}
    onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    required
  >
    <option value="">選択してください</option>
    {INDUSTRIES.map((industry) => (
      <option key={industry} value={industry}>{industry}</option>
    ))}
  </select>
</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">事業フェーズ *</label>
                <select
  value={formData.businessPhase}
  onChange={(e) => setFormData({ ...formData, businessPhase: e.target.value })}
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  required
>
  <option value="">選択してください</option>
  <option value="構想中">構想中</option>
  <option value="売り出し中">売り出し中</option>
  <option value="成長中">成長中</option>
  <option value="見直し中">見直し中</option>
</select>
              </div>

              <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    現状の課題・将来の展望
  </label>
  <textarea
    value={formData.memo}
    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    rows={4}
    placeholder="現在直面している課題や、今後の事業展望についてご記入ください"
  />
</div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">次へ進む</button>
            </form>
          </div>
        )}

        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ブランド評価（12問）</h1>
            <p className="text-gray-600 mb-8">各設問について、1〜5点で評価してください</p>

            <div className="space-y-8">
              {QUESTIONS.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">{index + 1}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{question.label}</h3>
                      <p className="text-sm text-gray-700 mb-2">{question.question}</p>
                      <p className="text-xs text-gray-500 italic">把握できる傾向: {question.trend}</p>
                    </div>
                  </div>

                  <div className="ml-11 space-y-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <label key={score} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input type="radio" name={question.id} value={score} checked={formData.scores[question.id] === score} onChange={() => handleScoreChange(question.id, score)} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">{RATING_LABELS[score - 1]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <button onClick={() => setCurrentStep(0)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium">戻る</button>
              <button onClick={handleSubmit} disabled={!allScoresFilled || isSubmitting} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed">{isSubmitting ? "送信中..." : "送信する"}</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}