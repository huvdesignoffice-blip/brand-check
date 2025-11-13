export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Brand Check
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            ブランドチェック診断
          </p>
          <p className="text-gray-600 mb-8">
            企業のブランド力を診断するアセスメントツール
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/survey"
            className="block p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-center"
          >
            <h3 className="text-2xl font-bold mb-2">診断を開始</h3>
            <p className="text-blue-100">ブランドチェックを実施する</p>
          </a>

          <a
            href="/admin"
            className="block p-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors text-center"
          >
            <h3 className="text-2xl font-bold mb-2">管理画面</h3>
            <p className="text-purple-100">診断結果を確認する</p>
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>© 2025 HUV DESIGN OFFICE</p>
        </div>
      </div>
    </div>
  );
}
