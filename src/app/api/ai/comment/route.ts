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
    You are a senior developer known for writing clean, minimal, and beginner-friendly code comments.
    
    Your task:
    - Add comments **only** above non-trivial logic, control flow, and function declarations
    - Avoid commenting on obvious lines like simple variable assignments or straightforward DOM operations
    - Use proper ${language || "language-specific"} comment syntax
    - Keep the original code unchanged — only insert comments **above relevant lines**
    - Write comments in plain English, concise, and clear
    
    Output only the refactored code, without any markdown formatting or explanations.
    
    Here is the code:
    
    \`\`\`${language || ""}
    ${code}
    \`\`\`
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a senior developer who writes great comments.",
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
