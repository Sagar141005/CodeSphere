import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const { language, code } = await req.json();

    if (!language || !code) {
      return NextResponse.json({ error: "Missing language or code" }, { status: 400 });
    }

    console.log(`Executing ${language} code`);

    let output = "";

    // ---------- JavaScript ----------
    if (language === "javascript" || language === "node") {
      try {
        let consoleOutput = "";
        const originalLog = console.log;
        console.log = (msg) => { consoleOutput += msg + "\n"; };

        eval(code);

        console.log = originalLog;
        output = consoleOutput || "Program ran successfully!";
      } catch (err: any) {
        return NextResponse.json({ error: "JS Error: " + err.message });
      }      
    }

    // ---------- Python ----------
    else if (language === "python") {
      try {
        const tempFile = path.join("/tmp", `program_${Date.now()}.py`);
        fs.writeFileSync(tempFile, code);

        const { stdout, stderr } = await execAsync(`python3 ${tempFile}`);
        output = stdout || stderr || "Program ran successfully!";
      } catch (err: any) {
        return NextResponse.json({ error: "Python Error: " + err.message });
      }      
    }

    // ---------- C ----------
    else if (language === "c") {
      try {
        const tempFile = path.join("/tmp", `program_${Date.now()}.c`);
        const outFile = path.join("/tmp", `program_${Date.now()}`);
        fs.writeFileSync(tempFile, code);

        const { stdout, stderr } = await execAsync(`gcc ${tempFile} -o ${outFile} && ${outFile}`);
        output = stdout || stderr || "Program ran successfully!";
      } catch (err: any) {
        return NextResponse.json({ error: "C Error: " + err.message });
      }      
    }

    // ---------- C++ ----------
    else if (language === "cpp") {
      try {
        const tempFile = path.join("/tmp", `program_${Date.now()}.cpp`);
        const outFile = path.join("/tmp", `program_${Date.now()}`);
        fs.writeFileSync(tempFile, code);

        const { stdout, stderr } = await execAsync(`g++ ${tempFile} -o ${outFile} && ${outFile}`);
        output = stdout || stderr || "Program ran successfully!";
      } catch (err: any) {
        return NextResponse.json({ error: "C++ Error: " + err.message });
      }      
    }

    // ---------- Java ----------
    else if (language === "java") {
      try {
        const className = "Main"; // Enforce a fixed class name for simplicity
        const javaFile = path.join("/tmp", `${className}.java`);
        fs.writeFileSync(javaFile, code);

        const { stdout, stderr } = await execAsync(`javac ${javaFile} && java -cp /tmp ${className}`);
        output = stdout || stderr || "Program ran successfully!";
      } catch (err: any) {
        return NextResponse.json({ error: "Java Error: " + err.message });
      }      
    }

    else {
      return NextResponse.json(
        { error: `Language "${language}" not supported yet.` },
        { status: 400 }
      );
    }
        
    return NextResponse.json({ output });
  } catch (err: any) {
    console.error("Execution error:", err);
    return NextResponse.json({ error: err.message || "Execution failed" }, { status: 500 });
  }
}
