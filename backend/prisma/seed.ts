import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. 柱の種類
  console.log('📍 Seeding pole_types...');
  await prisma.poleType.createMany({
    data: [
      { id: 1, name: '電柱', parentId: null, icon: '⚡', sortOrder: 10 },
      { id: 2, name: 'その他', parentId: null, icon: '📍', sortOrder: 20 },
      { id: 3, name: '照明柱', parentId: 2, icon: '💡', sortOrder: 21 },
      { id: 4, name: '標識柱', parentId: 2, icon: '🚏', sortOrder: 22 },
      { id: 5, name: '信号柱', parentId: 2, icon: '🚦', sortOrder: 23 },
      { id: 6, name: 'その他', parentId: 2, icon: '📍', sortOrder: 29 },
    ],
    skipDuplicates: true,
  });

  // 2. 事業者
  console.log('🏢 Seeding pole_operators...');
  await prisma.poleOperator.createMany({
    data: [
      { name: '北海道電力', nameShort: 'ほくでん', category: 'power', areaCoverage: '北海道', numberFormat: '数字+カナ+数字', exampleNumber: '123ア456', sortOrder: 10 },
      { name: '東北電力', nameShort: '東北電', category: 'power', areaCoverage: '東北', numberFormat: '数字+カナ+数字', exampleNumber: '123ア456', sortOrder: 20 },
      { name: '東京電力', nameShort: '東電', category: 'power', areaCoverage: '関東', numberFormat: '数字-数字', exampleNumber: '1-234', sortOrder: 30 },
      { name: '中部電力', nameShort: '中電', category: 'power', areaCoverage: '中部', numberFormat: '数字2桁+カナ+数字4桁', exampleNumber: '06え3336', sortOrder: 40 },
      { name: '北陸電力', nameShort: '北陸電', category: 'power', areaCoverage: '北陸', numberFormat: '', exampleNumber: '', sortOrder: 50 },
      { name: '関西電力', nameShort: '関電', category: 'power', areaCoverage: '関西', numberFormat: '電力+数字+方角', exampleNumber: '電力10北1', sortOrder: 60 },
      { name: '中国電力', nameShort: '中国電', category: 'power', areaCoverage: '中国', numberFormat: '数字4桁+漢字カナ+数字', exampleNumber: '0384林ツI600', sortOrder: 70 },
      { name: '四国電力', nameShort: '四国電', category: 'power', areaCoverage: '四国', numberFormat: '会社名+方角数字', exampleNumber: 'ヒロシマカン2右3', sortOrder: 80 },
      { name: '九州電力', nameShort: '九電', category: 'power', areaCoverage: '九州', numberFormat: '数字3桁+カナ+数字3桁', exampleNumber: '247エ714', sortOrder: 90 },
      { name: '沖縄電力', nameShort: '沖縄電', category: 'power', areaCoverage: '沖縄', numberFormat: 'カナ+カン+数字英数', exampleNumber: 'キタカン28N23', sortOrder: 100 },
      { name: 'NTT', nameShort: 'NTT', category: 'telecom', areaCoverage: '全国', numberFormat: '英数字', exampleNumber: '12A, 2R2R', sortOrder: 200 },
      { name: 'KDDI', nameShort: 'KDDI', category: 'telecom', areaCoverage: '全国', numberFormat: 'KDDI+数字', exampleNumber: 'KDDI-123', sortOrder: 210 },
      { name: '自治体', nameShort: '自治体', category: 'other', areaCoverage: '全国', numberFormat: '様々', exampleNumber: '中央線20-A', sortOrder: 300 },
      { name: 'その他', nameShort: 'その他', category: 'other', areaCoverage: '全国', numberFormat: '様々', exampleNumber: '', sortOrder: 900 },
    ],
    skipDuplicates: true,
  });

  // 3. 都道府県
  console.log('🗾 Seeding prefectures...');
  await prisma.prefecture.createMany({
    data: [
      { name: '北海道', region: '北海道', primaryPowerCompany: '北海道電力', boundaryArea: false },
      { name: '青森県', region: '東北', primaryPowerCompany: '東北電力', boundaryArea: false },
      { name: '岩手県', region: '東北', primaryPowerCompany: '東北電力', boundaryArea: false },
      { name: '宮城県', region: '東北', primaryPowerCompany: '東北電力', boundaryArea: false },
      { name: '秋田県', region: '東北', primaryPowerCompany: '東北電力', boundaryArea: false },
      { name: '山形県', region: '東北', primaryPowerCompany: '東北電力', boundaryArea: false },
      { name: '福島県', region: '東北', primaryPowerCompany: '東北電力', boundaryArea: false },
      { name: '新潟県', region: '東北', primaryPowerCompany: '東北電力', boundaryArea: false },
      { name: '茨城県', region: '関東', primaryPowerCompany: '東京電力', boundaryArea: false },
      { name: '栃木県', region: '関東', primaryPowerCompany: '東京電力', boundaryArea: false },
      { name: '群馬県', region: '関東', primaryPowerCompany: '東京電力', boundaryArea: false },
      { name: '埼玉県', region: '関東', primaryPowerCompany: '東京電力', boundaryArea: false },
      { name: '千葉県', region: '関東', primaryPowerCompany: '東京電力', boundaryArea: false },
      { name: '東京都', region: '関東', primaryPowerCompany: '東京電力', boundaryArea: false },
      { name: '神奈川県', region: '関東', primaryPowerCompany: '東京電力', boundaryArea: false },
      { name: '山梨県', region: '関東', primaryPowerCompany: '東京電力', boundaryArea: false },
      { name: '静岡県', region: '中部', primaryPowerCompany: '中部電力', boundaryArea: true },
      { name: '愛知県', region: '中部', primaryPowerCompany: '中部電力', boundaryArea: false },
      { name: '岐阜県', region: '中部', primaryPowerCompany: '中部電力', boundaryArea: false },
      { name: '三重県', region: '中部', primaryPowerCompany: '中部電力', boundaryArea: false },
      { name: '長野県', region: '中部', primaryPowerCompany: '中部電力', boundaryArea: false },
      { name: '富山県', region: '北陸', primaryPowerCompany: '北陸電力', boundaryArea: false },
      { name: '石川県', region: '北陸', primaryPowerCompany: '北陸電力', boundaryArea: false },
      { name: '福井県', region: '北陸', primaryPowerCompany: '北陸電力', boundaryArea: true },
      { name: '滋賀県', region: '関西', primaryPowerCompany: '関西電力', boundaryArea: false },
      { name: '京都府', region: '関西', primaryPowerCompany: '関西電力', boundaryArea: false },
      { name: '大阪府', region: '関西', primaryPowerCompany: '関西電力', boundaryArea: false },
      { name: '兵庫県', region: '関西', primaryPowerCompany: '関西電力', boundaryArea: false },
      { name: '奈良県', region: '関西', primaryPowerCompany: '関西電力', boundaryArea: false },
      { name: '和歌山県', region: '関西', primaryPowerCompany: '関西電力', boundaryArea: false },
      { name: '鳥取県', region: '中国', primaryPowerCompany: '中国電力', boundaryArea: false },
      { name: '島根県', region: '中国', primaryPowerCompany: '中国電力', boundaryArea: false },
      { name: '岡山県', region: '中国', primaryPowerCompany: '中国電力', boundaryArea: false },
      { name: '広島県', region: '中国', primaryPowerCompany: '中国電力', boundaryArea: false },
      { name: '山口県', region: '中国', primaryPowerCompany: '中国電力', boundaryArea: true },
      { name: '徳島県', region: '四国', primaryPowerCompany: '四国電力', boundaryArea: false },
      { name: '香川県', region: '四国', primaryPowerCompany: '四国電力', boundaryArea: false },
      { name: '愛媛県', region: '四国', primaryPowerCompany: '四国電力', boundaryArea: false },
      { name: '高知県', region: '四国', primaryPowerCompany: '四国電力', boundaryArea: false },
      { name: '福岡県', region: '九州', primaryPowerCompany: '九州電力', boundaryArea: false },
      { name: '佐賀県', region: '九州', primaryPowerCompany: '九州電力', boundaryArea: false },
      { name: '長崎県', region: '九州', primaryPowerCompany: '九州電力', boundaryArea: false },
      { name: '熊本県', region: '九州', primaryPowerCompany: '九州電力', boundaryArea: false },
      { name: '大分県', region: '九州', primaryPowerCompany: '九州電力', boundaryArea: false },
      { name: '宮崎県', region: '九州', primaryPowerCompany: '九州電力', boundaryArea: false },
      { name: '鹿児島県', region: '九州', primaryPowerCompany: '九州電力', boundaryArea: false },
      { name: '沖縄県', region: '沖縄', primaryPowerCompany: '沖縄電力', boundaryArea: false },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });