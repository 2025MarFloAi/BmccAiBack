import 'dotenv/config';
import OpenAI from "openai";
const apiKey = process.env.OPENAI_KEY;
const client = new OpenAI({apiKey: apiKey});

const response = await client.responses.create({
    model: "gpt-5",
    input: "Write a one-sentence bedtime story about a unicorn."
});

console.log(response.output_text);