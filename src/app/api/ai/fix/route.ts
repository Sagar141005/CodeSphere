import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  checkJavaScript,
  checkPython,
  checkCOrCpp,
  checkJava,
} from "@/lib/codeCheckers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { code, language, error } = await req.json();

    if (!code || !error) {
      return NextResponse.json(
        { error: "Missing code to explain or error" },
        { status: 400 }
      );
    }

    let checkResult;

    switch (language) {
      case "javascript":
      case "node":
        checkResult = checkJavaScript(code);
        break;
      case "python":
        checkResult = checkPython(code);
        break;
      case "c":
      case "cpp":
        checkResult = checkCOrCpp(code);
        break;
      case "java":
        checkResult = checkJava(code);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported language: ${language}` },
          { status: 400 }
        );
    }

    if (!checkResult.ok) {
      return NextResponse.json(
        { error: "Code validation failed", issues: checkResult.issues },
        { status: 400 }
      );
    }

    // Now use checkResult as validation in your prompt
    const prompt = `
    You are an experienced ${language || ""} developer and debugging assistant.

    The following code was executed in a sandboxed Docker environment with these constraints:
    ${JSON.stringify(checkResult.issues?.join("\n") || "None", null, 2)}

    The code produced this runtime error:
    ${error}

    Please carefully read the code and the error message before making any changes.

    Your task:
    - Identify and fix the issue causing the error
    - Preserve the original code’s intent and structure as much as possible
    - Make only the minimal necessary changes to fix the error

    Instructions:
    - Return only the fixed code as plain text (no explanations, comments, or markdown formatting)
    - Use correct syntax and style for ${language || "the language"}

    Here is the code:

    ${code}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const result = response.choices[0].message.content?.trim() || "";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI commenr error:", error);
    return NextResponse.json(
      { error: "Failed to generate comments" },
      { status: 500 }
    );
  }
}
