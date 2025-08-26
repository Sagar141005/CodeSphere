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
    You are a senior developer and a clear communicator.

    Your task is to explain the following ${
      language || ""
    } code in plain, beginner-friendly language.

    Instructions:
    - Break down what the code does in simple steps
    - Describe key parts (like functions, loops, conditions) clearly and simply
    - Avoid technical jargon unless necessary
    - Keep the tone friendly and conversational
    - Don't use markdown formatting or headings — just write a plain explanation

    Here is the code:

    ${code}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert developer assistant." },
        { role: "user", content: prompt },
      ],
    });

    const explanation = response.choices[0].message.content?.trim() || "";

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("AI explain error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
