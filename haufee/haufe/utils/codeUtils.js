const fs = require("fs");
const path = require("path");

function extractImports(code, language) {
  const imports = [];
  for (const line of code.split("\n")) {
    const es = line.match(/import\s+.*\s+from\s+['"](.*)['"]/);
    if (es) imports.push(es[1]);
    const req = line.match(/require\s*\(\s*['"](.*)['"]\s*\)/);
    if (req) imports.push(req[1]);
    if (language === "python") {
      const py = line.match(/(?:from\s+([\w.]+)|import\s+([\w.]+))/);
      if (py) imports.push(py[1] || py[2]);
    }
  }
  return imports;
}

function resolveImportPath(importPath, currentFile, workspaceFolder) {
  if (!importPath.startsWith(".")) return null;
  const currentDir = path.dirname(currentFile);
  let resolved = path.resolve(currentDir, importPath);
  const extensions = [".js", ".ts", ".jsx", ".tsx", ".py", ""];
  for (const ext of extensions) {
    const withExt = resolved + ext;
    if (fs.existsSync(withExt)) return withExt;
  }
  const indexPath = path.join(resolved, "index.js");
  return fs.existsSync(indexPath) ? indexPath : null;
}

module.exports = { extractImports, resolveImportPath };
