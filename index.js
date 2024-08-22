import { loadCredentials, startBot } from "./src/bot.js";
import { connectAndSendData } from "./src/ws.js";

const bot = startBot();
const creds = loadCredentials();

// Store WebSocket instances per user
const webSockets = {};

// Process each user
Object.keys(creds).forEach((key) => {
  const user = creds[key];

  // Define a function to manage the connection and reconnection
  const manageConnection = async () => {
    // Close the existing WebSocket if open
    if (
      webSockets[user.username] &&
      webSockets[user.username].readyState === WebSocket.OPEN
    ) {
      webSockets[user.username].close();
      console.log(`WebSocket connection for ${user.username} closed.`);
    }

    // Create a new WebSocket connection for the user
    webSockets[user.username] = await connectAndSendData(
      user.username,
      user.password,
      bot
    );
  };

  // Initial connection
  manageConnection();

  // Set interval to reconnect every hour (3600000 milliseconds)
  setInterval(manageConnection, 3600000); // 1 hour in milliseconds
});
