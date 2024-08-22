import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectAndSendData } from "./ws.js";
import { Login } from "./login.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the JSON file
const credsPath = path.join(__dirname, "../creds.json");

// Load JSON content
const creds = JSON.parse(fs.readFileSync(credsPath, "utf8"));

// Path to the JSON file where credentials will be stored
const credentialsFile = path.join(__dirname, "userCredentials.json");

// Load existing credentials from file
export const loadCredentials = () => {
  if (fs.existsSync(credentialsFile)) {
    return JSON.parse(fs.readFileSync(credentialsFile));
  }
  return {};
};

// Save credentials to file
const saveCredentials = (credentials) => {
  fs.writeFileSync(credentialsFile, JSON.stringify(credentials, null, 2));
};
const credentials = loadCredentials();

// State to track user input
const userState = {}; // Format: { chatId: { state: 'awaitingUsername' | 'awaitingPassword', username: 'username' } }

// Function to initialize and start the bot
const startBot = () => {
  // Replace with your bot token
  const token = creds.TELEGRAM_BOT_TOKEN;

  // Create a new Telegram bot instance
  const bot = new TelegramBot(token, { polling: true });

  // Handle /register command
  bot.onText(/\/register/, (msg) => {
    const chatId = msg.chat.id;
    userState[chatId] = { state: "awaitingUsername" };
    bot.sendMessage(chatId, "Please send your username.");
  });

  // Handle /help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "/register - Login with your intra account \n/help - show help menu\n/check - check your results"
    );
  });

  // Handle /check command
  bot.onText(/\/check/, async (msg) => {
    const chatId = msg.chat.id;
    const userCredentials = credentials[chatId];

    if (!userCredentials) {
      bot.sendMessage(chatId, "No credentials found. Please /register first.");
      return;
    }

    try {
      connectAndSendData(userCredentials, bot, chatId, "check");
    } catch (error) {
      bot.sendMessage(chatId, "An error occurred while checking results.");
      console.error(error);
    }
  });

  // Handle incoming messages
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Check if the message is not a command
    if (text && !text.startsWith("/")) {
      // Check user state
      if (userState[chatId]) {
        if (userState[chatId].state === "awaitingUsername") {
          userState[chatId].username = text;
          userState[chatId].state = "awaitingPassword";
          bot.sendMessage(
            chatId,
            "Username received. Please send your password."
          );
        } else if (userState[chatId].state === "awaitingPassword") {
          const username = userState[chatId].username;
          const password = text;

          try {
            const jwtToken = await Login(username, password);

            if (!jwtToken.error) {
              // Save credentials with chat ID
              credentials[chatId] = { username, password };
              saveCredentials(credentials);

              bot.sendMessage(chatId, "Credentials are valid and saved.");
            } else {
              bot.sendMessage(chatId, "Invalid credentials.");
            }
          } catch (error) {
            bot.sendMessage(
              chatId,
              "An error occurred while validating credentials."
            );
            console.error(error);
          }

          // Reset user state
          delete userState[chatId];
        }
      } else if (loadCredentials()[chatId]) {
        bot.sendMessage(chatId, "type /help for the menu");
      } else {
        bot.sendMessage(
          chatId,
          "Please use the /register command to start the registration process."
        );
      }
    }
  });

  return bot;
};

// Export the startBot function
export { startBot };
