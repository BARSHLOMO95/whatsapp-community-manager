import axios from "axios";
import { config } from "../config/env.js";
import { formatProductMessage } from "./messageFormatter.js";

class GreenApiService {
  constructor() {
    const { url, instanceId, token } = config.greenApi;
    this.baseUrl = `${url}/waInstance${instanceId}`;
    this.token = token;
  }

  _endpoint(method) {
    return `${this.baseUrl}/${method}/${this.token}`;
  }

  async sendProductMessage(chatId, product, options = {}) {
    const caption = formatProductMessage(product, options);
    const url = this._endpoint("sendFileByUrl");

    const payload = {
      chatId,
      urlFile: product.imageUrl,
      fileName: `${product.name}.jpg`,
      caption,
    };

    const { data } = await axios.post(url, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  }

  async sendTextMessage(chatId, message) {
    const url = this._endpoint("sendMessage");
    const { data } = await axios.post(
      url,
      { chatId, message },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  }

  async getGroupData(chatId) {
    const url = this._endpoint("getGroupData");
    const { data } = await axios.post(
      url,
      { groupId: chatId },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  }
}

export const greenApiService = new GreenApiService();
