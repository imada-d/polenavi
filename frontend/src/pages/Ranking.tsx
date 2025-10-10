export default function Ranking() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🏆 ランキング</h1>
      <div className="space-y-2">
        <div className="bg-white p-4 rounded shadow flex items-center gap-3">
          <span className="text-2xl">🥇</span>
          <div>
            <p className="font-bold">1位: ---</p>
            <p className="text-sm text-gray-500">0本</p>
          </div>
        </div>
      </div>
    </div>
  );
}