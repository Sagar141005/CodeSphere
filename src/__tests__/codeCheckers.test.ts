import {
  checkJavaScript,
  checkPython,
  checkCOrCpp,
  checkJava,
} from "@/lib/codeCheckers";

describe("Static Code Checkers", () => {
  // JavaScript
  it("should pass safe JavaScript", () => {
    const code = `const x = 5;\nconsole.log(x);`;
    const result = checkJavaScript(code);
    expect(result.ok).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it("should detect dangerous JavaScript", () => {
    const code = `const fs = require('fs');\neval("alert('hi')");`;
    const result = checkJavaScript(code);
    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining("fs"),
        expect.stringContaining("eval"),
      ])
    );
  });

  // Python
  it("should pass safe Python", () => {
    const code = `print("Hello")`;
    const result = checkPython(code);
    expect(result.ok).toBe(true);
  });

  it("should detect dangerous Python", () => {
    const code = `import os\nos.system("rm -rf /")`;
    const result = checkPython(code);
    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([expect.stringContaining("import os")])
    );
  });

  // C
  it("should pass safe C", () => {
    const code = `
      #include <stdio.h>
      int main() {
        printf("Hello");
        return 0;
      }`;
    const result = checkCOrCpp(code);
    expect(result.ok).toBe(true);
  });

  it("should detect dangerous C", () => {
    const code = `
      #include <unistd.h>
      int main() {
        system("ls");
        return 0;
      }`;
    const result = checkCOrCpp(code);
    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining("unistd.h"),
        expect.stringContaining("system("),
      ])
    );
  });

  // Java
  it("should pass safe Java", () => {
    const code = `
      public class Main {
        public static void main(String[] args) {
          System.out.println("Hello");
        }
      }`;
    const result = checkJava(code);
    expect(result.ok).toBe(true);
  });

  it("should detect dangerous Java", () => {
    const code = `
      import java.io.File;
      public class Main {
        public static void main(String[] args) {
          Runtime.getRuntime().exec("ls");
        }
      }`;
    const result = checkJava(code);
    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining("java.io"),
        expect.stringContaining("Runtime.getRuntime"),
      ])
    );
  });
});
