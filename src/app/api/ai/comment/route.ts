import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Missing code to explain" },
        { status: 400 }
      );
    }

    const prompt = `
    You are a senior developer known for writing clean, professional, and minimal code comments.

    Your task:
    - Add comments **only above non-trivial logic**, control flow, or complex functions
    - Do **not** comment on simple operations (like return statements, variable assignments, or logging)
    - Avoid stating what the code obviously does — only add comments when it improves clarity
    - Use proper ${language || "language-specific"} comment syntax
    - Keep the code unchanged — just insert helpful comments **above relevant lines**
    - Write in clear, concise plain English

    Output only the code — no explanations, no markdown formatting, no extra wrapping.

    Here is the code:

    ${code}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional senior developer who writes clean and minimal comments only where necessary.",
        },
        { role: "user", content: prompt },
      ],
    });

    const result = response.choices[0].message.content?.trim() || "";

    return NextResponse.json({ result });
  } catch (error) {
    console.log("AI commenr error:", error);
    return NextResponse.json(
      { error: "Failed to generate comments" },
      { status: 500 }
    );
  }
}
