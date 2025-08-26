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
    You are a senior software engineer tasked with reviewing and improving code quality.
    
    Refactor the following ${language || ""} code with these goals:
    - Improve readability and maintainability
    - Optimize performance (without altering behavior)
    - Simplify logic and remove any unnecessary repetition
    - Follow clean code principles and idiomatic ${language || "style"}
    
    Please keep the original code structure intact as much as possible.
    Do NOT create new helper functions or abstractions.
    Add brief comments ONLY if absolutely necessary to clarify complex sections.
    Avoid over-commenting.
    
    Output only the refactored code, without any markdown formatting or explanations.
    
    Here is the code:
    
    ${code}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert software engineer." },
        { role: "user", content: prompt },
      ],
    });

    const result = response.choices[0].message.content?.trim() || "";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI refactor error:", error);
    return NextResponse.json(
      { error: "Failed to refactor code" },
      { status: 500 }
    );
  }
}
