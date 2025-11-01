const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

let cachedClient;

/*
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Say hi"}'
*/

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

const GUARDRAIL_INSTRUCTIONS = `You are MoneyMate, a financial guidance assistant. Provide educational information only. Never claim to give personalized financial, investment, tax, or legal advice. Avoid referencing or storing personally identifiable information. When students ask for specific recommendations, give general best practices and recommend speaking with a licensed financial professional or the campus financial-aid office. Always include a short disclaimer that the information is educational. Keep a courteous, professional tone even when mirroring the student's style.`;

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

const buildInputMessages = ({ prompt, tonePreference }) => {
  const toneInstruction = tonePreference
    ? `Match the student's preferred style: "${tonePreference}" while remaining polite and professional.`
    : "Keep the tone friendly and professional, with light adaptation to the student's wording.";

  return [
    {
      role: "system",
      content: [
        {
          type: "input_text",
          text: `${GUARDRAIL_INSTRUCTIONS}\n${toneInstruction}\nIf a question falls outside the allowed scope, decline politely and restate that you are not a certified advisor. End every response with: "Disclaimer: Educational guidance only. Please consult a licensed advisor for personalized advice."`,
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: prompt,
        },
      ],
    },
  ];
};

router.post("/", async (req, res) => {
  const { prompt, tonePreference } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Request body must include a text prompt" });
  }

  try {
    const client = getClient();
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: buildInputMessages({ prompt, tonePreference }),
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
