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

// レイヤー別平均スコアの算出
    const strategyAvg = (scores.slice(0, 5).reduce((a: number, b: number) => a + b, 0) / 5).toFixed(1);
    const executionAvg = (scores.slice(5, 9).reduce((a: number, b: number) => a + b, 0) / 4).toFixed(1);
    const outcomeAvg = (scores.slice(9, 12).reduce((a: number, b: number) => a + b, 0) / 3).toFixed(1);

    console.log("Layer Averages:", { strategyAvg, executionAvg, outcomeAvg });

    // 強みTOP3／ボトルネックTOP3の抽出
    const scoredItems = scores.map((score: number, idx: number) => ({
      label: QUESTIONS[idx].label,
      description: QUESTIONS[idx].description,
      score: score
    }));

    // スコア順にソート
    const sortedByScore = [...scoredItems].sort((a, b) => b.score - a.score);

    const top3 = sortedByScore.slice(0, 3);
    const bottom3 = sortedByScore.slice(-3).reverse(); // 昇順にするため反転

    console.log("Top 3 Strengths:", top3);
    console.log("Top 3 Bottlenecks:", bottom3);

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

【レイヤー別平均スコア】
戦略レイヤー（Q1-Q5）: ${strategyAvg}/5.0
実行レイヤー（Q6-Q9）: ${executionAvg}/5.0
成果レイヤー（Q10-Q12）: ${outcomeAvg}/5.0

【強みTOP3】
1位: ${top3[0].label}（${top3[0].score}点）
2位: ${top3[1].label}（${top3[1].score}点）
3位: ${top3[2].label}（${top3[2].score}点）

【ボトルネックTOP3】
1位: ${bottom3[0].label}（${bottom3[0].score}点）
2位: ${bottom3[1].label}（${bottom3[1].score}点）
3位: ${bottom3[2].label}（${bottom3[2].score}点）

【現状の課題・将来の展望】

【現状の課題・将来の展望】
${memo || '記載なし'}

---

以下の形式の**純粋なJSON**で、詳細な分析レポートを作成してください。

重要:
- マークダウン記法（\`\`\`json など）は使用しないでください
- JSON形式のみを出力してください
- 説明文は一切不要です

{
  "layerAnalysis": {
    "strategy": {
      "avg": ${strategyAvg},
      "comment": "戦略レイヤーの状態を50-80文字でコメント。相対的に強い/弱いを明記"
    },
    "execution": {
      "avg": ${executionAvg},
      "comment": "実行レイヤーの状態を50-80文字でコメント。相対的に強い/弱いを明記"
    },
    "outcome": {
      "avg": ${outcomeAvg},
      "comment": "成果レイヤーの状態を50-80文字でコメント。${businessPhase === '構想中' ? '構想中フェーズのため参考値である旨を必ず明記' : '相対的に強い/弱いを明記'}"
    },
    "balance": "3つのレイヤースコアを比較し、バランスの良し悪しを80-120文字でコメント"
  },
  "phaseGuide": "${businessPhase}フェーズにおける診断結果の読み方を150-200文字で説明。${businessPhase === '構想中' ? 'このフェーズでは戦略レイヤー（Q1-Q5）の精度向上が最優先。成果レイヤー（Q10-Q12）は参考値として扱い、市場理解・競合分析・価値提案の明確化に集中すべきと説明' : businessPhase === '立ち上げ（1〜3年）' ? '戦略の実行に移るフェーズ。実行レイヤー（Q6-Q9）が戦略レイヤーに追いついているかが重要。コミュニケーションの一貫性とインナーブランディングに注力すべきと説明' : '成果レイヤー（Q10-Q12）が戦略・実行に見合っているかを確認。KPI運用と知的保護を強化し、ブランド資産としての価値を最大化するフェーズと説明'}",
  "overallComment": "総合評価を200-300文字で記述。レイヤー別スコア、事業フェーズとの整合性、現状の課題への言及を含める",
  "scoreGaps": [
    "スコアギャップ1: [項目A]は高いが[項目B]は低い → これは「〇〇の状態」 → 優先アクションは「〇〇」",
    "スコアギャップ2: 同様の構造で記述（ギャップがない場合は空配列）"
  ],
  "top3Strengths": [
    {
      "rank": 1,
      "item": "${top3[0].label}",
      "score": ${top3[0].score},
      "advice": "この強みをどう対外的に打ち出すべきか、30-50文字"
    },
    {
      "rank": 2,
      "item": "${top3[1].label}",
      "score": ${top3[1].score},
      "advice": "この強みをどう対外的に打ち出すべきか、30-50文字"
    },
    {
      "rank": 3,
      "item": "${top3[2].label}",
      "score": ${top3[2].score},
      "advice": "この強みをどう対外的に打ち出すべきか、30-50文字"
    }
  ],
  "top3Bottlenecks": [
    {
      "rank": 1,
      "item": "${bottom3[0].label}",
      "score": ${bottom3[0].score},
      "advice": "なぜこれが最優先か、どう改善すべきか、30-50文字"
    },
    {
      "rank": 2,
      "item": "${bottom3[1].label}",
      "score": ${bottom3[1].score},
      "advice": "なぜこれが優先か、どう改善すべきか、30-50文字"
    },
    {
      "rank": 3,
      "item": "${bottom3[2].label}",
      "score": ${bottom3[2].score},
      "advice": "なぜこれが優先か、どう改善すべきか、30-50文字"
    }
  ],
  "roadmap": {
    "months1to2": [
      "具体的アクション1（例：ターゲット顧客の再定義ワークショップ実施）",
      "具体的アクション2（例：競合3社の強み・弱みマップ作成）"
    ],
    "months3to4": [
      "具体的アクション3（例：Web・営業資料のメッセージ統一化）",
      "具体的アクション4（例：ブランドガイドライン初版の作成）"
    ],
    "months5to6": [
      "具体的アクション5（例：KPIダッシュボードの構築と初回測定）",
      "具体的アクション6（例：社内ブランド勉強会の定例化）"
    ],
    "summary": "このロードマップで何が変わるか、期待効果を80-120文字で記述"
  },
  "contradictions": [],
  "priorityActions": [],
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "successPath": []
}

【分析のポイント】

1. **layerAnalysis（レイヤー別分析）**
   - 各レイヤーの平均スコアはすでに計算済み
   - commentでは相対的な強弱を明記すること
   - 構想中フェーズの場合、成果レイヤーは「参考値」と必ず明記
   - balanceでは3レイヤーのバランスを総括

2. **phaseGuide（フェーズ別読み方）**
   - 事業フェーズに応じた診断結果の読み方を具体的に説明
   - どのレイヤーを重視すべきかを明記

3. **overallComment（総合評価）**
   - レイヤー別スコアの特徴を必ず言及
   - 事業フェーズとの整合性を評価
   - memoの内容（現状の課題）にも触れる

4. **scoreGaps（スコアのギャップ）**
   - 必ず「[A]は高いが[B]は低い」→「〇〇の状態」→「〇〇を優先」の3ステップ構造
   - 「矛盾」ではなく「ギャップ」「ねじれ」という表現を使用
   - ギャップがない場合は空配列

5. **top3Strengths / top3Bottlenecks**
   - すでに順位・項目・スコアは確定済み
   - adviceフィールドに具体的な活用法・改善策を記述

6. **roadmap（6か月ロードマップ）**
   - 各期間に2つずつ、計6つの具体的アクションを提示
   - 抽象的なスローガンではなく、実務がイメージできる表現
   - 「〇〇の再定義」「〇〇マップの作成」「〇〇の統一化」など
   - summaryには期待効果を簡潔に

7. **旧形式フィールド（後方互換性のため空で維持）**
   - contradictions, priorityActions, strengths, weaknesses, recommendations, successPath
   - これらは空配列として出力（既存UIが壊れないため）

【トーン】
- 経営者向けで、丁寧・具体・前向き
- 批判的ではなく、建設的な提案
- 専門用語を使いすぎず、実務に落とせる表現

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
      'phaseGuide'
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
