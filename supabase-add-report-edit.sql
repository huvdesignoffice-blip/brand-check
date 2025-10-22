-- survey_resultsテーブルにレポート編集用のカラムを追加
ALTER TABLE survey_results
ADD COLUMN IF NOT EXISTS edited_report JSONB;

-- edited_reportの構造:
-- {
--   "overallComment": "編集された総合評価",
--   "strengths": ["強み1", "強み2"],
--   "weaknesses": ["弱み1", "弱み2"],
--   "recommendations": ["提案1", "提案2"],
--   "contradictions": ["矛盾1", "矛盾2"],
--   "memoAnalysis": ["分析1", "分析2"],
--   "priorityActions": ["アクション1", "アクション2"],
--   "riskAlerts": ["リスク1", "リスク2"],
--   "successPath": ["道筋1", "道筋2"],
--   "failurePatterns": ["パターン1", "パターン2"],
--   "phaseAdvice": "フェーズ別アドバイス"
-- }

COMMENT ON COLUMN survey_results.edited_report IS 'AI診断レポートの手動編集内容（JSONB形式）';