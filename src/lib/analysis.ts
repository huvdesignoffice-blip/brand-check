export interface AnalysisResult {
  overallRating: string;
  overallComment: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  phaseAdvice: string;
  contradictions: string[];
  memoAnalysis: string[];
  priorityActions: string[];
  riskAlerts: string[];
  successPath: string[];
  failurePatterns: string[];
}

// 質問の定義（依存関係の明確化）
const QUESTIONS = [
  { id: 1, name: "市場理解", category: "戦略", prerequisite: null },
  { id: 2, name: "競合分析", category: "戦略", prerequisite: 1 },
  { id: 3, name: "自社分析", category: "戦略", prerequisite: 1 },
  { id: 4, name: "価値提案", category: "価値", prerequisite: 3 },
  { id: 5, name: "独自性", category: "価値", prerequisite: 2 },
  { id: 6, name: "商品サービス", category: "価値", prerequisite: 4 },
  { id: 7, name: "コミュニケーション", category: "実行", prerequisite: 4 },
  { id: 8, name: "インナーブランディング", category: "実行", prerequisite: 7 },
  { id: 9, name: "KPI管理", category: "実行", prerequisite: null },
  { id: 10, name: "成果", category: "成果", prerequisite: 9 },
  { id: 11, name: "知財保護", category: "成果", prerequisite: null },
  { id: 12, name: "成長意欲", category: "成果", prerequisite: 10 },
];

export function analyzeScores(
  scores: number[],
  businessPhase: string,
  memo?: string
): AnalysisResult {
  const [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12] = scores;
  const avgScore = scores.reduce((a, b) => a + b, 0) / 12;

  // カテゴリ別平均
  const strategyAvg = (q1 + q2 + q3) / 3;
  const valueAvg = (q4 + q5 + q6) / 3;
  const executionAvg = (q7 + q8 + q9) / 3;
  const resultsAvg = (q10 + q11 + q12) / 3;

  // 総合評価（事業フェーズを考慮）
  let overallRating = "";
  let overallComment = "";

  if (avgScore >= 4.0) {
    overallRating = "優秀";
    if (businessPhase === "構想中") {
      overallComment = "構想段階として非常に優れた準備ができています。この戦略的基盤を活かして、着実に事業を進めましょう。";
    } else if (businessPhase === "売り出し中") {
      overallComment = "売り出し段階として非常に優れたブランド戦略を持っています。この強みを活かして市場浸透を加速させましょう。";
    } else if (businessPhase === "成長中") {
      overallComment = "成長段階として理想的なブランド基盤があります。この強みを維持しながら、さらなる拡大を目指しましょう。";
    } else if (businessPhase === "見直し中") {
      overallComment = "見直し段階でこのレベルは素晴らしいです。戦略的基盤がしっかりしているので、新たな方向性への転換もスムーズに進められるでしょう。";
    } else {
      overallComment = "非常に優れたブランド戦略を持っています。この強みを維持しながら、さらなる成長を目指しましょう。";
    }
  } else if (avgScore >= 3.0) {
    overallRating = "良好";
    if (businessPhase === "構想中") {
      overallComment = "構想段階としては良いスタートを切っています。いくつかの領域を強化することで、より確実な立ち上げができます。";
    } else if (businessPhase === "売り出し中") {
      overallComment = "売り出し段階として良好なブランド基盤があります。弱点を強化することで、市場での存在感をさらに高められます。";
    } else if (businessPhase === "成長中") {
      overallComment = "成長段階として一定の基盤はありますが、改善の余地があります。スケールする前に弱点を補強しましょう。";
    } else if (businessPhase === "見直し中") {
      overallComment = "見直しの良いタイミングです。基盤はありますが、いくつかの領域を見直すことで、新たな成長軌道に乗れます。";
    } else {
      overallComment = "良好なブランド基盤がありますが、改善の余地があります。弱点を強化することで、さらに強いブランドになります。";
    }
  } else if (avgScore >= 2.0) {
    overallRating = "要改善";
    if (businessPhase === "構想中") {
      overallComment = "構想段階で気づけたのは幸運です。立ち上げる前に、戦略的基盤をしっかり固めることが成功の鍵です。";
    } else if (businessPhase === "売り出し中") {
      overallComment = "売り出し段階で課題が見えています。早めに改善することで、初期の失敗を防げます。戦略の見直しを優先しましょう。";
    } else if (businessPhase === "成長中") {
      overallComment = "成長段階ですが、基盤が脆弱です。拡大より先に、まずブランド戦略の立て直しが必要です。";
    } else if (businessPhase === "見直し中") {
      overallComment = "見直しが必要と認識されている通りです。抜本的な戦略の再構築に取り組みましょう。";
    } else {
      overallComment = "ブランド戦略の見直しが必要です。特に低スコアの項目に注力し、改善計画を立てることをお勧めします。";
    }
  } else {
    overallRating = "早急な対応が必要";
    if (businessPhase === "構想中") {
      overallComment = "立ち上げ前に根本的な見直しが必要です。市場・競合・自社分析から始め、戦略を一から構築することを強くお勧めします。";
    } else if (businessPhase === "売り出し中") {
      overallComment = "このまま進めるのは危険です。一旦立ち止まり、ブランド戦略の抜本的な見直しが必要です。専門家のサポートを受けることをお勧めします。";
    } else if (businessPhase === "成長中") {
      overallComment = "成長段階ですが、ブランド基盤が非常に脆弱です。拡大を一時停止し、戦略の立て直しを最優先すべきです。";
    } else if (businessPhase === "見直し中") {
      overallComment = "早急な抜本的見直しが必要です。現状のままでは事業継続が困難です。専門家と共に戦略を再構築しましょう。";
    } else {
      overallComment = "ブランド戦略の抜本的な見直しが必要です。専門家のサポートを受けることを強くお勧めします。";
    }
  }

  // 強みの抽出
  const strengths: string[] = [];
  if (strategyAvg >= 3.5) strengths.push("市場・競合・自社分析の基盤がしっかりしている");
  if (valueAvg >= 3.5) strengths.push("明確な価値提供と独自性がある");
  if (executionAvg >= 3.5) strengths.push("効果的なコミュニケーションと組織体制");
  if (resultsAvg >= 3.5) strengths.push("成果を出し、継続的な成長意欲がある");
  
  if (q1 >= 4) strengths.push("市場理解度が高く、顧客ニーズを把握している");
  if (q4 >= 4) strengths.push("価値提案が明確で説得力がある");
  if (q5 >= 4) strengths.push("競合との差別化が明確");
  if (q7 >= 4) strengths.push("ブランドコミュニケーションが優れている");
  if (q10 >= 4) strengths.push("ブランド活動の成果が出ている");

  if (strengths.length === 0) {
    strengths.push("改善に取り組む姿勢がある");
  }

  // 弱みの抽出
  const weaknesses: string[] = [];
  if (strategyAvg < 2.5) weaknesses.push("市場・競合・自社分析が不十分");
  if (valueAvg < 2.5) weaknesses.push("価値提供と独自性の明確化が必要");
  if (executionAvg < 2.5) weaknesses.push("コミュニケーションと組織体制の強化が必要");
  if (resultsAvg < 2.5) weaknesses.push("成果測定と継続的改善の仕組みが不足");

  if (q2 < 3) weaknesses.push("競合分析の強化が必要");
  if (q3 < 3) weaknesses.push("自社分析・強みの明確化が必要");
  if (q6 < 3) weaknesses.push("商品・サービスでのブランド体験向上が必要");
  if (q8 < 3) weaknesses.push("インナーブランディングの強化が必要");
  if (q9 < 3) weaknesses.push("KPI設定と測定の仕組み作りが必要");

 // 🔥 1. 矛盾検知（論理的な依存関係 + 相対評価の観点）
  const contradictions: string[] = [];
  
  // === 相対評価の矛盾（最重要） ===
  
  // 市場・競合が低いのに自社分析が高い（主観的評価の可能性）
  if ((q1 < 3 || q2 < 3) && q3 >= 4) {
    contradictions.push("⚠️ 市場理解(" + q1 + "点)・競合分析(" + q2 + "点)が十分でないのに自社分析(" + q3 + "点)が高い：自社の強みは市場・競合との相対評価で判断すべきです。市場や競合を知らずに自社を高く評価するのは主観的です。客観的な分析が必要です。");
  }
  
  // 市場・競合の両方が低いのに自社が普通以上
  if (q1 < 3 && q2 < 3 && q3 >= 3) {
    contradictions.push("⚠️ 市場(" + q1 + "点)・競合(" + q2 + "点)の理解が不足しているのに自社分析(" + q3 + "点)は一定の評価：自社の強み・弱みは相対的なものです。比較対象（市場・競合）を知らないと正確な自社評価はできません。");
  }
  
  // 競合分析が低いのに独自性が高い（差別化の根拠不明）
  if (q2 < 3 && q5 >= 4) {
    contradictions.push("⚠️ 競合分析(" + q2 + "点)が不十分なのに独自性(" + q5 + "点)が高い：独自性は「競合と比べて何が違うか」です。競合を知らずに差別化を主張するのは根拠不足です。競合の詳細分析が必要です。");
  }
  
  // 競合を知らないのに独自性が普通以上
  if (q2 < 2.5 && q5 >= 3) {
    contradictions.push("⚠️ 競合分析(" + q2 + "点)がほぼ無いのに独自性(" + q5 + "点)を認識：何と比較して独自なのでしょうか？競合の強み・弱みを把握してから独自性を再評価しましょう。");
  }
  
  // 市場理解が低いのに価値提案が高い（顧客ニーズ不明）
  if (q1 < 3 && q4 >= 4) {
    contradictions.push("⚠️ 市場理解(" + q1 + "点)が不足しているのに価値提案(" + q4 + "点)が高い：価値提案は「顧客が求めるもの」です。市場・顧客を深く理解せずに価値を定義するのは危険です。市場調査を優先しましょう。");
  }
  
  // === 論理的な依存関係の矛盾 ===
  
  // Q1→Q2: 市場理解が低いのに競合分析が高い
  if (q1 < 3 && q2 >= 4) {
    contradictions.push("⚠️ 市場理解(" + q1 + "点)が不十分なのに競合分析(" + q2 + "点)が高い：市場全体を理解しないと、競合の位置づけや戦略を正確に分析できません。市場構造の把握から始めましょう。");
  }
  
  // Q3→Q4: 自社分析が低いのに価値提案が高い
  if (q3 < 3 && q4 >= 4) {
    contradictions.push("⚠️ 自社分析(" + q3 + "点)が不十分なのに価値提案(" + q4 + "点)が高い：自社の強みを理解しないと、説得力ある価値提案はできません。何が自社の武器なのか、明確にしましょう。");
  }
  
  // Q4→Q6: 価値提案が低いのに商品サービスが高い
  if (q4 < 3 && q6 >= 4) {
    contradictions.push("⚠️ 価値提案(" + q4 + "点)が不明確なのに商品サービス(" + q6 + "点)が高い：「何を提供するか」が曖昧なまま実装されています。価値の再定義が必要です。");
  }
  
  // Q4→Q7: 価値提案が低いのにコミュニケーションが高い
  if (q4 < 3 && q7 >= 4) {
    contradictions.push("⚠️ 価値提案(" + q4 + "点)が不明確なのにコミュニケーション(" + q7 + "点)が高い：「何を伝えるか」が定まっていないのに発信だけ活発です。まずメッセージを明確にしましょう。");
  }
  
  // Q5→Q6: 独自性が低いのに商品サービスが高い
  if (q5 < 3 && q6 >= 4) {
    contradictions.push("⚠️ 独自性(" + q5 + "点)が不明確なのに商品サービス(" + q6 + "点)が高い：差別化ポイントが曖昧なまま商品化されています。「何が違うのか」を明確にしましょう。");
  }
  
  // Q7→Q8: コミュニケーションが低いのにインナーブランディングが高い
  if (q7 < 3 && q8 >= 4) {
    contradictions.push("⚠️ 外部コミュニケーション(" + q7 + "点)が弱いのに社内浸透(" + q8 + "点)が高い：社内だけで完結し、外に伝わっていません。対外発信を強化しましょう。");
  }
  
  // Q8→Q7: インナーが低いのにコミュニケーションが高い
  if (q8 < 2.5 && q7 >= 4) {
    contradictions.push("⚠️ 社内浸透(" + q8 + "点)が不足しているのに外部コミュニケーション(" + q7 + "点)が高い：従業員がブランドを理解していないのに、外向けだけ発信しています。言動不一致のリスクがあります。");
  }
  
  // Q9→Q10: KPI管理が低いのに成果が高い
  if (q9 < 3 && q10 >= 4) {
    contradictions.push("⚠️ KPI管理(" + q9 + "点)が不十分なのに成果(" + q10 + "点)が高い：測定せずに成果を判断するのは危険です。何が効いているか分からず、再現性がありません。客観的指標での検証が必要です。");
  }
  
  // Q10→Q12: 成果が低いのに成長意欲が高い
  if (q10 < 2.5 && q12 >= 4) {
    contradictions.push("⚠️ 成果(" + q10 + "点)が出ていないのに成長意欲(" + q12 + "点)が高い：現状の改善なしに拡大を目指すのは危険です。まず足元を固めることが先決です。");
  }
  
  // === カテゴリ間の矛盾 ===
  
  if (strategyAvg >= 3.5 && executionAvg < 2.5) {
    contradictions.push("⚠️ 戦略(" + strategyAvg.toFixed(1) + "点)は優れているが実行(" + executionAvg.toFixed(1) + "点)が弱い：「絵に描いた餅」状態です。実行体制の構築とアクションプランの策定が急務です。");
  }
  
  if (executionAvg >= 3.5 && resultsAvg < 2.5) {
    contradictions.push("⚠️ 実行(" + executionAvg.toFixed(1) + "点)しているが成果(" + resultsAvg.toFixed(1) + "点)が出ていない：方向性の誤りかKPI設定の問題です。戦略を見直し、PDCAサイクルを回しましょう。");
  }
  
  if (valueAvg >= 3.5 && executionAvg < 2.5) {
    contradictions.push("⚠️ 価値(" + valueAvg.toFixed(1) + "点)はあるが伝わっていない(" + executionAvg.toFixed(1) + "点)：優れた価値提案が市場に届いていません。コミュニケーション戦略を見直しましょう。");
  }
  
  // 戦略が弱いのに実行している
  if (strategyAvg < 2.5 && executionAvg >= 3.0) {
    contradictions.push("⚠️ 戦略(" + strategyAvg.toFixed(1) + "点)が不十分なのに実行(" + executionAvg.toFixed(1) + "点)している：方向性が定まらないまま活動しています。まず戦略を固めましょう。");
  }
  
  // === 知財保護の矛盾 ===
  
  if ((q10 >= 4 || avgScore >= 3.5) && q11 < 2.5) {
    contradictions.push("⚠️ 成果(" + q10 + "点)やブランド価値が高いのに知財保護(" + q11 + "点)が不足：ブランド資産が育っているのに法的保護がありません。模倣されるリスクがあります。");
  }

  // 🔍 2. メモ（課題・展望）との照合分析
  const memoAnalysis: string[] = [];
  
  if (memo && memo.length > 10) {
    const memoLower = memo.toLowerCase();
    
    // 課題キーワードとスコアの整合性
    const challenges = [
      { keywords: ['認知', '知名度', '知らない', '届いていない'], score: q7, threshold: 3, 
        match: "✓ 認知度の課題がコミュニケーションスコアと整合しています。ターゲット層への露出を増やす施策を優先しましょう。",
        mismatch: "💡 認知度に課題があるとのことですが、コミュニケーションスコアは比較的高いです。ターゲット設定やメッセージの精度を見直しましょう。" },
      { keywords: ['差別化', '独自性', '競合', '埋もれ'], score: q5, threshold: 3,
        match: "✓ 差別化の課題が独自性スコアと整合しています。競合との明確な違いを定義し、訴求を強化しましょう。",
        mismatch: "💡 差別化に課題があるとのことですが、独自性スコアは悪くありません。差別化ポイントの伝え方を改善すると良いでしょう。" },
      { keywords: ['組織', '社内', '従業員', '浸透', 'チーム'], score: q8, threshold: 3,
        match: "✓ 組織課題がインナーブランディングスコアと整合しています。社内浸透プログラムと従業員教育を実施しましょう。",
        mismatch: "💡 組織に課題があるとのことですが、インナーブランディングスコアは比較的高いです。具体的な課題を特定しましょう。" },
      { keywords: ['売上', '成果', '効果', '結果', 'ROI'], score: q10, threshold: 3,
        match: "✓ 成果の課題がスコアと整合しています。KPI設定と効果測定の仕組みを構築し、PDCAを回しましょう。",
        mismatch: "💡 成果に課題があるとのことですが、成果スコアは悪くありません。期待値と実績のギャップを分析しましょう。" },
      { keywords: ['市場', '顧客', 'ニーズ', 'ターゲット'], score: q1, threshold: 3,
        match: "✓ 市場理解の課題がスコアと整合しています。顧客調査と市場分析を徹底的に行いましょう。",
        mismatch: "💡 市場理解に課題があるとのことですが、市場理解スコアは比較的高いです。より深い洞察が必要かもしれません。" },
      { keywords: ['価値', '提供', 'ベネフィット', '強み'], score: q4, threshold: 3,
        match: "✓ 価値提案の課題がスコアと整合しています。顧客にとっての具体的価値を再定義しましょう。",
        mismatch: "💡 価値提案に課題があるとのことですが、スコアは比較的高いです。訴求方法の改善が有効かもしれません。" },
    ];
    
    challenges.forEach(({ keywords, score, threshold, match, mismatch }) => {
      const hasKeyword = keywords.some(kw => memo.includes(kw));
      if (hasKeyword) {
        memoAnalysis.push(score < threshold ? match : mismatch);
      }
    });
    
    // 展望の実現可能性評価
    const visions = [
      { keywords: ['拡大', '成長', 'スケール', '展開'], condition: () => strategyAvg >= 3.0 && executionAvg >= 3.0,
        positive: "✓ 成長への展望は実現可能です。戦略と実行の基盤があります。着実に進めましょう。",
        negative: "⚠️ 成長への展望がありますが、まず基盤固めが必要です。戦略（" + strategyAvg.toFixed(1) + "点）と実行（" + executionAvg.toFixed(1) + "点）を強化しましょう。" },
      { keywords: ['新規', '新事業', '新市場', '多角化'], condition: () => avgScore >= 3.5,
        positive: "✓ 新規展開への展望があり、既存事業の基盤も整っています。リスクを管理しながら挑戦しましょう。",
        negative: "⚠️ 新規展開への展望がありますが、既存事業の基盤固めを優先すべきです（総合" + avgScore.toFixed(1) + "点）。" },
      { keywords: ['ブランド', 'リブランディング', '刷新'], condition: () => strategyAvg >= 3.0,
        positive: "✓ ブランド刷新への展望があり、戦略的基盤もあります。計画的に進めましょう。",
        negative: "⚠️ ブランド刷新を考える前に、現状の戦略を固めることが重要です。" },
      { keywords: ['認知', '知名度向上', 'PR'], condition: () => q7 >= 3.0 && q4 >= 3.0,
        positive: "✓ 認知向上への展望は実現可能です。価値提案とコミュニケーション基盤があります。",
        negative: "⚠️ 認知向上の前に、伝えるべき価値（" + q4 + "点）とコミュニケーション力（" + q7 + "点）を強化しましょう。" },
    ];
    
    visions.forEach(({ keywords, condition, positive, negative }) => {
      const hasKeyword = keywords.some(kw => memo.includes(kw));
      if (hasKeyword) {
        memoAnalysis.push(condition() ? positive : negative);
      }
    });
    
    // 課題と展望のバランスチェック
    const hasChallenges = ['課題', '問題', '悩み', '困っ', '難しい'].some(kw => memo.includes(kw));
    const hasVisions = ['目指', '展望', '将来', '今後', '目標'].some(kw => memo.includes(kw));
    
    if (!hasChallenges && avgScore < 3.0) {
      memoAnalysis.push("💡 スコアからは改善領域が見えますが、課題認識が記述されていません。現状を客観的に分析することが改善の第一歩です。");
    }
    
    if (!hasVisions && avgScore >= 3.5) {
      memoAnalysis.push("💡 良好な基盤がありますが、将来の展望が記述されていません。次の成長ステージを描きましょう。");
    }
    
    if (hasChallenges && hasVisions && avgScore >= 3.0) {
      memoAnalysis.push("✓ 課題と展望の両方が明確で、実現可能なレベルです。計画的に取り組みましょう。");
    }
  }

  // 改善提案
  const recommendations: string[] = [];
  if (strategyAvg < 3.0) recommendations.push("3C分析（市場・競合・自社）を実施し、戦略の土台を固める");
  if (valueAvg < 3.0) recommendations.push("顧客インタビューを実施し、価値提案を明確化・差別化する");
  if (executionAvg < 3.0) recommendations.push("ブランドガイドラインを作成し、一貫したコミュニケーションを実施する");
  if (resultsAvg < 3.0) recommendations.push("3〜5個のKPIを設定し、月次で効果測定を行う");
  if (q11 < 3) recommendations.push("商標登録やデザイン保護など、知的財産を守る");
  if (recommendations.length < 3) recommendations.push("四半期ごとにブランドチェックを実施し、継続的に改善する");

  // 🎯 3. パターン分析

  // よくある失敗パターンの検知
  const failurePatterns: string[] = [];
  
  if (strategyAvg < 2.5 && executionAvg >= 3.0) {
    failurePatterns.push("❌ 【戦略なき実行】パターン：方向性が定まらないまま活動しています。リソースの無駄遣いになるリスクが高いです。");
  }
  
  if (q4 < 2.5 && q7 >= 3.5) {
    failurePatterns.push("❌ 【What（何を）よりHow（どう）優先】パターン：伝えるべき価値が曖昧なまま発信しています。まずメッセージを明確に。");
  }
  
  if (executionAvg >= 3.0 && q9 < 2.5) {
    failurePatterns.push("❌ 【測定なき実行】パターン：効果検証なしで施策を続けています。何が効いているか分からず改善できません。");
  }
  
  if (q7 >= 4.0 && q8 < 2.5) {
    failurePatterns.push("❌ 【外向きだけ】パターン：外部向けだけ頑張り、社内が置き去りです。従業員の行動とメッセージが乖離します。");
  }
  
  if (avgScore >= 3.5 && q11 < 2.0) {
    failurePatterns.push("❌ 【無防備な資産】パターン：ブランド資産が育ちつつあるのに法的保護がありません。模倣されるリスクがあります。");
  }
  
  if (strategyAvg < 2.5 && q12 >= 4.0) {
    failurePatterns.push("❌ 【焦りすぎ】パターン：基盤が弱いのに拡大を急いでいます。土台を固めてから成長を目指しましょう。");
  }
  
  if (q1 >= 4.0 && q2 < 2.5 && q3 < 2.5) {
    failurePatterns.push("❌ 【市場理解だけ】パターン：市場は見えているが競合と自社を見ていません。戦略が立てられません。");
  }

  // 成功への道筋の提示
  const successPath: string[] = [];
  
  if (avgScore < 2.5) {
    successPath.push("🎯 Step1: 3C分析で戦略の土台を作る（2ヶ月）");
    successPath.push("🎯 Step2: 価値提案と差別化ポイントを明確化（1ヶ月）");
    successPath.push("🎯 Step3: ブランドガイドライン作成と社内浸透（2ヶ月）");
    successPath.push("🎯 Step4: コミュニケーション施策の実行とKPI測定（継続）");
  } else if (avgScore < 3.5) {
    if (strategyAvg < 3.0) {
      successPath.push("🎯 優先: 戦略基盤の強化 → 市場・競合・自社分析の深掘り");
    }
    if (executionAvg < 3.0) {
      successPath.push("🎯 優先: 実行力の強化 → ブランドガイドライン作成と一貫したコミュニケーション");
    }
    if (resultsAvg < 3.0) {
      successPath.push("🎯 優先: 成果測定の仕組み化 → KPI設定と月次レビュー");
    }
    successPath.push("🎯 次のステップ: 弱点を補強したら、強みをさらに伸ばす");
  } else {
    successPath.push("🎯 現在: 強固な基盤があります。この強みを維持しましょう");
    if (q11 < 3.0) {
      successPath.push("🎯 次のステップ: ブランド資産の法的保護（商標登録等）");
    }
    if (q12 >= 4.0) {
      successPath.push("🎯 成長フェーズ: 新市場・新事業への展開を検討できる段階です");
    } else {
      successPath.push("🎯 次のステップ: 成長戦略の策定と実行計画の立案");
    }
  }

  // 🎯 優先アクション（緊急度×重要度）
  const priorityActions: string[] = [];
  
  // 最優先（クリティカル）
  if (strategyAvg < 2.0) {
    priorityActions.push("【最優先・緊急】市場・競合・自社の3C分析を今すぐ実施（1週間以内に着手）");
  }
  if (valueAvg < 2.0) {
    priorityActions.push("【最優先・緊急】顧客5〜10人にインタビューし、価値を再定義（2週間以内）");
  }
  
  // 重要度高
  if (contradictions.length >= 3) {
    priorityActions.push("【重要】矛盾" + contradictions.length + "件検出：論理的な順序で改善する必要あり");
  }
  if (strategyAvg >= 3.5 && executionAvg < 2.5) {
    priorityActions.push("【重要】戦略を実行に移すアクションプランを作成（1ヶ月以内）");
  }
  if (executionAvg >= 3.0 && q9 < 2.5) {
    priorityActions.push("【重要】効果測定のためKPIを3〜5個設定（2週間以内）");
  }
  
  // 中優先度
  if (q8 < 2.5 && avgScore >= 3.0) {
    priorityActions.push("【中】社内浸透プログラムの実施（3ヶ月計画）");
  }
  if (q11 < 2.5 && avgScore >= 3.5) {
    priorityActions.push("【中】商標登録など知財保護の検討（専門家に相談）");
  }

  // 🚨 リスクアラート
  const riskAlerts: string[] = [];
  
  if (strategyAvg < 2.5 && executionAvg >= 3.0) {
    riskAlerts.push("🚨 高リスク：方向性が不明確なまま実行中。リソースの無駄遣いになっています。");
  }
  if (executionAvg >= 3.0 && resultsAvg < 2.0) {
    riskAlerts.push("🚨 高リスク：施策が成果に繋がっていません。戦略の見直しが必要です。");
  }
  if (q11 < 2.0 && (avgScore >= 3.5 || q10 >= 4.0)) {
    riskAlerts.push("🚨 法的リスク：ブランド資産が育っているのに保護されていません。模倣されるリスクあり。");
  }
  if (q8 < 2.0 && q7 >= 4.0) {
    riskAlerts.push("🚨 組織リスク：社内と外部のメッセージが乖離。ブランド毀損の可能性あり。");
  }
  if (contradictions.length >= 5) {
    riskAlerts.push("🚨 構造的問題：重大な矛盾が" + contradictions.length + "件。根本的な見直しが必要です。");
  }

  // 事業フェーズ別アドバイス
  let phaseAdvice = "";
  switch (businessPhase) {
    case "構想中":
      phaseAdvice = "【構想中】市場・競合・自社の3C分析が最重要です。独自の価値提案を磨き、ブランドの土台をしっかり作りましょう。";
      if (strategyAvg < 3.0) phaseAdvice += " 特に戦略基盤（現在" + strategyAvg.toFixed(1) + "点）を3.0以上にすることが成功の鍵です。";
      break;
    case "売り出し中":
      phaseAdvice = "【売り出し中】ブランド認知度向上が最優先です。一貫したメッセージで市場に浸透させ、初期顧客との関係構築に注力しましょう。";
      if (executionAvg < 3.0) phaseAdvice += " コミュニケーション戦略（現在" + executionAvg.toFixed(1) + "点）を強化し、ターゲット層にリーチしましょう。";
      break;
    case "成長中":
      phaseAdvice = "【成長中】品質を維持しながらスケールすることが重要です。インナーブランディングを強化し、組織全体でブランド価値を体現しましょう。";
      if (q8 < 3.0) phaseAdvice += " 急成長で社内浸透（現在" + q8 + "点）が追いつかないリスクあり。従業員教育を急ぎましょう。";
      break;
    case "見直し中":
      phaseAdvice = "【見直し中】市場環境の変化と自社の強みを再評価しましょう。ブランドのリポジショニングやリフレッシュを検討し、新たな成長機会を探りましょう。";
      if (strategyAvg < 3.0) phaseAdvice += " まず3C分析を再実施し、環境変化を踏まえた戦略を再構築しましょう。";
      break;
    default:
      phaseAdvice = "現在の事業フェーズに合わせて、優先順位をつけて改善に取り組みましょう。";
  }

  return {
    overallRating,
    overallComment,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    recommendations: recommendations.slice(0, 5),
    phaseAdvice,
    contradictions,
    memoAnalysis,
    priorityActions,
    riskAlerts,
    successPath,
    failurePatterns,
  };
}