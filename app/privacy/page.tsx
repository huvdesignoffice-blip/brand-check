'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">個人情報保護方針</h1>
            <Image
              src="/variation logo_1.png"
              alt="HUV Design Office Logo"
              width={120}
              height={48}
              className="object-contain"
              priority
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        </div>

        {/* 本文 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              HUV DESIGN OFFICE（以下「当社」といいます）は、ブランドチェック診断サービス（以下「本サービス」といいます）において、お客様の個人情報を以下のとおり取り扱います。
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. 収集する情報</h2>
            <p className="text-gray-700 mb-4">本サービスでは、以下の情報を収集します：</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>企業名</li>
              <li>回答者名</li>
              <li>メールアドレス</li>
              <li>業種</li>
              <li>事業フェーズ</li>
              <li>年間売上規模</li>
              <li>診断に関する回答内容</li>
              <li>その他、お客様が任意で提供する情報</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. 利用目的</h2>
            <p className="text-gray-700 mb-4">収集した個人情報は、以下の目的で利用します：</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>診断結果の分析およびレポートの作成</li>
              <li>診断結果のご提供</li>
              <li>お客様へのご連絡およびフォローアップ</li>
              <li>コンサルティングサービスのご案内</li>
              <li>本サービスの改善および新サービスの開発</li>
              <li>統計データの作成（個人を特定できない形式で使用）</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. 第三者への提供</h2>
            <p className="text-gray-700 mb-6">
              当社は、お客様の個人情報を、お客様の同意なく第三者に提供することはありません。ただし、以下の場合を除きます：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難である場合</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. 委託</h2>
            <p className="text-gray-700 mb-6">
              当社は、個人情報の取扱いの全部または一部を第三者に委託する場合があります。その場合、当社は、個人情報を適切に取り扱っていると認められる委託先を選定し、契約等において個人情報の適正管理・機密保持等を規定し、適切な管理を実施させます。
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. 安全管理措置</h2>
            <p className="text-gray-700 mb-6">
              当社は、個人情報への不正アクセス、個人情報の紛失、破壊、改ざんおよび漏洩等を防止するため、適切な安全管理措置を講じます。
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. 個人情報の開示・訂正・削除</h2>
            <p className="text-gray-700 mb-6">
              お客様は、当社が保有する自己の個人情報について、開示、訂正、削除等を求めることができます。ご請求される場合は、以下の連絡先までお問い合わせください。
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Cookie等の使用</h2>
            <p className="text-gray-700 mb-6">
              本サービスでは、サービスの利便性向上のためCookie等の技術を使用する場合があります。これらの技術により、お客様の個人を特定することはありません。
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. お問い合わせ窓口</h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <p className="text-gray-700 mb-2"><strong>HUV DESIGN OFFICE</strong></p>
              <p className="text-gray-700 mb-2">個人情報保護管理責任者：代表</p>
              <p className="text-gray-700 mb-2">メールアドレス：huvdesignoffice@gmail.com</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. 本方針の変更</h2>
            <p className="text-gray-700 mb-6">
              当社は、法令の変更等に伴い、本方針を変更することがあります。変更後の個人情報保護方針は、本ページに掲載した時点から効力を生じるものとします。
            </p>

            <p className="text-gray-600 text-sm mt-8">制定日：2025年11月15日</p>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-center gap-4 mb-8">
          <Link
            href="/survey"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg shadow-md transition-all"
          >
            診断ページに戻る
          </Link>
          <Link
            href="/"
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg shadow-md transition-all"
          >
            ホームに戻る
          </Link>
        </div>

        {/* フッター */}
        <div className="text-center text-gray-600 text-sm">
          <p>© 2025 HUV DESIGN OFFICE</p>
        </div>
      </div>
    </div>
  );
}
