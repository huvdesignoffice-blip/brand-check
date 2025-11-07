import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const categoryNames = [
  "市場理解",
  "競合分析",
  "自社分析",
  "価値提案",
  "独自性",
  "製品・サービス",
  "コミュニケーション",
  "インナーブランディング",
  "KPI管理",
  "成果",
  "知財保護",
  "成長意欲",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scores, memo, businessPhase, companyName } = body;

    if (!scores || scores.length !== 12) {
      return NextResponse.json(
        { error: "12項目のスコアが必要です" },
        { status: 400 }
      );
    }

    // スコアと項目名を整形
    const scoresWithLabels = scores
      .map((score: number, i: number) => `${categoryNames[i]}: ${score}点`)
      .join("\n");

    const avgScore = (
      scores.reduce((a: number, b: number) => a + b, 0) / scores.length
    ).toFixed(1);

    // Claude APIに送るプロンプト
    const prompt = `あなたはブランディングの専門家です。以下の企業のブランドチェック診断結果を分析してください。

【企業情報】
会社名: ${companyName || "未入力"}
ビジネスフェーズ: ${businessPhase || "未入力"}

【診断スコア（5点満点）】
${scoresWithLabels}
平均スコア: ${avgScore}点

【経営者のメモ（課題・展望）】
${memo || "記載なし"}

---

以下の項目について、厳密かつ具体的に分析してください：

1. **総合評価**: 平均スコアと全体的な状況を3-4文で簡潔に評価
2. **矛盾検知**: スコア間の矛盾を3-5個指摘（例：「市場理解が低いのに価値提案が高い」など）
3. **優先アクション**: 緊急度の高い順に3つ
4. **強み**: スコアが4点以上の項目について2-3個
5. **改善が必要な領域**: スコアが2点以下の項目について2-3個
6. **具体的な改善提案**: 実行可能な具体的アクションを5個
7. **成功への道筋**: 3ヶ月後、6ヶ月後、1年後の目標を各1つ
8. **事業フェーズ別アドバイス**: ${businessPhase}フェーズに特化したアドバイスを2-3文

重要な注意事項：
- メモの内容を必ず考慮し、経営者が書いた課題や目標に言及すること
- スコアとメモの整合性をチェックし、矛盾があれば厳しく指摘すること
- 抽象的ではなく、具体的で実行可能な提案をすること
- 日本語で、プロフェッショナルかつ厳しめのトーンで書くこと

必ず以下のJSON形式で出力してください：
\`\`\`json
{
  "overallComment": "総合評価の文章",
  "contradictions": ["矛盾1", "矛盾2", "矛盾3"],
  "priorityActions": ["アクション1", "アクション2", "アクション3"],
  "strengths": ["強み1", "強み2"],
  "weaknesses": ["弱み1", "弱み2"],
  "recommendations": ["提案1", "提案2", "提案3", "提案4", "提案5"],
  "successPath": ["3ヶ月後の目標", "6ヶ月後の目標", "1年後の目標"],
  "phaseAdvice": "事業フェーズ別アドバイスの文章"
}
\`\`\``;

    // Claude APIを呼び出し
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",  // ← ここを変更
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // レスポンスからテキストを抽出
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // JSONを抽出（```json と ``` の間）
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      throw new Error("AIのレスポンス形式が不正です");
    }

    const analysis = JSON.parse(jsonMatch[1]);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI分析エラー:", error);
    return NextResponse.json(
      {
        error: "AI分析に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
