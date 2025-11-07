-- 何を: ユーザーに警告システムのカラムを追加
-- なぜ: 不適切なコンテンツ投稿者への警告とアップロード制限を実装するため

-- 警告数カラムを追加
ALTER TABLE users ADD COLUMN warning_count INT NOT NULL DEFAULT 0;

-- アップロード禁止フラグを追加
ALTER TABLE users ADD COLUMN upload_banned BOOLEAN NOT NULL DEFAULT false;

-- 禁止日時を追加
ALTER TABLE users ADD COLUMN banned_at TIMESTAMP;

-- 禁止理由を追加
ALTER TABLE users ADD COLUMN ban_reason VARCHAR(500);
