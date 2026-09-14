import { Modal, App } from "obsidian";

const generateHint = (errorMessage: string | undefined) => {
  if (!errorMessage) return "";
  if (
    errorMessage.includes(
      "Your local changes to the following files would be overwritten by merge",
    )
  ) {
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

export default class GitErrorModal extends Modal {
  error: Error;

  constructor(app: App, error: Error) {
    super(app);
    this.error = error;
  }

  onOpen(): void {
    const container = this.contentEl.createDiv({ cls: "git-push-modal" });
    const header = container.createDiv({ cls: "git-push-header" });
    header.createEl("h2", {
      text: "ERROR",
      cls: "push-header",
    });

    const gitError = (this.error as Error & { stderr?: string }).stderr;

    container.createEl("div", {
      text: generateHint(gitError),
      cls: "hint",
    });

    container.createEl("div", {
      text: gitError ?? this.error.message,
      cls: "error-message",
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
