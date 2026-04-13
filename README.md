# 🟢 Kick Live Notifier

**Kickで登録した配信者がライブを開始したら、すぐにデスクトップ通知でお知らせするChrome拡張機能です。**

![Chrome](https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)

---

## ✨ 機能

- 🔔 配信者がライブを開始すると**デスクトップ通知**が届く
- ⚡ **10秒ごと**に自動でライブ状態を確認
- 👥 複数の配信者を登録可能
- 🖱️ 通知をクリックするとKickのチャンネルが直接開く
- 💾 登録した配信者はブラウザに保存される（再起動しても消えない）
- 🔒 認証不要・外部サーバー不要（Kickの公開APIのみ使用）

---

## 📦 インストール方法

### リポジトリからインストール

1. **リポジトリをクローンまたはZIPでダウンロード**

   ```bash
   git clone https://github.com/YOUR_USERNAME/kick-live-notifier.git
   ```

   またはページ右上の `Code → Download ZIP` からダウンロードして解凍。

2. **Chromeでデベロッパーモードを有効にする**

   アドレスバーに `chrome://extensions/` と入力して開き、右上の **「デベロッパーモード」** をオンにする。

3. **拡張機能を読み込む**

   「**パッケージ化されていない拡張機能を読み込む**」をクリックし、ダウンロードしたフォルダ（`kick-live-notifier`）を選択する。

4. **完了！**

   ツールバーに **K** アイコンが表示されればインストール成功です。

---

## 🚀 使い方

### 配信者を追加する

1. ツールバーの **K** アイコンをクリックしてポップアップを開く
2. 入力欄にKickのユーザー名を入力（例: `xqc`）
3. 「**追加**」ボタンをクリック（またはEnterキー）

### 通知を受け取る

- 登録した配信者がライブを開始すると、自動でデスクトップ通知が届きます
- 通知をクリックするとそのままKickのチャンネルが開きます
- ポップアップ画面でいつでもライブ状態を確認できます

### 配信者を削除する

- ポップアップで削除したい配信者の右にある **✕** ボタンをクリック

### 今すぐ確認する

- ポップアップ右上の **「↻ 今すぐ確認」** ボタンで即時チェック

---

## 🔔 通知音について

Chromeの通知はOSの標準通知音が鳴ります。音が鳴らない場合はOS側の通知設定を確認してください。

- **Windows:** 設定 → システム → 通知 → Google Chrome → 「音を鳴らす」をオン
- **Mac:** システム設定 → 通知 → Google Chrome → 「サウンドを再生」をオン

---

## 🛠️ 技術仕様

| 項目 | 内容 |
|------|------|
| Manifest | V3 |
| 対応ブラウザ | Chrome / Edge |
| チェック間隔 | 10秒 |
| 使用API | `https://kick.com/api/v1/channels/{username}` |
| 必要なパーミッション | `notifications`, `storage` |
| 外部通信先 | `kick.com` のみ |

---

## 📁 ファイル構成

```
kick-live-notifier/
├── manifest.json        # 拡張機能の設定ファイル
├── background.js        # バックグラウンドでライブ状態を監視
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── popup/
    ├── popup.html       # ポップアップUI
    └── popup.js         # ポップアップのロジック
```

---

## ⚠️ 注意事項

- Kickの**公開API**を使用しているため、APIの仕様変更により動作しなくなる場合があります
- ブラウザが起動していない場合は通知が届きません
- Kickアカウントへのログインは不要です

---

## 🤝 コントリビュート

バグ報告・機能リクエストは [Issues](https://github.com/YOUR_USERNAME/kick-live-notifier/issues) へお気軽にどうぞ。

---

## 📄 ライセンス

[MIT License](LICENSE)
