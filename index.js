import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  try {
    // 1. Enviar mensagem para o agente da ElevenLabs
    const response = await fetch(
      https://api.elevenlabs.io/v1/convai/conversation,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: process.env.ELEVENLABS_AGENT_ID,
          text: text,
        }),
      }
    );

    const data = await response.json();

    if (!data || !data.audio_url) {
      await bot.sendMessage(chatId, "⚠ Não consegui resposta da Aurora.");
      return;
    }

    // 2. Baixar o áudio da ElevenLabs
    const audioResp = await fetch(data.audio_url);
    const audioBuffer = await audioResp.buffer();

    // 3. Salvar em arquivo temporário
    const filePath = "reply.ogg";
    fs.writeFileSync(filePath, audioBuffer);

    // 4. Enviar áudio para o Telegram
    await bot.sendVoice(chatId, filePath);

    // 5. Apagar o arquivo depois de enviar
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Erro ao falar com ElevenLabs:", err);
    await bot.sendMessage(chatId, "⚠ Não consegui falar com a Aurora agora.");
  }
});