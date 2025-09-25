import OpenAI from "openai";

import { coach_prompt } from "@/constants/prompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { exerciseName } = await request.json();

  if (!exerciseName) {
    return new Response("Exercise name is required", { status: 404 });
  }

  const prompt = coach_prompt.replace("{:exercise_name}", exerciseName);

  console.log(prompt, "prompt");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    // console.log(response, "response");
    return Response.json({ message: response.choices[0].message.content });
  } catch (e) {
    console.error("Error fetching AI guidance:", e);
    return new Response("Error fetching AI guidance", { status: 500 });
  }
}
