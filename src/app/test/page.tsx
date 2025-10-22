import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data, error } = await supabase.from("assessments").select("count");
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase接続テスト</h1>
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <p className="font-semibold">Supabase URL:</p>
          <p className="text-sm">{process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded">
          <p className="font-semibold">Supabase Key (first 30 chars):</p>
          <p className="text-sm">{process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30)}...</p>
        </div>
        {error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <p className="font-semibold text-red-700">Error:</p>
            <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <p className="font-semibold text-green-700">Success:</p>
            <pre className="text-xs mt-2">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}