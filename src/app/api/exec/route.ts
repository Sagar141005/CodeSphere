import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";
import * as esprima from 'esprima';

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { language, code, entry, files, mode } = body;

    if (!language || (!code && (!entry || !files))) {
      return NextResponse.json({ error: "Missing required fields: language, and either code or entry + files" }, { status: 400 });
    }

    console.log(`Executing ${language} code`);

    let output = "";

    // ---------- JavaScript ----------
    if (language === "javascript" || language === "node") {
      try {
        if (mode === 'preview') {
          const dependencies: Record<string, string> = {};
          const visited = new Set<string>();
          let bundle = "";
        
          function extractDependencies(jsCode: string) {
            const deps = new Set<string>();
            try {
              const ast = esprima.parseModule(jsCode, { tolerant: true, jsx: true });
              for (const node of ast.body) {
                if (node.type === 'ImportDeclaration' && typeof node.source?.value === 'string') {
                  const source = node.source.value;
                  if (!source.startsWith('.') && !source.startsWith('/')) {
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
              dependencies[dep] = 'latest';
            }
        
            // Follow relative imports
            const importRegex = /import\s+(?:.+?\s+from\s+)?['"](.+?)['"]/g;
            let match;
            while ((match = importRegex.exec(content))) {
              let imported = match[1];
              if (!imported.startsWith('.') && !imported.startsWith('/')) continue;
              if (!imported.endsWith('.js')) imported += '.js';
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
        

        // Actual runtime eval or sandbox code goes here if needed

      } catch (runtimeErr: any) {
        const msg = runtimeErr.message;

        const isBrowserAPIError = /document|window|HTMLElement|navigator/.test(msg);

        if (isBrowserAPIError) {
          try {
            esprima.parseScript(code);
            return NextResponse.json({ ok: true });
          } catch (syntaxErr: any) {
            return NextResponse.json({ error: "JS Syntax Error: " + syntaxErr.message });
          }
        }

        return NextResponse.json({ error: "JS Runtime Error: " + msg });
      }
    }

    // ---------- Python ----------
    else if (language === "python") {
      try {
        const tempDir = `/tmp/project_${Date.now()}`;
        fs.mkdirSync(tempDir);

        if(files && entry) {
          for(const [ filename, content ] of Object.entries(files as Record<string, string>)) {
            fs.writeFileSync(path.join(tempDir, filename), content);
          }
          const entryPath = path.join(tempDir, entry);
          const { stdout, stderr } = await execAsync(`python3 ${entry}`, { cwd: tempDir });

          output = stdout || stderr || "Program ran successfully!";
        } else {
          const tempFile = path.join(tempDir, `main.py`);
          fs.writeFileSync(tempFile, code);

          const { stdout, stderr } = await execAsync(`python3 ${tempFile}`);
          output = stdout || stderr || "Program ran successfully!";
        }
      } catch (err: any) {
        return NextResponse.json({ error: "Python Error: " + err.message });
      }      
    }

    // ---------- C ----------
    else if (language === "c") {
      try {
        const tempDir = `/tmp/project_c_${Date.now()}`;
        fs.mkdirSync(tempDir);

        if (files && entry) {
          for (const [filename, content] of Object.entries(files)) {
            fs.writeFileSync(path.join(tempDir, filename), content as string);
          }
          const outputFile = path.join(tempDir, 'main.out');
          const sourceFiles = Object.keys(files).filter(f => f.endsWith('.c')).join(' ');
          const { stdout, stderr } = await execAsync(`gcc ${sourceFiles} -o main.out && ./main.out`, { cwd: tempDir });
          output = stdout || stderr || "Program ran successfully!";
        } else {
          const tempFile = path.join(tempDir, `program.c`);
          fs.writeFileSync(tempFile, code);
          const outFile = path.join(tempDir, `program.out`);
          const { stdout, stderr } = await execAsync(`gcc ${tempFile} -o ${outFile} && ${outFile}`);
          output = stdout || stderr || "Program ran successfully!";
        }
      } catch (err: any) {
        return NextResponse.json({ error: "C Error: " + err.message });
      }
    }

    // ---------- C++ ----------
    else if (language === "cpp") {
      try {
        const tempDir = `/tmp/project_cpp_${Date.now()}`;
        fs.mkdirSync(tempDir);

        if (files && entry) {
          for (const [filename, content] of Object.entries(files)) {
            fs.writeFileSync(path.join(tempDir, filename), content as string);
          }
          const outputFile = path.join(tempDir, 'main.out');
          const sourceFiles = Object.keys(files).filter(f => f.endsWith('.cpp')).join(' ');
          const { stdout, stderr } = await execAsync(`g++ ${sourceFiles} -o main.out && ./main.out`, { cwd: tempDir });
          output = stdout || stderr || "Program ran successfully!";
        } else {
          const tempFile = path.join(tempDir, `program.cpp`);
          fs.writeFileSync(tempFile, code);
          const outFile = path.join(tempDir, `program.out`);
          const { stdout, stderr } = await execAsync(`g++ ${tempFile} -o ${outFile} && ${outFile}`);
          output = stdout || stderr || "Program ran successfully!";
        }
      } catch (err: any) {
        return NextResponse.json({ error: "C++ Error: " + err.message });
      }
    }

    // ---------- Java ----------
    else if (language === "java") {
      try {
        const tempDir = `/tmp/project_java_${Date.now()}`;
        fs.mkdirSync(tempDir);

        if (files && entry) {
          for (const [filename, content] of Object.entries(files)) {
            fs.writeFileSync(path.join(tempDir, filename), content as string);
          }

          const { stdout: compileOut, stderr: compileErr } = await execAsync(`javac *.java`, { cwd: tempDir });
          const mainClass = entry.replace(".java", "");
          const { stdout, stderr } = await execAsync(`java -cp . ${mainClass}`, { cwd: tempDir });
          output = stdout || stderr || compileErr || compileOut || "Program ran successfully!";
        } else {
          const className = "Main";
          const javaFile = path.join(tempDir, `${className}.java`);
          fs.writeFileSync(javaFile, code);
          const { stdout, stderr } = await execAsync(`javac ${className}.java && java -cp . ${className}`, { cwd: tempDir });
          output = stdout || stderr || "Program ran successfully!";
        }
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
