import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('=== SEND NOTIFICATION START ===');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { 
      company_name, 
      respondent_name, 
      respondent_email,
      avg_score, 
      business_phase, 
      result_id,
      scores // 各項目のスコア
    } = body;

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
    }

    if (!process.env.ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL is not set');
      return NextResponse.json({ error: 'Admin email not configured' }, { status: 500 });
    }

    const resultUrl = result_id 
      ? `https://brand-check-a3bd.vercel.app/results/${result_id}`
      : 'https://brand-check-a3bd.vercel.app/admin';

    // 1. 管理者への通知メール
    console.log('Sending admin notification to:', process.env.ADMIN_EMAIL);
    
    const adminEmail = await resend.emails.send({
      from: 'delivered@resend.dev',
      to: [process.env.ADMIN_EMAIL],
      subject: `新しいブランドチェック回答: ${company_name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0f172a;">新しいブランドチェック回答が届きました</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>企業名:</strong> ${company_name}</p>
            <p><strong>回答者:</strong> ${respondent_name}</p>
            <p><strong>メール:</strong> ${respondent_email}</p>
            <p><strong>事業フェーズ:</strong> ${business_phase}</p>
            <p><strong>平均スコア:</strong> ${avg_score} / 5.0</p>
          </div>
          <div style="margin: 30px 0;">
            <a href="${resultUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">結果を確認する</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            または、管理画面で詳細を確認してください。
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            © 2025 HUV DESIGN OFFICE
          </p>
        </div>
      `,
    });

    if (adminEmail.error) {
      console.error('Admin email error:', adminEmail.error);
    } else {
      console.log('Admin email sent successfully:', adminEmail.data);
    }

    // 2. 回答者への結果メール
    if (respondent_email) {
      console.log('Sending result notification to respondent:', respondent_email);
      
      const respondentEmail = await resend.emails.send({
        from: 'delivered@resend.dev',
        to: [respondent_email],
        subject: 'ブランドチェック診断結果のご報告',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">ブランドチェック診断結果</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Brand Check Results</p>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #0f172a; margin-top: 0;">ご回答ありがとうございました</h2>
              
              <p style="color: #475569; line-height: 1.6;">
                ${company_name} ${respondent_name} 様<br><br>
                この度は、ブランドチェックアンケートにご回答いただき、誠にありがとうございました。<br>
                診断結果をお送りいたします。
              </p>

              <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; border: 2px solid #667eea;">
                <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">総合スコア</p>
                <p style="color: #667eea; font-size: 48px; font-weight: bold; margin: 0; line-height: 1;">
                  ${avg_score}
                </p>
                <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 18px;">/ 5.0</p>
              </div>

              ${scores ? `
                <div style="margin: 30px 0;">
                  <h3 style="color: #0f172a; font-size: 18px; margin-bottom: 15px;">各項目のスコア</h3>
                  <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                    ${Object.entries(scores).map(([key, value]) => `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                        <span style="color: #475569; font-weight: 500;">${key}</span>
                        <span style="color: #667eea; font-weight: bold; font-size: 18px;">${value} / 5</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <div style="text-align: center; margin: 40px 0 30px 0;">
                <a href="${resultUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                  詳細な診断結果を見る →
                </a>
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 30px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>💡 ヒント:</strong> 診断結果ページでは、さらに詳細な分析とレーダーチャートをご確認いただけます。
                </p>
              </div>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                ご不明な点やご質問がございましたら、お気軽にお問い合わせください。<br>
                今後とも、どうぞよろしくお願いいたします。
              </p>

              <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 5px 0;">
                  このメールは自動送信されています
                </p>
                <p style="color: #cbd5e1; font-size: 11px; margin: 5px 0;">
                  © 2025 HUV DESIGN OFFICE. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `,
      });

      if (respondentEmail.error) {
        console.error('Respondent email error:', respondentEmail.error);
      } else {
        console.log('Respondent email sent successfully:', respondentEmail.data);
      }
    }

    return NextResponse.json({ 
      success: true, 
      adminEmail: adminEmail.data,
      respondentEmailSent: !!respondent_email 
    });
  } catch (error: any) {
    console.error('Send notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}