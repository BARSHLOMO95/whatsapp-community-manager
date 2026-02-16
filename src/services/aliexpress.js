import crypto from "crypto";
import axios from "axios";
import { config } from "../config/env.js";

const { appKey, appSecret, accessToken } = config.aliexpress;

export function generateSign(params) {
  const sortedKeys = Object.keys(params).sort();
  const signStr =
    appSecret +
    sortedKeys.map((key) => key + params[key]).join("") +
    appSecret;
  return crypto.createHash("md5").update(signStr).digest("hex").toUpperCase();
}

export async function fetchOrders(start, end, page = 1, pageSize = 20) {
  const params = {
    app_key: appKey,
    timestamp: Date.now(),
    method: "aliexpress.affiliate.order.list",
    sign_method: "md5",
    page_no: page,
    page_size: pageSize,
    start_time: start,
    end_time: end,
    access_token: accessToken,
  };
  params.sign = generateSign(params);

  const { data } = await axios.get(
    `https://api-sg.aliexpress.com/openapi/param2/1/aliexpress.affiliate.order.list/${appKey}`,
    { params }
  );
  return data;
}
