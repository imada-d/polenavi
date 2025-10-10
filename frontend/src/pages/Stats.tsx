export default function Stats() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">📊 統計</h1>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">総登録数</p>
          <p className="text-3xl font-bold">0本</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">参加ユーザー数</p>
          <p className="text-3xl font-bold">0人</p>
        </div>
      </div>
    </div>
  );
}