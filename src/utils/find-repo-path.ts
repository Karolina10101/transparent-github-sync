import path from "path";
import fs from "fs";

const findRepoPath = (vaultPath: string) => {
  let currentPath = vaultPath;

  while (true) {
    const gitPath = path.join(currentPath, ".git");

    if (fs.existsSync(gitPath)) {
      return currentPath;
    }

    const parentPath = path.dirname(currentPath);

    if (parentPath === currentPath) {
      return null;
    }

    currentPath = parentPath;
  }
};

export default findRepoPath;
