import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/whatsapp-community",

  aliexpress: {
    appKey: process.env.ALIEXPRESS_APP_KEY,
    appSecret: process.env.ALIEXPRESS_APP_SECRET,
    accessToken: process.env.ALIEXPRESS_ACCESS_TOKEN,
  },

  greenApi: {
    url: process.env.GREEN_API_URL || "https://api.greenapi.com",
    instanceId: process.env.GREEN_API_INSTANCE_ID,
    token: process.env.GREEN_API_TOKEN,
  },
};
