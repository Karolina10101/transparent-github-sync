import { App, Modal, Notice } from "obsidian";
import { execFileSync } from "child_process";
import GitErrorModal from "./git-error-modal";

export default class GitSetuplModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen(): void {
    // HTML
    const container = this.contentEl.createDiv({ cls: "git-push-modal" });

    const header = container.createDiv({ cls: "git-push-header" });

    header.createEl("h2", { text: "SET UP GIT", cls: "push-header" });

    const info = container.createEl("div", { cls: "wizard-info" });
    info.innerHTML =
      "This wizard will help you with setting up Git for the specified folder and connecting it to GitHub. You can also set up Git manually using the terminal if you prefer. <br> <br> Note: GitHub may ask you to authenticate during the initial push if you are not already authenticated.";

    const repoPathInput = container.createEl("input", {
      cls: "configuration-path",
      placeholder:
        "(required) absolute path to the folder where you want to create the repo",
    });

    // Step 1
    container.createEl("h3", {
      text: "Step 1 — Configure Git",
      cls: "step-header",
    });

    const codeOne = container.createEl("div", {
      cls: "code",
    });
    codeOne.innerHTML =
      "git init <br> git remote add origin &lt;url&gt; <br> git branch -M main";

    const urlInput = container.createEl("input", {
      cls: "url",
      placeholder: "(required) URL, either https or ssl",
    });

    const actionsOne = container.createDiv({ cls: "git-push-actions" });
    const runCodeOneButton = actionsOne.createEl("button", {
      text: "Run code above",
      cls: "button",
    });
    runCodeOneButton.addEventListener("click", () => {
      const repoPath = repoPathInput.value.trim();
      if (!repoPath) {
        new Notice("Path to repository can't be empty");
        return;
      }

      const url = urlInput.value.trim();
      if (!url) {
        new Notice("The URL cannot be empty");
        return;
      }

      try {
        execFileSync("git", ["init"], {
          cwd: repoPath,
          encoding: "utf8",
        });

        execFileSync("git", ["branch", "-M", "main"], {
          cwd: repoPath,
          encoding: "utf8",
        });

        execFileSync("git", ["remote", "add", "origin", url], {
          cwd: repoPath,
          encoding: "utf8",
        });
      } catch (error) {
        this.close();

        if (error instanceof Error) new GitErrorModal(this.app, error).open();
        return;
      }

      new Notice("The code was run successfully");
    });

    // Step 2
    container.createEl("h3", {
      text: "Step 2 — Initial commit & push",
      cls: "step-header",
    });

    const codeTwo = container.createEl("div", {
      cls: "code",
    });
    codeTwo.innerHTML =
      'git add . <br> git commit -m "Initial commit" <br> git push -u origin main';

    const actionsTwo = container.createDiv({ cls: "git-push-actions" });
    const runCodeTwoButton = actionsTwo.createEl("button", {
      text: "Run code above",
      cls: "button",
    });
    runCodeTwoButton.addEventListener("click", () => {
      const repoPath = repoPathInput.value.trim();
      if (!repoPath) {
        new Notice("Path to repository can't be empty");
        return;
      }

      try {
        execFileSync("git", ["add", "."], {
          cwd: repoPath,
          encoding: "utf8",
        });

        execFileSync("git", ["commit", "-m", "Initial commit"], {
          cwd: repoPath,
          encoding: "utf8",
        });

        execFileSync("git", ["push", "-u", "origin", "main"], {
          cwd: repoPath,
          encoding: "utf8",
        });
      } catch (error) {
        this.close();

        if (error instanceof Error) new GitErrorModal(this.app, error).open();
        return;
      }

      new Notice("The code was run successfully. Setup Completed");
      this.close();
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
