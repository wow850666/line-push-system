// 📦 安裝依賴：請先執行 `npm install express axios body-parser`

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

// ✅ 從環境變數讀取 Channel Access Token 與 Secret
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.CHANNEL_SECRET;

// 📥 接收 Webhook（之後可拓展記錄 userId）
app.post('/webhook', bodyParser.json(), (req, res) => {
  const events = req.body.events;
  events.forEach((event) => {
    if (event.type === 'message') {
      const userId = event.source.userId;
      console.log('收到訊息的 userId：', userId);
    }
  });
  res.sendStatus(200);
});

// ✉️ 提供一個簡單前端讓你輸入 userId 與訊息
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.send(`
    <form method="POST" action="/send">
      <label>User ID：</label><br>
      <input name="userId" style="width: 300px"><br>
      <label>訊息內容：</label><br>
      <textarea name="message" style="width: 300px; height: 100px"></textarea><br>
      <button type="submit">發送訊息</button>
    </form>
  `);
});

// 📤 發送訊息的 POST API
app.post('/send', async (req, res) => {
  const { userId, message } = req.body;

  try {
    await axios.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to: userId,
        messages: [{ type: 'text', text: message }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );
    res.send('訊息已發送');
  } catch (error) {
    console.error('發送失敗:', error.response?.data || error.message);
    res.send('發送失敗，請檢查 userId 或金鑰');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
