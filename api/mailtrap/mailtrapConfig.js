require("dotenv").config();
const { MailtrapClient } = require("mailtrap");

const mailtrapInstance = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

if (!process.env.MAILTRAP_TOKEN) {
  console.error("MAILTRAP_TOKEN is missing in environment variables!");
  process.exit(1);
}

const sender = {
  email: "hello@demomailtrap.com",
  name: "Ecommerce Test",
};

module.exports = { mailtrapInstance, sender };
