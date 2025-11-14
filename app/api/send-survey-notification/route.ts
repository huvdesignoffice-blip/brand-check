import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      company_name, 
      respondent_name, 
      respondent_email,
      industry,
      revenue_scale, 
      business_phase,
      avg_score,
      result_id 
    } = body;

    // 管理者に送信する通知メール
    const { data, error } = await resend.emails.send({
      from: 'Brand Check <delivered@resend.dev>',
      to: process.env.ADMIN_EMAIL || 'huvdesignoffice@gmail.com', // 環境変数で設定
      subject: `【新規診断】${company_name} 様からブランドチェック診断が届きました`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
              }
              .info-row {
                padding: 12px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .info-label {
                font-weight: bold;
                color: #6b7280;
                display: inline-block;
                width: 140px;
              }
              .info-value {
                color: #111827;
              }
              .score {
                background: #3b82f6;
                color: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin: 20px 0;
              }
              .score-value {
                font-size: 48px;
                font-weight: bold;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin-top: 20px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🎯 新規ブランドチェック診断</h1>
                <p style="margin: 10px 0 0 0;">クライアント様から診断が届きました</p>
              </div>
              
              <div class="content">
                <h2 style="color: #111827; margin-top: 0;">診断情報</h2>
                
                <div class="info-row">
                  <span class="info-label">企業名:</span>
                  <span class="info-value">${company_name}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">回答者:</span>
                  <span class="info-value">${respondent_name}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">メールアドレス:</span>
                  <span class="info-value">${respondent_email}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">業種:</span>
                  <span class="info-value">${industry || '未記入'}</span>
                </div>
                
                <div class="info-row">
  <span class="info-label">年間売上規模:</span>
  <span class="info-value">${revenue_scale || '未記入'}</span>
</div>

                <div class="info-row" style="border-bottom: none;">
                  <span class="info-label">事業フェーズ:</span>
                  <span class="info-value">${business_phase}</span>
                </div>
                
                <div class="score">
                  <div style="font-size: 14px; margin-bottom: 10px;">総合スコア</div>
                  <div class="score-value">${avg_score ? Number(avg_score).toFixed(1) : '計算中'}</div>
                  <div style="font-size: 14px; margin-top: 5px;">/ 5.0</div>
                </div>
                
                <div style="text-align: center;">
                  <a href="https://brand-check-a3bd.vercel.app/results/${result_id}" class="button">
                    📊 診断結果を確認する
                  </a>
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                  <strong>⚡ 次のアクション:</strong><br>
                  • AI分析レポートの確認<br>
                  • クライアントへのフォローアップ<br>
                  • コンサルティング提案の準備
                </div>
              </div>
              
              <div class="footer">
                <p>このメールはBrand Check診断システムから自動送信されています。</p>
                <p>© 2025 HUV DESIGN OFFICE</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in notification API:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
