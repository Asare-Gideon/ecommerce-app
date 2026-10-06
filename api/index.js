const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const { connectDB } = require("./config/connectDb");
const router = require("./routes/index");
const { notfound, errorHandler } = require("./middleware/errorHandler");
const cookiePerser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalNetworkOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
    origin
  );

const corsOptions = {
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== "production" && isLocalNetworkOrigin(origin))
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(cookiePerser());
app.get("/health", (_req, res) => {
  res.json({ service: "ecommerce-api", status: "ok" });
});
app.use("/reports", express.static(path.join(__dirname, "public", "reports")));
app.use("/api/v1", router);
app.use(notfound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB(process.env.MONGOOSE_URL);

  app.listen(PORT, () => {
    console.log(`app listining on port ${PORT}.....`);
  });
};

startServer().catch(() => {
  process.exit(1);
});
