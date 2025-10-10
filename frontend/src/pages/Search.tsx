export default function Search() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🔍 検索</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">番号</label>
          <input
            type="text"
            placeholder="247エ714"
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ハッシュタグ</label>
          <input
            type="text"
            placeholder="#A地区"
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          検索
        </button>
      </div>
    </div>
  );
}