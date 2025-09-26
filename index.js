import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// ElevenLabs API
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  console.log(👩‍💻 Mensagem recebida: ${userMessage});

  try {
    // Envia mensagem ao agente da ElevenLabs
    const response = await fetch(
      https://api.elevenlabs.io/v1/convai/conversation/${ELEVENLABS_AGENT_ID}/message,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "user",
          content: [{ type: "input_text", text: userMessage }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(Erro ElevenLabs: ${response.status});
    }

    const data = await response.json();
    const reply = data.output[0]?.content[0]?.text || "Não consegui entender.";

    console.log(🤖 Resposta do Agente: ${reply});

    // Responde no Telegram
    await bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error("❌ Erro:", error);
    await bot.sendMessage(chatId, "Ocorreu um erro ao falar com a IA.");
  }
});

console.log("🚀 Bot Telegram conectado...");
