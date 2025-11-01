const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

let cachedClient;

const getClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
};

const extractText = (response) => {
  if (response?.output_text) {
    return response.output_text.trim();
  }

  const firstMessage = response?.output?.[0]?.content?.[0];
  if (firstMessage?.text?.value) {
    return firstMessage.text.value.trim();
  }

  return null;
};

router.post("/", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Request body must include a text prompt" });
  }

  try {
    const client = getClient();
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: prompt,
    });

    const answer = extractText(response);

    if (!answer) {
      return res.status(502).json({ error: "OpenAI response did not include any text" });
    }

    res.json({ answer, id: response.id });
  } catch (error) {
    console.error("OpenAI request failed:", error);

    if (error?.status === 401 || error?.status === 403) {
      return res.status(502).json({ error: "OpenAI rejected the request. Check your API key and usage limits." });
    }

    if (error?.message?.includes("Missing OPENAI_API_KEY")) {
      return res.status(500).json({ error: error.message });
    }

    res.status(500).json({ error: "Could not generate a response. Please try again." });
  }
});

module.exports = router;
