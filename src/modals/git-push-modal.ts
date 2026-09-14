import { App, Modal, Notice } from "obsidian";
import findRepoPath from "../utils/find-repo-path";
import { execFileSync } from "child_process";
import path from "path";
import { parseOutput } from "../utils/parse-output";
import createDOMFolderStructure from "../utils/create-dom-folder-structure";
import GitErrorModal from "./git-error-modal";

export default class GitPushModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen(): void {
    const vaultPath = (this.app.vault.adapter as any).basePath;
    const repoPath = findRepoPath(vaultPath);

    if (!repoPath) {
      throw Error("Missing repo path");
    }

    const output = execFileSync("git", ["status", "--short", "-uall"], {
      cwd: repoPath,
      encoding: "utf8",
    });

    const files = output.split("\n").filter((line) => line.length > 0);

    // HTML
    const container = this.contentEl.createDiv({ cls: "git-push-modal" });

    const header = container.createDiv({ cls: "git-push-header" });

    header.createEl("h2", { text: "PUSH TO GITHUB", cls: "push-header" });
    header.createEl("p", { text: repoPath, cls: "repo-path" });

    const fileInformation = container.createDiv({
      cls: "git-file-information",
    });

    fileInformation.createEl("p", {
      text: `${files.length} ${files.length === 1 ? "file" : "files"} changed`,
      cls: "number-of-files-info",
    });

    const fileList = fileInformation.createDiv({ cls: "git-file-list" });

    const parsed = parseOutput(output, path.basename(repoPath));
    createDOMFolderStructure(fileList, parsed);

    const nameOfCommit = fileInformation.createEl("input", {
      cls: "name-of-commit",
      placeholder:
        '(optional) the name of your commit, the default is "update"',
    });

    // Buttons
    const actions = container.createDiv({ cls: "git-push-actions" });

    const commitButton = actions.createEl("button", {
      text: "Commit",
      cls: "button commit-button",
      title: "Commits selected files (mainly for resolving merge conflicts)",
    });
    commitButton.addEventListener("click", () => {
      commitButton.disabled = true;
      pushButton.disabled = true;
      const selectedFiles: string[] = [];

      const checkboxes = fileList.querySelectorAll<HTMLInputElement>(
        "input.file-checkbox",
      );

      for (const checkbox of checkboxes) {
        if (checkbox.checked) {
          selectedFiles.push(checkbox.value);
        }
      }

      const message = fileInformation.querySelector<HTMLInputElement>(
        "input.name-of-commit",
      );
      if (!message) throw Error("Failed to find input element");
      message.value = message.value.trim();
      if (message.value === "") message.value = "update";

      if (selectedFiles.length === 0) {
        pushButton.disabled = false;
        new Notice("No files selected for commit");
        return;
      }

      try {
        execFileSync("git", ["add", "--", ...selectedFiles], {
          cwd: repoPath,
          encoding: "utf8",
        });

        execFileSync("git", ["commit", "-m", message.value], {
          cwd: repoPath,
          encoding: "utf8",
        });
      } catch (error) {
        this.close();

        if (error instanceof Error) new GitErrorModal(this.app, error).open();
        return;
      }

      this.close();
      new Notice("Successfully committed the changes");
    });

    const cancelButton = actions.createEl("button", {
      text: "Cancel",
      cls: "button",
    });
    cancelButton.addEventListener("click", () => this.close());

    const pushButton = actions.createEl("button", {
      text: "Push",
      cls: "button",
      title:
        "Commits selected files (or skips commit if no files selected), then pushes your latest version to GitHub.",
    });
    pushButton.addEventListener("click", () => {
      commitButton.disabled = true;
      pushButton.disabled = true;
      const selectedFiles: string[] = [];

      const checkboxes = fileList.querySelectorAll<HTMLInputElement>(
        "input.file-checkbox",
      );

      for (const checkbox of checkboxes) {
        if (checkbox.checked) {
          selectedFiles.push(checkbox.value);
        }
      }

      const message = fileInformation.querySelector<HTMLInputElement>(
        "input.name-of-commit",
      );
      if (!message) throw Error("Failed to find input element");
      message.value = message.value.trim();
      if (message.value === "") message.value = "update";

      try {
        let output;
        if (selectedFiles.length > 0) {
          execFileSync("git", ["add", "--", ...selectedFiles], {
            cwd: repoPath,
            encoding: "utf8",
          });

          execFileSync("git", ["commit", "-m", message.value], {
            cwd: repoPath,
            encoding: "utf8",
          });
        }

        output = execFileSync("git", ["push"], {
          cwd: repoPath,
          encoding: "utf8",
        });
      } catch (error) {
        this.close();

        if (error instanceof Error) new GitErrorModal(this.app, error).open();
        return;
      }

      this.close();
      new Notice("Synced with GitHub");
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
