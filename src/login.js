const base64Encode = (str) => {
  return Buffer.from(str).toString("base64");
};

function generateAuthHeader(username, password) {
  // Combine username and password with a colon
  const credentials = `${username}:${password}`;

  // Encode the credentials in Base64 using Node.js Buffer
  const base64Credentials = base64Encode(credentials);

  // Return the Authorization header
  return `Basic ${base64Credentials}`;
}

const Login = async (username, password) => {
  const res = await fetch("https://learn.zone01oujda.ma/api/auth/signin?", {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      Authorization: generateAuthHeader(username, password),
      priority: "u=1, i",
      "sec-ch-ua":
        '"Not)A;Brand";v="99", "Microsoft Edge";v="127", "Chromium";v="127"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      Referer: "https://learn.zone01oujda.ma/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "POST",
  });

  // const text = await res.text();
  const json = await res.json();
  const text = JSON.stringify(json);

  if (json.error) {
    return json;
  }
  // Trim any extra quotes or whitespace
  return `Bearer ${text.trim().replace(/"/g, "")}`;
};

export { Login };
