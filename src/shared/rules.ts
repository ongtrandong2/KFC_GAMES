import jQuery from "jquery";
function openTab(tabName: string): void {
  // Deactivate all tabs
  const tabs = document.querySelectorAll<HTMLElement>(".tab-content");
  tabs.forEach((tab) => {
    if (tab.id === tabName) {
      tab.style.display = "block";
    } else {
      tab.style.display = "none";
    }
  });

  // Deactivate all buttons
  const tabButtons =
    document.querySelectorAll<HTMLButtonElement>(".tab-button");
  tabButtons.forEach((button) => {
    if (button.dataset.tabId === tabName) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Get default tab
  const defaultTabId = "score-tab"; // ID của tab mặc định

  // Activate default tab
  openTab(defaultTabId);

  // Add event listeners to all tab buttons
  const tabButtons =
    document.querySelectorAll<HTMLButtonElement>(".tab-button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.dataset.tabId;
      if (tabId) {
        openTab(tabId);
      }
    });
  });
  // Add event listeners to control dialogs
  const toggleDialogButtons = document.querySelectorAll<HTMLButtonElement>(
    "button[data-dialog-target]",
  );
  toggleDialogButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = button.dataset.dialogTarget;
      const targetModal = document.querySelector<HTMLDivElement>(
        `[data-dialog-id="${targetId}"]`,
      );
      if (targetId && targetModal) {
        jQuery(targetModal).fadeToggle();
      }
    });
  });
});
