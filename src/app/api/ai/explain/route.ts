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
    You are a senior developer and excellent technical writer.
    Your task is to explain the following ${
      language || ""
    } code in clear, beginner-friendly language.
    
    Instructions:
    - Break down the code step by step.
    - Explain what each major part does.
    - Highlight any functions, loops, or logic with plain-language explanations.
    - Mention the overall purpose of the code.
    - If possible, add a real-world analogy or practical use case.
    
    Here is the code to explain:
    
    \`\`\`${language || ""}
    ${code}
    \`\`\`
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
    console.log("AI explain error:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
