import path from "path";

type TreeNode = {
  name: string;
  path: string;
  type: "folder" | "file";
  children?: TreeNode[];
  status?: "deleted" | "modified" | "new" | "conflict";
};

const status = (statusChar: string) => {
  if (statusChar === "?") return "new";
  if (statusChar === "D") return "deleted";
  if (statusChar === "U") return "conflict";
  else return "modified";
};

const sortTree = (node: TreeNode) => {
  if (!node.children) return;

  node.children.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });

  for (const child of node.children) {
    sortTree(child);
  }
};

const parseOutput = (output: string, repo: string) => {
  const files = output.split("\n").filter((line) => line.length > 0);

  let tree: TreeNode = {
    name: repo,
    path: "",
    type: "folder",
    children: [],
  };

  for (const file of files) {
    const statusChar = file[1];
    if (!statusChar) throw Error("Issue with getting status of a file");
    const filePath = file.substring(3, file.length).replace(/^"|"$/g, "");

    const folders = path.posix
      .dirname(filePath)
      .split("/")
      .filter((line) => line.length > 0);

    let current = tree;
    for (const folder of folders) {
      if (!current.children) throw Error("Children array is missing");
      if (!current.children.some((o) => o.name === folder)) {
        const folderNode: TreeNode = {
          name: path.basename(folder),
          path: folder,
          type: "folder",
          children: [],
        };
        current.children.push(folderNode);
      }

      const nextNode = current.children.find(
        (o) => o.name === path.basename(folder),
      );
      if (!nextNode) throw Error("Couldn't find a matching child in the tree");
      current = nextNode;
    }

    const fileNode: TreeNode = {
      name: path.basename(filePath),
      path: filePath,
      type: "file",
      status: status(statusChar),
    };

    current.children?.push(fileNode);
  }

  sortTree(tree);
  return tree;
};

export { parseOutput };
export type { TreeNode };
