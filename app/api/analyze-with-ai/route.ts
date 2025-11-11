import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const QUESTIONS = [
  { id: 1, label: '市場理解', description: '自社の「理想的な顧客像（ターゲット）」が明確で、社内でも共有されている。' },
  { id: 2, label: '競合分析', description: '主な競合と自社の違いを、言語化して説明できる。' },
  { id: 3, label: '自社分析', description: '自社の強み・弱みを、第三者に説明できるレベルで把握している。' },
  { id: 4, label: '価値提案', description: '自社が「誰に」「どんな価値を」「なぜ提供できるのか」が明文化されている。' },
  { id: 5, label: '独自性', description: '競合が真似できない「独自の意味」や「世界観」がある。' },
  { id: 6, label: '商品・サービス', description: '提供する商品・サービスが、ブランドの理念と整合している。' },
  { id: 7, label: 'コミュニケーション', description: 'ブランドのメッセージが、Web・営業・採用など全てで一貫している。' },
  { id: 8, label: 'インナーブランディング', description: '社員が自社のブランド価値を理解し、日常業務で体現している。' },
  { id: 9, label: 'KPI運用', description: 'ブランドに関する目標（KPI）や指標を定期的にモニタリングしている。' },
  { id: 10, label: '成果実感', description: 'ブランド施策によって、売上・採用・顧客満足度などに変化が出ている。' },
  { id: 11, label: '知的保護', description: 'ブランド名・ロゴ・デザインなど、法的保護（商標・特許）を意識している。' },
  { id: 12, label: '今後の方向性', description: '自社のブランドを資産として成長させたいという意思がある。' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scores, memo, businessPhase, companyName } = body;

    console.log("=== AI Analysis Request ===");
    console.log("Company:", companyName);
    console.log("Phase:", businessPhase);
    console.log("Scores:", scores);

    // 環境変数チェック
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("❌ ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { error: "API設定エラー: ANTHROPIC_API_KEYが設定されていません" },
        { status: 500 }
      );
    }

    // スコアデータの整形
    const scoreDetails = scores.map((score: number, index: number) => {
      return `${QUESTIONS[index].label}（${QUESTIONS[index].description}）: ${score}/5`;
    }).join('\n');

    const avgScore = (scores.reduce((a: number, b: number) => a + b, 0) / 12).toFixed(1);

    // Claude APIクライアント初期化
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // プロンプト作成
    const prompt = `あなたはブランドコンサルタントです。以下のブランドチェック診断結果を分析し、プロフェッショナルなレポートを作成してください。

【企業情報】
企業名: ${companyName}
事業フェーズ: ${businessPhase}

【診断スコア】（各項目5点満点）
${scoreDetails}

平均スコア: ${avgScore}/5.0

【現状の課題・将来の展望】
${memo || '記載なし'}

---

以下の形式の**純粋なJSON**で、詳細な分析レポートを作成してください。

重要: 
- マークダウン記法（\`\`\`json など）は使用しないでください
- JSON形式のみを出力してください
- 説明文は一切不要です

{
  "overallComment": "総合評価のコメント（200-300文字程度で、現状の総合的な評価と特徴を記述）",
  "contradictions": ["矛盾点1", "矛盾点2"],
  "priorityActions": ["最優先アクション1", "最優先アクション2", "最優先アクション3"],
  "strengths": ["強み1", "強み2", "強み3"],
  "weaknesses": ["改善が必要な領域1", "改善が必要な領域2", "改善が必要な領域3"],
  "recommendations": ["具体的な改善提案1", "具体的な改善提案2", "具体的な改善提案3", "具体的な改善提案4"],
  "successPath": ["成功への道筋ステップ1", "成功への道筋ステップ2", "成功への道筋ステップ3"],
  "phaseAdvice": "${businessPhase}フェーズに特化したアドバイス（100-150文字程度）"
}

【分析のポイント】
1. contradictions: スコア間の矛盾を検出（例：市場理解は高いが競合分析が低い、など）。矛盾がない場合は空配列。
2. priorityActions: 緊急度が高い順に3つの優先アクション
3. strengths: スコアが4以上の項目を中心に強みを明確化
4. weaknesses: スコアが3以下の項目を中心に改善領域を指摘
5. recommendations: 具体的で実行可能な改善策を4つ提案
6. successPath: 3-6ヶ月で取り組むべき具体的なステップを時系列で提示
7. phaseAdvice: 事業フェーズ（構想中・売り出し中・成長中・見直し中）に応じた具体的なアドバイス

純粋なJSONのみを出力してください。`;

    console.log("📞 Calling Claude API...");

    // Claude API呼び出し
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log("✅ Claude API response received");
    console.log("Response type:", message.content[0].type);

    // レスポンスからテキストを抽出
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    if (!responseText) {
      console.error("❌ Empty response from Claude API");
      throw new Error("Claude APIからの応答が空です");
    }

    console.log("📝 Raw response (first 200 chars):", responseText.substring(0, 200));

    // JSONをパース（複数のクリーニングパターンを試行）
    let cleanedResponse = responseText.trim();
    
    // パターン1: ```json ``` で囲まれている場合
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      console.log("🧹 Removed ```json markers");
    }
    // パターン2: ``` のみで囲まれている場合
    else if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
      console.log("🧹 Removed ``` markers");
    }

    // 前後の改行や空白を削除
    cleanedResponse = cleanedResponse.trim();

    // JSONの開始位置を探す
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      console.log("🧹 Extracted JSON from position", jsonStart, "to", jsonEnd);
    }

    console.log("📄 Cleaned response (first 200 chars):", cleanedResponse.substring(0, 200));

    let aiReport;
    try {
      aiReport = JSON.parse(cleanedResponse);
      console.log("✅ JSON parsed successfully");
      console.log("Keys:", Object.keys(aiReport));
    } catch (parseError: any) {
      console.error("❌ JSON Parse Error:", parseError.message);
      console.error("Failed to parse:", cleanedResponse.substring(0, 500));
      throw new Error(`AIのレスポンス形式が不正です: ${parseError.message}`);
    }

    // 必須フィールドの検証
    const requiredFields = [
      'overallComment', 
      'contradictions', 
      'priorityActions', 
      'strengths', 
      'weaknesses', 
      'recommendations', 
      'successPath', 
      'phaseAdvice'
    ];

    const missingFields = requiredFields.filter(field => !(field in aiReport));
    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      throw new Error(`必須フィールドが不足しています: ${missingFields.join(', ')}`);
    }

    console.log("✅ AI Report generated successfully");

    return NextResponse.json(aiReport);

  } catch (error: any) {
    console.error("❌ Error in analyze-with-ai:", error);
    
    // 詳細なエラーログ
    if (error.response) {
      console.error("API Response Error:", error.response.status, error.response.data);
    }
    
    return NextResponse.json(
      { 
        error: "AI分析の生成に失敗しました",
        details: error.message || "不明なエラー"
      },
      { status: 500 }
    );
  }
}
