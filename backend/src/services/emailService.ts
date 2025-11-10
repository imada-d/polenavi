import { Resend } from 'resend';
import { config } from '../config';

// Resendクライアントの初期化
const resend = new Resend(config.resendApiKey);

// 何を: メール送信の共通インターフェース
// なぜ: メール送信を統一的に管理するため
interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * 何を: メールを送信する共通関数
 * なぜ: Resend APIを使用してメールを送信するため
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    console.log(`📧 [Email Service] メール送信開始: ${options.to}`);

    const { data, error } = await resend.emails.send({
      from: config.emailFrom,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error(`❌ [Email Service] メール送信エラー:`, error);
      throw new Error(`メール送信に失敗しました: ${error.message}`);
    }

    console.log(`✅ [Email Service] メール送信成功:`, data);
  } catch (error: any) {
    console.error(`❌ [Email Service] メール送信例外:`, error);
    throw new Error(`メール送信に失敗しました: ${error.message}`);
  }
}

/**
 * 何を: メールアドレス検証用のメールを送信
 * なぜ: ユーザー登録時にメールアドレスを確認するため
 */
export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>メールアドレスの確認</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2563eb; margin-top: 0;">PoleNavi へようこそ！</h1>
        <p>こんにちは、<strong>${username}</strong> さん</p>
        <p>PoleNavi にご登録いただきありがとうございます。</p>
        <p>以下のボタンをクリックして、メールアドレスの確認を完了してください。</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            メールアドレスを確認する
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：
        </p>
        <p style="word-break: break-all; color: #666; font-size: 12px; background-color: #fff; padding: 10px; border-radius: 5px;">
          ${verificationUrl}
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #999; font-size: 12px;">
          このメールに心当たりがない場合は、無視していただいて構いません。<br>
          このリンクは24時間で無効になります。
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
PoleNavi へようこそ！

こんにちは、${username} さん

PoleNavi にご登録いただきありがとうございます。
以下のURLにアクセスして、メールアドレスの確認を完了してください。

${verificationUrl}

このメールに心当たりがない場合は、無視していただいて構いません。
このリンクは24時間で無効になります。
  `;

  await sendEmail({
    to: email,
    subject: '【PoleNavi】メールアドレスの確認',
    html,
    text,
  });
}

/**
 * 何を: パスワードリセット用のメールを送信
 * なぜ: ユーザーがパスワードを忘れた時にリセットリンクを送信するため
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>パスワードのリセット</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #dc2626; margin-top: 0;">パスワードのリセット</h1>
        <p>こんにちは、<strong>${username}</strong> さん</p>
        <p>パスワードのリセットがリクエストされました。</p>
        <p>以下のボタンをクリックして、新しいパスワードを設定してください。</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            パスワードをリセットする
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：
        </p>
        <p style="word-break: break-all; color: #666; font-size: 12px; background-color: #fff; padding: 10px; border-radius: 5px;">
          ${resetUrl}
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #dc2626; font-weight: bold;">⚠️ 重要なお知らせ</p>
        <p style="color: #666; font-size: 14px;">
          このパスワードリセットをリクエストしていない場合は、このメールを無視してください。<br>
          このリンクは1時間で無効になります。
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
パスワードのリセット

こんにちは、${username} さん

パスワードのリセットがリクエストされました。
以下のURLにアクセスして、新しいパスワードを設定してください。

${resetUrl}

このパスワードリセットをリクエストしていない場合は、このメールを無視してください。
このリンクは1時間で無効になります。
  `;

  await sendEmail({
    to: email,
    subject: '【PoleNavi】パスワードのリセット',
    html,
    text,
  });
}

/**
 * 何を: メールアドレス変更確認用のメールを送信
 * なぜ: ユーザーが新しいメールアドレスを確認するため
 */
export async function sendEmailChangeEmail(
  newEmail: string,
  username: string,
  changeToken: string
): Promise<void> {
  const confirmUrl = `${config.frontendUrl}/confirm-email-change?token=${changeToken}`;

  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>メールアドレスの変更確認</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2563eb; margin-top: 0;">メールアドレスの変更確認</h1>
        <p>こんにちは、<strong>${username}</strong> さん</p>
        <p>メールアドレスの変更がリクエストされました。</p>
        <p>以下のボタンをクリックして、新しいメールアドレスを確認してください。</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}"
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            メールアドレス変更を確認する
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          ボタンが機能しない場合は、以下のURLをコピーしてブラウザに貼り付けてください：
        </p>
        <p style="word-break: break-all; color: #666; font-size: 12px; background-color: #fff; padding: 10px; border-radius: 5px;">
          ${confirmUrl}
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #999; font-size: 12px;">
          この変更をリクエストしていない場合は、すぐにアカウントのセキュリティを確認してください。<br>
          このリンクは24時間で無効になります。
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
メールアドレスの変更確認

こんにちは、${username} さん

メールアドレスの変更がリクエストされました。
以下のURLにアクセスして、新しいメールアドレスを確認してください。

${confirmUrl}

この変更をリクエストしていない場合は、すぐにアカウントのセキュリティを確認してください。
このリンクは24時間で無効になります。
  `;

  await sendEmail({
    to: newEmail,
    subject: '【PoleNavi】メールアドレスの変更確認',
    html,
    text,
  });
}

/**
 * 何を: ログイン通知メールを送信
 * なぜ: 不正アクセスの早期発見のため
 */
export async function sendLoginNotificationEmail(
  email: string,
  username: string,
  ipAddress: string,
  userAgent: string,
  loginTime: Date
): Promise<void> {
  const formattedTime = loginTime.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });

  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ログイン通知</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #2563eb; margin-top: 0;">ログイン通知</h1>
        <p>こんにちは、<strong>${username}</strong> さん</p>
        <p>あなたのアカウントにログインがありました。</p>

        <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>ログイン日時:</strong> ${formattedTime}</p>
          <p style="margin: 5px 0;"><strong>IPアドレス:</strong> ${ipAddress}</p>
          <p style="margin: 5px 0; word-break: break-all;"><strong>デバイス:</strong> ${userAgent}</p>
        </div>

        <p style="color: #666; font-size: 14px;">
          このログインに心当たりがない場合は、すぐにパスワードを変更してください。
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}/settings/security"
             style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            セキュリティ設定を確認
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #999; font-size: 12px;">
          このメールはセキュリティ通知のため、すべてのログイン時に自動送信されます。<br>
          通知を停止したい場合は、設定ページから変更できます。
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
ログイン通知

こんにちは、${username} さん

あなたのアカウントにログインがありました。

ログイン日時: ${formattedTime}
IPアドレス: ${ipAddress}
デバイス: ${userAgent}

このログインに心当たりがない場合は、すぐにパスワードを変更してください。

${config.frontendUrl}/settings/security
  `;

  await sendEmail({
    to: email,
    subject: '【PoleNavi】ログイン通知',
    html,
    text,
  });
}

/**
 * 何を: ウェルカムメールを送信（メール確認完了後）
 * なぜ: 新規ユーザーを歓迎し、次のステップを案内するため
 */
export async function sendWelcomeEmail(
  email: string,
  username: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>PoleNavi へようこそ！</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <h1 style="color: #10b981; margin-top: 0;">🎉 メールアドレスの確認が完了しました！</h1>
        <p>こんにちは、<strong>${username}</strong> さん</p>
        <p>PoleNavi のご登録が完了しました。ようこそ！</p>

        <h2 style="color: #2563eb;">次にできること：</h2>
        <ul style="line-height: 1.8;">
          <li>📍 <strong>電柱を登録</strong> - 近くの電柱を写真付きで登録しよう</li>
          <li>🗺️ <strong>地図で探索</strong> - 登録された電柱を地図で確認</li>
          <li>📸 <strong>写真を追加</strong> - 既存の電柱に写真を追加できます</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${config.frontendUrl}"
             style="display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            PoleNavi を始める
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #999; font-size: 12px;">
          質問や不明点がございましたら、お気軽にお問い合わせください。<br>
          PoleNavi をお楽しみください！
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
🎉 メールアドレスの確認が完了しました！

こんにちは、${username} さん

PoleNavi のご登録が完了しました。ようこそ！

次にできること：
- 📍 電柱を登録 - 近くの電柱を写真付きで登録しよう
- 🗺️ 地図で探索 - 登録された電柱を地図で確認
- 📸 写真を追加 - 既存の電柱に写真を追加できます

${config.frontendUrl}

質問や不明点がございましたら、お気軽にお問い合わせください。
PoleNavi をお楽しみください！
  `;

  await sendEmail({
    to: email,
    subject: '【PoleNavi】ようこそ！登録が完了しました',
    html,
    text,
  });
}
