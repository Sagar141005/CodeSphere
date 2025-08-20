import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import util from "util";
import os from "os";
import * as esprima from "esprima";
import {
  checkJavaScript,
  checkPython,
  checkCOrCpp,
  checkJava,
} from "@/lib/codeCheckers";

const exec = util.promisify(require("child_process").exec);

async function runCodeInDocker(
  language: string,
  files: Record<string, string> | undefined,
  entry: string | undefined,
  code: string | undefined
) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "codesandbox-"));

  try {
    if (files && entry) {
      for (const [filename, content] of Object.entries(files)) {
        fs.writeFileSync(path.join(tempDir, filename), content);
      }
    } else if (code) {
      let filename = "";
      switch (language) {
        case "python":
          filename = "main.py";
          break;
        case "c":
          filename = "program.c";
          break;
        case "cpp":
          filename = "program.cpp";
          break;
        case "java":
          filename = "Main.java";
          break;
        case "node":
        case "javascript":
          filename = "main.js";
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }
      fs.writeFileSync(path.join(tempDir, filename), code);
      entry = filename;
    }

    type SupportedLanguage =
      | "python"
      | "node"
      | "javascript"
      | "c"
      | "cpp"
      | "java";

    const images: Record<SupportedLanguage, string> = {
      python: "codesphere/python:latest",
      node: "codesphere/node:latest",
      javascript: "codesphere/node:latest",
      c: "codesphere/cgcc:latest",
      cpp: "codesphere/cgcc:latest",
      java: "codesphere/java:latest",
    };

    const image = images[language as SupportedLanguage];

    const entryFile = entry!;
    let dockerCmd = "";

    switch (language) {
      case "python":
        dockerCmd = `python3 ${entryFile}`;
        break;
      case "node":
      case "javascript":
        dockerCmd = `node ${entryFile}`;
        break;
      case "c":
        dockerCmd = `bash -c "gcc *.c -o program.out && ./program.out"`;
        break;
      case "cpp":
        dockerCmd = `bash -c "g++ *.cpp -o program.out && ./program.out"`;
        break;
      case "java":
        {
          const mainClass = entryFile.replace(/\.java$/, "");
          dockerCmd = `bash -c "javac *.java && java ${mainClass}"`;
        }
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    const fullCmd = `docker run --rm --network none --memory=256m --cpus=".5" -v ${tempDir}:/code -w /code ${image} ${dockerCmd}`;

    let stdout = "",
      stderr = "";

    try {
      const result = await exec(fullCmd, { timeout: 5000 });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (err: any) {
      if (err.killed) {
        return { stdout: "", stderr: "Execution timed out after 5 seconds." };
      } else {
        stderr = err.stderr || "Unknown execution error.";
      }
    }

    return { stdout, stderr };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { language, code, entry, files, mode } = body;

    if (!language || (!code && (!entry || !files))) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const codeToCheck = code || (entry && files?.[entry]) || "";

    let checkResult;

    switch (language) {
      case "javascript":
      case "node":
        checkResult = checkJavaScript(codeToCheck);
        break;
      case "python":
        checkResult = checkPython(codeToCheck);
        break;
      case "c":
      case "cpp":
        checkResult = checkCOrCpp(codeToCheck);
        break;
      case "java":
        checkResult = checkJava(codeToCheck);
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

    if (
      (language === "javascript" || language === "node") &&
      mode === "preview"
    ) {
      const dependencies: Record<string, string> = {};
      const visited = new Set<string>();
      let bundle = "";

      function extractDependencies(jsCode: string) {
        const deps = new Set<string>();
        try {
          const ast = esprima.parseModule(jsCode, {
            tolerant: true,
            jsx: true,
          });
          for (const node of ast.body) {
            if (
              node.type === "ImportDeclaration" &&
              typeof node.source?.value === "string"
            ) {
              const source = node.source.value;
              if (!source.startsWith(".") && !source.startsWith("/")) {
                deps.add(source);
              }
            }
          }
        } catch (err) {
          console.warn("Dependency parsing error:", err);
        }
        return Array.from(deps);
      }

      function resolve(fileName: string) {
        if (!files[fileName] || visited.has(fileName)) return;
        visited.add(fileName);

        const content = files[fileName];
        const deps = extractDependencies(content);

        for (const dep of deps) {
          dependencies[dep] = "latest";
        }

        const importRegex = /import\s+(?:.+?\s+from\s+)?['"](.+?)['"]/g;
        let match;
        while ((match = importRegex.exec(content))) {
          let imported = match[1];
          if (!imported.startsWith(".") && !imported.startsWith("/")) continue;
          if (!imported.endsWith(".js")) imported += ".js";
          resolve(imported);
        }

        bundle += `\n// FILE: ${fileName}\n${content}\n`;
      }

      if (files && entry && files[entry]) {
        resolve(entry);
      }

      const packageJson = {
        name: "live-preview-project",
        version: "1.0.0",
        dependencies,
      };

      return NextResponse.json({
        output: "Dependency analysis completed in preview mode.",
        packageJson,
      });
    }

    const result = await runCodeInDocker(language, files, entry, code);

    return NextResponse.json({
      stdout: result.stdout || "",
      stderr: result.stderr || "",
    });
  } catch (err: any) {
    console.error("Execution error:", err);
    return NextResponse.json(
      { error: err.message || "Execution failed" },
      { status: 500 }
    );
  }
}
