// U’: PCHnáâûÏÃ·å¿°»¯·çó
// j\: ûgáâhÏÃ·å¿°’ı gM‹ˆFkY‹_

interface MemoSectionProps {
  hashtags: string;
  memoText: string;
  onHashtagsChange: (hashtags: string) => void;
  onMemoTextChange: (memoText: string) => void;
}

export default function MemoSection({
  hashtags,
  memoText,
  onHashtagsChange,
  onMemoTextChange,
}: MemoSectionProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3">=İ áâû	</h2>

      {/* ÏÃ·å¿°e› */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          <÷ ÏÃ·å¿°
        </label>
        <input
          type="text"
          value={hashtags}
          onChange={(e) => onHashtagsChange(e.target.value)}
          placeholder="#2¯o #LED"
          className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          =¡ «óŞ¹Úü¹g:cfpe›gM~Y
        </p>
      </div>

      {/* áâe› */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          =Ä áâ,‡
        </label>
        <textarea
          value={memoText}
          onChange={(e) => onMemoTextChange(e.target.value)}
          placeholder="2025/09/30 ¤Û&#10;¡j÷: 123"
          rows={4}
          className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          =¡ áâoŒK‰èÆgM~Y
        </p>
      </div>

      {/* ÒóÈ */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-xs text-gray-700">
          <strong>=¡ ÒóÈ</strong>
          <br />
          ûÏÃ·å¿°g"W„YOjŠ~Y
          <br />
          ûáâoº„j¡(kH~Y
        </p>
      </div>
    </div>
  );
}
