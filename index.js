require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Variáveis de ambiente
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

if (!TELEGRAM_TOKEN || !ELEVENLABS_API_KEY || !ELEVENLABS_AGENT_ID) {
  console.error("❌ Variáveis de ambiente faltando!");
  process.exit(1);
}

// Inicia o bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  console.log(📩 Mensagem recebida: ${userMessage});

  try {
    // 1. Envia para o Agente da ElevenLabs
    const response = await fetch(
      https://api.elevenlabs.io/v1/convai/conversation/${ELEVENLABS_AGENT_ID}/message,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: userMessage }),
      }
    );

    const data = await response.json();
    const agentReply = data?.output?.[0]?.content?.[0]?.text || "Não consegui entender.";

    console.log("🤖 Resposta do agente:", agentReply);

    // 2. Converte texto em áudio com TTS da ElevenLabs
    const ttsResponse = await fetch(
      https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID},
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: agentReply,
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
        }),
      }
    );

    const audioBuffer = await ttsResponse.arrayBuffer();

    // 3. Manda áudio pro usuário
    await bot.sendVoice(chatId, Buffer.from(audioBuffer), {}, {
      filename: "resposta.ogg",
      contentType: "audio/ogg",
    });

  } catch (err) {
    console.error("❌ Erro:", err);
    bot.sendMessage(chatId, "⚠ Ocorreu um erro, tente novamente.");
  }
});

// Rota do Express para manter Railway vivo
app.get("/", (req, res) => {
  res.send("🤖 Bot do Telegram + ElevenLabs rodando no Railway!");
});

app.listen(PORT, () => {
  console.log(🚀 Servidor online na porta ${PORT});
});
