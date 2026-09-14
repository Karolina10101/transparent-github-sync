import { App, Modal, Notice } from "obsidian";
import findRepoPath from "../utils/find-repo-path";
import { execFileSync } from "child_process";
import GitErrorModal from "./git-error-modal";

export default class GitPullModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen(): void {
    const vaultPath = (this.app.vault.adapter as any).basePath;
    const repoPath = findRepoPath(vaultPath);

    if (!repoPath) {
      throw Error("Missing repo path");
    }

    // HTML
    const container = this.contentEl.createDiv({ cls: "git-push-modal" });

    const header = container.createDiv({ cls: "git-push-header" });

    header.createEl("h2", { text: "PULL FROM GITHUB", cls: "push-header" });
    header.createEl("p", { text: repoPath, cls: "repo-path" });

    const pullMessage = container.createEl("div", {
      text: "Are you sure you want to pull the lastest changes from GitHub?",
      cls: "pull-message",
    });

    // Buttons
    const actions = container.createDiv({ cls: "git-push-actions" });

    const cancelButton = actions.createEl("button", {
      text: "Cancel",
      cls: "button",
    });
    cancelButton.addEventListener("click", () => this.close());

    const pullButton = actions.createEl("button", {
      text: "Pull",
      cls: "button",
    });
    pullButton.addEventListener("click", () => {
      pullButton.disabled = true;

      let output;
      try {
        output = execFileSync("git", ["pull"], {
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
