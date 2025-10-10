export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">PoleNavi</h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">📍</button>
          <button className="p-2 hover:bg-gray-100 rounded">🔔</button>
        </div>
      </header>
      
      <main className="flex-1 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">地図エリア（後で実装）</p>
      </main>
      
      <button className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 font-bold">
        ⚡ クイック登録
      </button>
    </div>
  );
}