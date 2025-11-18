// 何を: 利用規約ページ（モバイル・PC両対応）
// なぜ: サービスの利用規約を表示するため

import { useNavigate } from 'react-router-dom';
import Header from '../components/pc/Header';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PC用ヘッダー */}
      <Header />

      {/* モバイル用ヘッダー */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">📄 利用規約</h1>
      </header>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="hidden md:flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">📄 利用規約</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">PoleNavi利用規約</h2>
          </div>

          {/* 1. サービスについて */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">1. サービスについて</h3>
            <p className="text-gray-700 leading-relaxed">
              PoleNavi(以下「本サービス」)は、電柱の位置情報を共有するプラットフォームです。ユーザーが撮影した電柱の写真と位置情報を登録・共有することで、電柱の所在を簡単に検索できるサービスを提供します。本サービスは基本的に無料でご利用いただけます。
            </p>
          </section>

          {/* 2. 利用条件 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">2. 利用条件</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              本サービスを利用するには、以下の条件を満たす必要があります。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>有効なメールアドレスを持っていること</li>
              <li>本規約および関連する法令を遵守すること</li>
            </ul>
          </section>

          {/* 3. 禁止事項 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">3. 禁止事項</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              本サービスの利用において、以下の行為を禁止します。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>虚偽の電柱情報や位置情報の登録</li>
              <li>他者の権利(著作権、商標権、プライバシー権など)を侵害する行為</li>
              <li>サービスの運営を妨害する行為(不正アクセス、大量リクエストなど)</li>
              <li>違法行為または公序良俗に反する行為</li>
              <li>他のユーザーになりすます行為</li>
              <li>複数のアカウントを不正に作成・使用する行為</li>
              <li>本サービスを商業目的で無断利用する行為</li>
              <li>システムの脆弱性を探索・悪用する行為</li>
            </ul>
          </section>

          {/* 4. 写真投稿について */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">4. 写真投稿について</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              写真を投稿する際は、以下の点に注意してください。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>第三者の顔が識別できる写真は投稿しないでください</li>
              <li>車のナンバープレートが読み取れる写真は避けてください</li>
              <li>個人宅が特定できる写真は投稿しないでください</li>
              <li>暴力的、わいせつな内容を含む写真は禁止です</li>
              <li>著作権を侵害する写真は投稿できません</li>
              <li>電柱と関係のない写真は投稿しないでください</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              運営は、これらのルールに違反する写真や不適切と判断した写真を、予告なく削除する権利を有します。
            </p>
          </section>

          {/* 5. 投稿内容の取り扱い */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">5. 投稿内容の取り扱い</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>投稿された電柱情報は、全てのユーザーが閲覧できる公開情報となります</li>
              <li>投稿された写真の著作権は撮影者に帰属します</li>
              <li>投稿者は、投稿する写真について必要な権利を有していることを保証するものとします</li>
              <li>投稿者は、本サービスの運営・改善・プロモーションのために、運営が投稿内容を無償で利用することに同意するものとします</li>
              <li>不適切な投稿や本規約に違反する投稿は、予告なく削除する場合があります</li>
              <li>投稿の削除を希望する場合は、マイページから削除できます</li>
            </ul>
          </section>

          {/* 6. グループ機能について */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">6. グループ機能について</h3>

            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.1 グループの作成</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>全てのユーザーはグループを作成できます</li>
              <li>グループを作成したユーザーは自動的に管理者となります</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.2 管理者の権限と責任</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>管理者は、グループの設定変更、メンバーの招待・削除、グループの削除を行えます</li>
              <li>管理者は、グループ内での不適切な行為を防止する責任があります</li>
              <li>グループに最低1名の管理者が必要です。唯一の管理者は、他のメンバーを管理者に指定してからでないと脱退できません</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.3 メンバーの権利</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>全てのメンバーは、いつでも自由にグループから脱退できます</li>
              <li>管理者は、メンバーをグループから削除できます</li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">6.4 電柱情報の公開範囲</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>グループに紐づいた電柱情報であっても、全てのユーザーが閲覧・編集できます</li>
              <li>グループ機能は作業チームとしての利用を想定しており、情報の閲覧制限機能ではありません</li>
            </ul>
          </section>

          {/* 7. 免責事項 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">7. 免責事項</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>本サービスに掲載される情報の正確性、完全性、有用性について、運営は一切保証しません</li>
              <li>ユーザー間のトラブルについて、運営は原則として関与しません。ユーザー間で解決してください</li>
              <li>サービスの利用により発生した損害について、運営は責任を負いません(法令で定められた範囲を除く)</li>
              <li>本サービスは予告なく内容の変更、一時停止、終了する場合があります</li>
              <li>システム障害やメンテナンスによるサービス停止について、運営は責任を負いません</li>
            </ul>
          </section>

          {/* 8. ユーザーの責任 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">8. ユーザーの責任</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>アカウント情報(メールアドレス、パスワード)は自己責任で厳重に管理してください</li>
              <li>アカウント情報の漏洩や不正利用による損害は、ユーザー自身が責任を負います</li>
              <li>アカウントを第三者に譲渡・貸与することはできません</li>
              <li>本サービスの利用は、ユーザー自身の責任において行ってください</li>
              <li>本規約に違反した場合、運営は事前通知なくアカウントを停止・削除できます</li>
            </ul>
          </section>

          {/* 9. アカウントの管理 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">9. アカウントの管理</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>1人につき1アカウントの作成を原則とします</li>
              <li>アカウントの削除を希望する場合は、マイページから削除できます</li>
              <li>アカウント削除後も、投稿された電柱情報は残ります</li>
              <li>長期間(180日以上)利用のないアカウントは、予告なく削除する場合があります</li>
            </ul>
          </section>

          {/* 10. 知的財産権 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">10. 知的財産権</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              本サービスに関する著作権、商標権、その他の知的財産権は、運営またはライセンス元に帰属します。ユーザーは、運営の許可なく以下の行為を行うことはできません。
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>本サービスのコンテンツを複製、改変、配布すること</li>
              <li>本サービスの名称やロゴを使用すること</li>
              <li>本サービスのデータを自動取得(スクレイピング)すること</li>
            </ul>
          </section>

          {/* 11. サービスの変更・終了 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">11. サービスの変更・終了</h3>
            <p className="text-gray-700 leading-relaxed">
              運営は、ユーザーへの事前通知なく、本サービスの内容を変更、追加、または本サービスの提供を終了することができます。サービス終了の際は、可能な限り事前にウェブサイト上で告知します。
            </p>
          </section>

          {/* 12. 本規約の変更 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">12. 本規約の変更</h3>
            <p className="text-gray-700 leading-relaxed">
              運営は、必要に応じて本規約を変更できます。規約変更時は、ウェブサイト上で告知し、変更後の規約は告知した日から効力を生じます。変更後も本サービスを継続利用する場合、変更後の規約に同意したものとみなします。
            </p>
          </section>

          {/* 13. 準拠法・管轄裁判所 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">13. 準拠法・管轄裁判所</h3>
            <p className="text-gray-700 leading-relaxed">
              本規約の解釈および適用は、日本法に準拠します。本サービスに関連して生じた紛争については、運営の所在地を管轄する裁判所を専属的合意管轄裁判所とします。
            </p>
          </section>

          {/* 制定日・改定日 */}
          <section className="border-t pt-6 mt-8">
            <div className="text-gray-600 space-y-1">
              <p><strong>制定日:</strong> 2025年11月7日</p>
              <p><strong>最終改定日:</strong> 2025年11月18日</p>
              <p><strong>運営:</strong> imada-lab</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
