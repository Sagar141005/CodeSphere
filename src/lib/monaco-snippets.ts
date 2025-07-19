import * as monaco from "monaco-editor";

/**
 * Helper: Create snippet suggestion
 */
const createSnippet = (
  label: string,
  insertText: string,
  documentation: string
): Omit<monaco.languages.CompletionItem, "range"> => ({
  label,
  kind: monaco.languages.CompletionItemKind.Snippet,
  insertText,
  insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  documentation,
});

/**
 * Register snippets for a language
 */
const registerSnippets = (language: string, snippets: ReturnType<typeof createSnippet>[]) => {
  monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      return {
        suggestions: snippets.map(snippet => ({ ...snippet, range })),
      };
    },
  });
};

/**
 * Register all snippets
 */
function registerAllSnippets() {
  // JavaScript & TypeScript
  const jsSnippets = [
    createSnippet("for loop", "for (let i = 0; i < ${1:array}.length; i++) {\n\t$0\n}", "For loop"),
    createSnippet("console.log", "console.log(${1:msg});", "Log to console"),
    createSnippet("function", "function ${1:name}(${2:params}) {\n\t$0\n}", "Function template"),
  ];
  registerSnippets("javascript", jsSnippets);
  registerSnippets("typescript", jsSnippets);

  // Python
  const pySnippets = [
    createSnippet("def", "def ${1:func_name}(${2:params}):\n\t$0", "Define a function"),
    createSnippet("for", "for ${1:i} in range(${2:10}):\n\t$0", "For loop"),
    createSnippet("print", "print(${1:msg})", "Print statement"),
    createSnippet("class", "class ${1:ClassName}:\n\tdef __init__(self, ${2:args}):\n\t\t$0", "Class template"),
  ];
  registerSnippets("python", pySnippets);

  // C++
  const cppSnippets = [
    createSnippet("main", "#include <iostream>\nusing namespace std;\n\nint main() {\n\t$0\n\treturn 0;\n}", "C++ main function"),
    createSnippet("for", "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}", "For loop"),
    createSnippet("cout", "cout << ${1:msg} << endl;", "C++ cout"),
  ];
  registerSnippets("cpp", cppSnippets);

  // C
  const cSnippets = [
    createSnippet("main", "#include <stdio.h>\n\nint main() {\n\t$0\n\treturn 0;\n}", "C main function"),
    createSnippet("printf", "printf(\"${1:msg}\\n\");", "Print statement"),
  ];
  registerSnippets("c", cSnippets);

  // Java
  const javaSnippets = [
    createSnippet("main", "public class ${1:ClassName} {\n\tpublic static void main(String[] args) {\n\t\t$0\n\t}\n}", "Java main class"),
    createSnippet("sysout", "System.out.println(${1:msg});", "System.out.println"),
  ];
  registerSnippets("java", javaSnippets);

  // HTML
  const htmlSnippets = [
    createSnippet("html5", "<!DOCTYPE html>\n<html>\n<head>\n\t<title>${1:Title}</title>\n</head>\n<body>\n\t$0\n</body>\n</html>", "HTML5 template"),
    createSnippet("div", "<div>$0</div>", "Div element"),
  ];
  registerSnippets("html", htmlSnippets);

  // CSS
  const cssSnippets = [
    createSnippet("class", ".${1:className} {\n\t$0\n}", "CSS class"),
    createSnippet("id", "#${1:idName} {\n\t$0\n}", "CSS ID selector"),
  ];
  registerSnippets("css", cssSnippets);
}

/**
 * Initialize Monaco
 */
export const initMonaco = () => {
  // Ensure languages are registered
  ["python", "cpp", "c", "java", "html", "css"].forEach((lang) => {
    if (!monaco.languages.getLanguages().some((l) => l.id === lang)) {
      monaco.languages.register({ id: lang });
    }
  });

  // Register snippets
  registerAllSnippets();
};
