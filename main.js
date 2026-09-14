"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TransparentGitHubSync
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/modals/git-push-modal.ts
var import_obsidian3 = require("obsidian");

// src/utils/find-repo-path.ts
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var findRepoPath = (vaultPath) => {
  let currentPath = vaultPath;
  while (true) {
    const gitPath = import_path.default.join(currentPath, ".git");
    if (import_fs.default.existsSync(gitPath)) {
      return currentPath;
    }
    const parentPath = import_path.default.dirname(currentPath);
    if (parentPath === currentPath) {
      return null;
    }
    currentPath = parentPath;
  }
};
var find_repo_path_default = findRepoPath;

// src/modals/git-push-modal.ts
var import_child_process = require("child_process");
var import_path3 = __toESM(require("path"));

// src/utils/parse-output.ts
var import_path2 = __toESM(require("path"));
var status = (statusChar) => {
  if (statusChar === "?") return "new";
  if (statusChar === "D") return "deleted";
  if (statusChar === "U") return "conflict";
  else return "modified";
};
var sortTree = (node) => {
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
var parseOutput = (output, repo) => {
  const files = output.split("\n").filter((line) => line.length > 0);
  let tree = {
    name: repo,
    path: "",
    type: "folder",
    children: []
  };
  for (const file of files) {
    const statusChar = file[1];
    if (!statusChar) throw Error("Issue with getting status of a file");
    const filePath = file.substring(3, file.length).replace(/^"|"$/g, "");
    const folders = import_path2.default.posix.dirname(filePath).split("/").filter((line) => line.length > 0);
    let current = tree;
    for (const folder of folders) {
      if (!current.children) throw Error("Children array is missing");
      if (!current.children.some((o) => o.name === folder)) {
        const folderNode = {
          name: import_path2.default.basename(folder),
          path: folder,
          type: "folder",
          children: []
        };
        current.children.push(folderNode);
      }
      const nextNode = current.children.find(
        (o) => o.name === import_path2.default.basename(folder)
      );
      if (!nextNode) throw Error("Couldn't find a matching child in the tree");
      current = nextNode;
    }
    const fileNode = {
      name: import_path2.default.basename(filePath),
      path: filePath,
      type: "file",
      status: status(statusChar)
    };
    current.children?.push(fileNode);
  }
  sortTree(tree);
  return tree;
};

// src/utils/create-dom-folder-structure.ts
var import_obsidian = require("obsidian");
var setFolderIcon = (folderIcon, checked) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", "14");
  svg.setAttribute("height", "14");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", checked ? "currentColor" : "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  const path4 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path4.setAttribute(
    "d",
    "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2v0Z"
  );
  svg.appendChild(path4);
  folderIcon.replaceChildren(svg);
};
var updateFolderCheckboxes = (container) => {
  if (container.className === "content-list") {
    const folder = container.parentElement;
    if (!folder || !(folder instanceof HTMLDivElement))
      throw Error("Missing folder while updating checkboxes");
    updateFolderCheckboxes(folder);
  }
  if (container.className !== "folder") return;
  const folderCheckbox = container.querySelector(
    "input.folder-checkbox"
  );
  const folderIcon = container.querySelector("div.folder-icon");
  const checkboxes = container.querySelectorAll(
    "input.file-checkbox"
  );
  const areAllChecked = Array.from(checkboxes).every(
    (checkbox) => checkbox.checked
  );
  if (!folderCheckbox) throw Error("Folder checkbox is null");
  folderCheckbox.checked = areAllChecked;
  if (!folderIcon) throw Error("Folder icon is null");
  setFolderIcon(folderIcon, areAllChecked);
  const parent = container.parentElement;
  if (parent instanceof HTMLDivElement && (parent?.className === "folder" || parent?.className === "content-list"))
    updateFolderCheckboxes(parent);
};
var recursiveFolderStructure = (container, parsed) => {
  if (!parsed.children || parsed.children.length === 0) return;
  for (const child of parsed.children) {
    if (child.type === "folder") {
      const folder = container.createEl("div", { cls: "folder" });
      const folderHeader = folder.createEl("label", { cls: "folder-header" });
      const folderCheckbox = folderHeader.createEl("input", {
        type: "checkbox",
        cls: "folder-checkbox"
      });
      const folderIcon = folderHeader.createEl("div", { cls: "folder-icon" });
      const folderName = folderHeader.createEl("div", {
        text: child.name,
        cls: "folder-name"
      });
      setFolderIcon(folderIcon, false);
      folderCheckbox.addEventListener("change", () => {
        const checkboxes = folder.querySelectorAll(
          "input.file-checkbox"
        );
        for (const checkbox of checkboxes) {
          checkbox.checked = folderCheckbox.checked;
        }
        const folderHeaders = folder.querySelectorAll(
          "label.folder-header"
        );
        for (const header of folderHeaders) {
          const fc = header.querySelector(
            "input.folder-checkbox"
          );
          const fi = header.querySelector("div.folder-icon");
          if (!fc) throw Error("Missing folder checkbox");
          fc.checked = folderCheckbox.checked;
          if (!fi) throw Error("Missing folder icon");
          setFolderIcon(fi, folderCheckbox.checked);
        }
        updateFolderCheckboxes(folder);
      });
      const contentList = folder.createEl("div", { cls: "content-list" });
      recursiveFolderStructure(contentList, child);
    } else {
      const file = container.createEl("label", { cls: "file-container" });
      const fileCheckbox = file.createEl("input", {
        type: "checkbox",
        cls: "file-checkbox"
      });
      fileCheckbox.value = child.path;
      fileCheckbox.addEventListener(
        "change",
        () => updateFolderCheckboxes(container)
      );
      const fileName = file.createEl("div", {
        text: child.name,
        cls: "file-name"
      });
      const fileStatus = file.createEl("div", {
        text: child.status,
        cls: "file-status"
      });
    }
  }
};
var createDOMFolderStructure = (container, parsed) => {
  const repoHeader = container.createEl("label", { cls: "repo-header" });
  const repoCheckbox = repoHeader.createEl("input", {
    type: "checkbox",
    cls: "repo-checkbox"
  });
  const repoIcon = repoHeader.createEl("div", { cls: "repo-icon" });
  (0, import_obsidian.setIcon)(repoIcon, "chevron-down");
  const repoName = repoHeader.createEl("div", {
    text: parsed.name,
    cls: "repo-name"
  });
  repoCheckbox.addEventListener("change", () => {
    const folderCheckboxes = container.querySelectorAll(
      "input.folder-checkbox"
    );
    const areAllChecked = Array.from(folderCheckboxes).every(
      (checkbox) => checkbox.checked
    );
    for (const checkbox of folderCheckboxes) {
      checkbox.checked = !areAllChecked;
      checkbox.dispatchEvent(new Event("change"));
    }
  });
  recursiveFolderStructure(container, parsed);
  const statuses = container.querySelectorAll(".file-status");
  if (!statuses) return;
  for (const status2 of statuses) {
    if (status2.textContent === "new") {
      status2.classList.add("file-status--new");
    } else if (status2.textContent === "modified") {
      status2.classList.add("file-status--modified");
    } else if (status2.textContent === "deleted") {
      status2.classList.add("file-status--deleted");
    } else {
      status2.classList.add("file-status--conflict");
    }
  }
};
var create_dom_folder_structure_default = createDOMFolderStructure;

// src/modals/git-error-modal.ts
var import_obsidian2 = require("obsidian");
var generateHint = (errorMessage) => {
  if (!errorMessage) return "";
  if (errorMessage.includes(
    "Your local changes to the following files would be overwritten by merge"
  )) {
    return "Hint: You have uncommitted local changes that conflict with changes from GitHub. Commit the affected files first, then try Pull again.";
  }
  if (errorMessage.includes("CONFLICT")) {
    return "Hint: A merge conflict occurred. Resolve the conflicting files";
  }
  if (errorMessage.includes("non-fast-forward")) {
    return "Hint: The remote branch has changes that you don't have locally. Pull first, resolve any conflicts, then push again.";
  }
  if (errorMessage.includes("Authentication")) {
    return "Hint: GitHub authentication failed. Check your credentials and authentication setup";
  }
  return "";
};
var GitErrorModal = class extends import_obsidian2.Modal {
  error;
  constructor(app, error) {
    super(app);
    this.error = error;
  }
  onOpen() {
    const container = this.contentEl.createDiv({ cls: "git-push-modal" });
    const header = container.createDiv({ cls: "git-push-header" });
    header.createEl("h2", {
      text: "ERROR",
      cls: "push-header"
    });
    const gitError = this.error.stderr;
    container.createEl("div", {
      text: generateHint(gitError),
      cls: "hint"
    });
    container.createEl("div", {
      text: gitError ?? this.error.message,
      cls: "error-message"
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modals/git-push-modal.ts
var GitPushModal = class extends import_obsidian3.Modal {
  constructor(app) {
    super(app);
  }
  onOpen() {
    const vaultPath = this.app.vault.adapter.basePath;
    const repoPath = find_repo_path_default(vaultPath);
    if (!repoPath) {
      throw Error("Missing repo path");
    }
    const output = (0, import_child_process.execFileSync)("git", ["status", "--short", "-uall"], {
      cwd: repoPath,
      encoding: "utf8"
    });
    const files = output.split("\n").filter((line) => line.length > 0);
    const container = this.contentEl.createDiv({ cls: "git-push-modal" });
    const header = container.createDiv({ cls: "git-push-header" });
    header.createEl("h2", { text: "PUSH TO GITHUB", cls: "push-header" });
    header.createEl("p", { text: repoPath, cls: "repo-path" });
    const fileInformation = container.createDiv({
      cls: "git-file-information"
    });
    fileInformation.createEl("p", {
      text: `${files.length} ${files.length === 1 ? "file" : "files"} changed`,
      cls: "number-of-files-info"
    });
    const fileList = fileInformation.createDiv({ cls: "git-file-list" });
    const parsed = parseOutput(output, import_path3.default.basename(repoPath));
    create_dom_folder_structure_default(fileList, parsed);
    const nameOfCommit = fileInformation.createEl("input", {
      cls: "name-of-commit",
      placeholder: '(optional) the name of your commit, the default is "update"'
    });
    const actions = container.createDiv({ cls: "git-push-actions" });
    const commitButton = actions.createEl("button", {
      text: "Commit",
      cls: "button commit-button",
      title: "Commits selected files (mainly for resolving merge conflicts)"
    });
    commitButton.addEventListener("click", () => {
      commitButton.disabled = true;
      pushButton.disabled = true;
      const selectedFiles = [];
      const checkboxes = fileList.querySelectorAll(
        "input.file-checkbox"
      );
      for (const checkbox of checkboxes) {
        if (checkbox.checked) {
          selectedFiles.push(checkbox.value);
        }
      }
      const message = fileInformation.querySelector(
        "input.name-of-commit"
      );
      if (!message) throw Error("Failed to find input element");
      message.value = message.value.trim();
      if (message.value === "") message.value = "update";
      if (selectedFiles.length === 0) {
        pushButton.disabled = false;
        new import_obsidian3.Notice("No files selected for commit");
        return;
      }
      try {
        (0, import_child_process.execFileSync)("git", ["add", "--", ...selectedFiles], {
          cwd: repoPath,
          encoding: "utf8"
        });
        (0, import_child_process.execFileSync)("git", ["commit", "-m", message.value], {
          cwd: repoPath,
          encoding: "utf8"
        });
      } catch (error) {
        this.close();
        if (error instanceof Error) new GitErrorModal(this.app, error).open();
        return;
      }
      this.close();
      new import_obsidian3.Notice("Successfully committed the changes");
    });
    const cancelButton = actions.createEl("button", {
      text: "Cancel",
      cls: "button"
    });
    cancelButton.addEventListener("click", () => this.close());
    const pushButton = actions.createEl("button", {
      text: "Push",
      cls: "button",
      title: "Commits selected files (or skips commit if no files selected), then pushes your latest version to GitHub."
    });
    pushButton.addEventListener("click", () => {
      commitButton.disabled = true;
      pushButton.disabled = true;
      const selectedFiles = [];
      const checkboxes = fileList.querySelectorAll(
        "input.file-checkbox"
      );
      for (const checkbox of checkboxes) {
        if (checkbox.checked) {
          selectedFiles.push(checkbox.value);
        }
      }
      const message = fileInformation.querySelector(
        "input.name-of-commit"
      );
      if (!message) throw Error("Failed to find input element");
      message.value = message.value.trim();
      if (message.value === "") message.value = "update";
      try {
        let output2;
        if (selectedFiles.length > 0) {
          (0, import_child_process.execFileSync)("git", ["add", "--", ...selectedFiles], {
            cwd: repoPath,
            encoding: "utf8"
          });
          (0, import_child_process.execFileSync)("git", ["commit", "-m", message.value], {
            cwd: repoPath,
            encoding: "utf8"
          });
        }
        output2 = (0, import_child_process.execFileSync)("git", ["push"], {
          cwd: repoPath,
          encoding: "utf8"
        });
      } catch (error) {
        this.close();
        if (error instanceof Error) new GitErrorModal(this.app, error).open();
        return;
      }
      this.close();
      new import_obsidian3.Notice("Synced with GitHub");
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modals/git-pull-modal.ts
var import_obsidian4 = require("obsidian");
var import_child_process2 = require("child_process");
var GitPullModal = class extends import_obsidian4.Modal {
  constructor(app) {
    super(app);
  }
  onOpen() {
    const vaultPath = this.app.vault.adapter.basePath;
    const repoPath = find_repo_path_default(vaultPath);
    if (!repoPath) {
      throw Error("Missing repo path");
    }
    const container = this.contentEl.createDiv({ cls: "git-push-modal" });
    const header = container.createDiv({ cls: "git-push-header" });
    header.createEl("h2", { text: "PULL FROM GITHUB", cls: "push-header" });
    header.createEl("p", { text: repoPath, cls: "repo-path" });
    const pullMessage = container.createEl("div", {
      text: "Are you sure you want to pull the lastest changes from GitHub?",
      cls: "pull-message"
    });
    const actions = container.createDiv({ cls: "git-push-actions" });
    const cancelButton = actions.createEl("button", {
      text: "Cancel",
      cls: "button"
    });
    cancelButton.addEventListener("click", () => this.close());
    const pullButton = actions.createEl("button", {
      text: "Pull",
      cls: "button"
    });
    pullButton.addEventListener("click", () => {
      pullButton.disabled = true;
      let output;
      try {
        output = (0, import_child_process2.execFileSync)("git", ["pull"], {
          cwd: repoPath,
          encoding: "utf8"
        });
      } catch (error) {
        this.close();
        if (error instanceof Error) new GitErrorModal(this.app, error).open();
        return;
      }
      this.close();
      new import_obsidian4.Notice("Synced with GitHub");
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/modals/git-setup-modal.ts
var import_obsidian5 = require("obsidian");
var import_child_process3 = require("child_process");
var GitSetuplModal = class extends import_obsidian5.Modal {
  constructor(app) {
    super(app);
  }
  onOpen() {
    const container = this.contentEl.createDiv({ cls: "git-push-modal" });
    const header = container.createDiv({ cls: "git-push-header" });
    header.createEl("h2", { text: "SET UP GIT", cls: "push-header" });
    const info = container.createEl("div", { cls: "wizard-info" });
    info.innerHTML = "This wizard will help you with setting up Git for the specified folder and connecting it to GitHub. You can also set up Git manually using the terminal if you prefer. <br> <br> Note: GitHub may ask you to authenticate during the initial push if you are not already authenticated.";
    const repoPathInput = container.createEl("input", {
      cls: "configuration-path",
      placeholder: "(required) absolute path to the folder where you want to create the repo"
    });
    container.createEl("h3", {
      text: "Step 1 \u2014 Configure Git",
      cls: "step-header"
    });
    const codeOne = container.createEl("div", {
      cls: "code"
    });
    codeOne.innerHTML = "git init <br> git remote add origin &lt;url&gt; <br> git branch -M main";
    const urlInput = container.createEl("input", {
      cls: "url",
      placeholder: "(required) URL, either https or ssl"
    });
    const actionsOne = container.createDiv({ cls: "git-push-actions" });
    const runCodeOneButton = actionsOne.createEl("button", {
      text: "Run code above",
      cls: "button"
    });
    runCodeOneButton.addEventListener("click", () => {
      const repoPath = repoPathInput.value.trim();
      if (!repoPath) {
        new import_obsidian5.Notice("Path to repository can't be empty");
        return;
      }
      const url = urlInput.value.trim();
      if (!url) {
        new import_obsidian5.Notice("The URL cannot be empty");
        return;
      }
      try {
        (0, import_child_process3.execFileSync)("git", ["init"], {
          cwd: repoPath,
          encoding: "utf8"
        });
        (0, import_child_process3.execFileSync)("git", ["branch", "-M", "main"], {
          cwd: repoPath,
          encoding: "utf8"
        });
        (0, import_child_process3.execFileSync)("git", ["remote", "add", "origin", url], {
          cwd: repoPath,
          encoding: "utf8"
        });
      } catch (error) {
        this.close();
        if (error instanceof Error) new GitErrorModal(this.app, error).open();
        return;
      }
      new import_obsidian5.Notice("The code was run successfully");
    });
    container.createEl("h3", {
      text: "Step 2 \u2014 Initial commit & push",
      cls: "step-header"
    });
    const codeTwo = container.createEl("div", {
      cls: "code"
    });
    codeTwo.innerHTML = 'git add . <br> git commit -m "Initial commit" <br> git push -u origin main';
    const actionsTwo = container.createDiv({ cls: "git-push-actions" });
    const runCodeTwoButton = actionsTwo.createEl("button", {
      text: "Run code above",
      cls: "button"
    });
    runCodeTwoButton.addEventListener("click", () => {
      const repoPath = repoPathInput.value.trim();
      if (!repoPath) {
        new import_obsidian5.Notice("Path to repository can't be empty");
        return;
      }
      try {
        (0, import_child_process3.execFileSync)("git", ["add", "."], {
          cwd: repoPath,
          encoding: "utf8"
        });
        (0, import_child_process3.execFileSync)("git", ["commit", "-m", "Initial commit"], {
          cwd: repoPath,
          encoding: "utf8"
        });
        (0, import_child_process3.execFileSync)("git", ["push", "-u", "origin", "main"], {
          cwd: repoPath,
          encoding: "utf8"
        });
      } catch (error) {
        this.close();
        if (error instanceof Error) new GitErrorModal(this.app, error).open();
        return;
      }
      new import_obsidian5.Notice("The code was run successfully. Setup Completed");
      this.close();
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/main.ts
var TransparentGitHubSync = class extends import_obsidian6.Plugin {
  async onload() {
    const ribbonIcon = this.addRibbonIcon("folder-git-2", "GitHub", (event) => {
      const menu = new import_obsidian6.Menu();
      menu.dom.addClass("github-menu");
      menu.addItem((item) => {
        item.setTitle("PULL").setIcon("arrow-down-to-line").onClick(() => {
          new GitPullModal(this.app).open();
        });
      });
      menu.addItem((item) => {
        item.setTitle("PUSH").setIcon("arrow-up-from-line").onClick(() => {
          new GitPushModal(this.app).open();
        });
      });
      menu.addSeparator();
      menu.addItem((item) => {
        item.setTitle("Setup").setIcon("settings-2").onClick(() => {
          new GitSetuplModal(this.app).open();
        });
      });
      menu.showAtMouseEvent(event);
    });
    ribbonIcon.addClass("github-ribbon-icon");
  }
};
