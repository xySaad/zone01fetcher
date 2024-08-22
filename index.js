import { loadCredentials, startBot } from "./src/bot.js";
import { connectAndSendData } from "./src/ws.js";

const bot = startBot();

const creds = loadCredentials();
Object.keys(creds).forEach((key) => {
  const user = creds[key];
  // Repeat the connection process every hour (3600 seconds or 3.6 million milliseconds)
  setInterval(async () => {
    if (ws.readyState === WebSocket.OPEN) {
      await ws.close();
      console.log("WebSocket connection closed after 1 hour");
    }
    connectAndSendData(user.username, user.password, bot);
  }, 3600000); // 1 hour in milliseconds

  connectAndSendData(user.username, user.password, bot);
});
