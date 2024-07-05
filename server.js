const WebSocket = require("ws");
const axios = require("axios");
const cron = require("node-cron");
import creds from "./creds.json";

const WS_URL = "wss://learn.zone01oujda.ma/api/graphql-engine/v1/graphql";
const TELEGRAM_API_URL = "https://api.telegram.org/bot";
const TELEGRAM_BOT_TOKEN = creds.TELEGRAM_BOT_TOKEN;
const CHAT_ID = creds.CHAT_ID;

function connectWebSocket() {
  const ws = new WebSocket(WS_URL, {
    headers: {
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "sec-websocket-extensions": "permessage-deflate; client_max_window_bits",
      "sec-websocket-key": "YbXf1hZGg/rSeWRI778/Mg==",
      "sec-websocket-protocol": "graphql-ws",
      "sec-websocket-version": "13",
    },
  });

  ws.on("open", () => {
    console.log("WebSocket connection opened");
  });

  ws.on("message", (data) => {
    const message = JSON.parse(data);
    if (message.type === "data" && message.payload.data.registration) {
      const registration = message.payload.data.registration[0];
      const capacity = registration.attrs.capacity;
      const placesLeft =
        capacity - registration.users_aggregate.aggregate.count;
      const startAt = new Date(registration.startAt).toLocaleString();
      const endAt = new Date(registration.endAt).toLocaleString();

      const telegramMessage = `Event found!\nStart: ${startAt}\nEnd: ${endAt}\nCapacity: ${capacity}\nPlaces left: ${placesLeft}`;
      sendTelegramMessage(telegramMessage);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed. Reconnecting...");
    setTimeout(connectWebSocket, 5000);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    ws.close();
  });
}

async function sendTelegramMessage(message) {
  try {
    await axios.post(`${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
    });
    console.log("Telegram message sent successfully");
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}

cron.schedule("0 */2 * * *", () => {
  console.log("Reconnecting WebSocket...");
  connectWebSocket();
});

connectWebSocket();

module.exports = (req, res) => {
  res.status(200).send("Server is running");
};
