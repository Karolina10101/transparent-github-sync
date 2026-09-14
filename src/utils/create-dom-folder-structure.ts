import { setIcon } from "obsidian";
import type { TreeNode } from "./parse-output";

const setFolderIcon = (folderIcon: HTMLDivElement, checked: boolean) => {
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

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2v0Z",
  );

  svg.appendChild(path);
  folderIcon.replaceChildren(svg);
};

const updateFolderCheckboxes = (container: HTMLDivElement) => {
  if (container.className === "content-list") {
    const folder = container.parentElement;
    if (!folder || !(folder instanceof HTMLDivElement))
      throw Error("Missing folder while updating checkboxes");
    updateFolderCheckboxes(folder);
  }

  if (container.className !== "folder") return;

  const folderCheckbox = container.querySelector<HTMLInputElement>(
    "input.folder-checkbox",
  );
  const folderIcon = container.querySelector<HTMLDivElement>("div.folder-icon");

  const checkboxes = container.querySelectorAll<HTMLInputElement>(
    "input.file-checkbox",
  );

  const areAllChecked = Array.from(checkboxes).every(
    (checkbox) => checkbox.checked,
  );

  if (!folderCheckbox) throw Error("Folder checkbox is null");
  folderCheckbox.checked = areAllChecked;

  if (!folderIcon) throw Error("Folder icon is null");
  setFolderIcon(folderIcon, areAllChecked);

  const parent = container.parentElement;
  if (
    parent instanceof HTMLDivElement &&
    (parent?.className === "folder" || parent?.className === "content-list")
  )
    updateFolderCheckboxes(parent);
};

const recursiveFolderStructure = (
  container: HTMLDivElement,
  parsed: TreeNode,
) => {
  if (!parsed.children || parsed.children.length === 0) return;

  for (const child of parsed.children) {
    if (child.type === "folder") {
      const folder = container.createEl("div", { cls: "folder" });
      const folderHeader = folder.createEl("label", { cls: "folder-header" });
      const folderCheckbox = folderHeader.createEl("input", {
        type: "checkbox",
        cls: "folder-checkbox",
      });
      const folderIcon = folderHeader.createEl("div", { cls: "folder-icon" });
      const folderName = folderHeader.createEl("div", {
        text: child.name,
        cls: "folder-name",
      });

      setFolderIcon(folderIcon, false);

      // makes clicking on folder select/deselect all children and changes icon

      folderCheckbox.addEventListener("change", () => {
        const checkboxes = folder.querySelectorAll<HTMLInputElement>(
          "input.file-checkbox",
        );

        for (const checkbox of checkboxes) {
          checkbox.checked = folderCheckbox.checked;
        }

        const folderHeaders = folder.querySelectorAll<HTMLLabelElement>(
          "label.folder-header",
        );

        for (const header of folderHeaders) {
          const fc = header.querySelector<HTMLInputElement>(
            "input.folder-checkbox",
          );
          const fi = header.querySelector<HTMLDivElement>("div.folder-icon");

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
        cls: "file-checkbox",
      });
      fileCheckbox.value = child.path;
      fileCheckbox.addEventListener("change", () =>
        updateFolderCheckboxes(container),
      );

      const fileName = file.createEl("div", {
        text: child.name,
        cls: "file-name",
      });

      const fileStatus = file.createEl("div", {
        text: child.status,
        cls: "file-status",
      });
    }
  }
};

const createDOMFolderStructure = (
  container: HTMLDivElement,
  parsed: TreeNode,
) => {
  // the repository clickable name
  const repoHeader = container.createEl("label", { cls: "repo-header" });
  const repoCheckbox = repoHeader.createEl("input", {
    type: "checkbox",
    cls: "repo-checkbox",
  });
  const repoIcon = repoHeader.createEl("div", { cls: "repo-icon" });
  setIcon(repoIcon, "chevron-down");
  const repoName = repoHeader.createEl("div", {
    text: parsed.name,
    cls: "repo-name",
  });

  repoCheckbox.addEventListener("change", () => {
    const folderCheckboxes = container.querySelectorAll<HTMLInputElement>(
      "input.folder-checkbox",
    );

    const areAllChecked = Array.from(folderCheckboxes).every(
      (checkbox) => checkbox.checked,
    );

    for (const checkbox of folderCheckboxes) {
      checkbox.checked = !areAllChecked;
      checkbox.dispatchEvent(new Event("change"));
    }
  });
  //

  // recursively  creates folder structure
  recursiveFolderStructure(container, parsed);

  // adding status types
  const statuses = container.querySelectorAll(".file-status");

  if (!statuses) return;
  for (const status of statuses) {
    if (status.textContent === "new") {
      status.classList.add("file-status--new");
    } else if (status.textContent === "modified") {
      status.classList.add("file-status--modified");
    } else if (status.textContent === "deleted") {
      status.classList.add("file-status--deleted");
    } else {
      status.classList.add("file-status--conflict");
    }
  }
};

export default createDOMFolderStructure;
