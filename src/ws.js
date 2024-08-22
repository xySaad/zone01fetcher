import { Login } from "./login.js";
import WebSocket from "ws";

// Function to handle the WebSocket connection process
async function connectAndSendData(username, password, bot, chatId, command) {
  const notifyTGUsers = (message, link, chatId) => {
    bot.sendMessage(chatId, message);
  };
  // Await Login and get the JWT token
  const jwtToken = await Login(username, password);

  if (!jwtToken.error) {
    const wsUrl = "wss://learn.zone01oujda.ma/api/graphql-engine/v1/graphql";

    // Create a new WebSocket client instance
    const ws = new WebSocket(wsUrl, ["graphql-ws"]);

    // Event listener for when the connection is open
    ws.on("open", () => {
      console.log("Connected to WebSocket server");

      // Send a message to the WebSocket server
      ws.send(
        JSON.stringify({
          type: "connection_init",
          payload: {
            headers: {
              Authorization: jwtToken, // Ensure no extra quotes or characters
              "x-hasura-role": "user",
            },
          },
        })
      );

      ws.send(
        JSON.stringify({
          type: "start",
          id: "nr9dqdxuj5",
          payload: {
            query:
              "query ($version: String!) {\n      result (where: {version: {_eq: $version}} limit: 1) {version \n  \n  id\n  updatedAt\n  createdAt\n  type\n  attrs\n  grade\n  isLast\n  path\n\n}\n    }",
            variables: { version: "4e228d4b-21ed-4004-a410-c585364e193b" },
          },
        })
      );
    });

    // Event listener for receiving messages from the server
    ws.on("message", (message) => {
      // Convert Buffer to string if needed
      const messageStr =
        message instanceof Buffer ? message.toString() : message;

      // Parse message to object
      const parsedMessage = JSON.parse(messageStr);
      const data = parsedMessage?.payload?.data?.result[0];
      const dataType = data?.type;

      if (parsedMessage.type !== "ka") {
        // console.log(messageStr);
      }

      switch (dataType) {
        case "admin_selection":
          const isRefused = data?.attrs?.refused;
          const infos = ` Grade: ${
            data.grade
          }\n isRefused: ${isRefused}\n Result: ${
            data.grade >= 1 && data.isLast ? "Passed" : "unknown result"
          }`;
          if (command == "check") {
            bot.sendMessage(chatId, infos);
          }
          if ((data.grade >= 0 && data.grade != null) || data.isLast == true) {
            notifyTGUsers(
              "Results are out!!! check the website",
              "https://learn.zone01oujda.ma/intra/oujda/onboarding/piscine",
              chatId
            );
          }

          break;

        default:
          break;
      }
    });

    // Event listener for errors
    ws.on("error", (error) => {
      console.error(`WebSocket error: ${error.message}`);
    });

    // Event listener for when the connection is closed
    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  } else {
    console.log("Error while getting jwtToken");
  }
}
export { connectAndSendData };
