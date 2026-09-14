import { Menu, Plugin } from "obsidian";
import GitPushModal from "./modals/git-push-modal";
import GitPullModal from "./modals/git-pull-modal";
import GitSetuplModal from "./modals/git-setup-modal";

export default class TransparentGitHubSync extends Plugin {
  async onload() {
    const ribbonIcon = this.addRibbonIcon("folder-git-2", "GitHub", (event) => {
      const menu = new Menu();
      (menu as any).dom.addClass("github-menu");

      menu.addItem((item) => {
        item
          .setTitle("PULL")
          .setIcon("arrow-down-to-line")
          .onClick(() => {
            new GitPullModal(this.app).open();
          });
      });

      menu.addItem((item) => {
        item
          .setTitle("PUSH")
          .setIcon("arrow-up-from-line")
          .onClick(() => {
            new GitPushModal(this.app).open();
          });
      });

      menu.addSeparator();

      menu.addItem((item) => {
        item
          .setTitle("Setup")
          .setIcon("settings-2")
          .onClick(() => {
            new GitSetuplModal(this.app).open();
          });
      });

      menu.showAtMouseEvent(event);
    });

    ribbonIcon.addClass("github-ribbon-icon");
  }
}
