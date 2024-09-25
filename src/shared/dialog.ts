export class Dialog {
  public el: HTMLElement;

  constructor(existingDialog: HTMLElement) {
    // Bind to the existing dialog element
    this.el = existingDialog;
  }

  setContent(content: string) {
    // Find the content element inside the existing dialog
    const dialogContent = this.el.querySelector(".Dialog-Content");
    if (dialogContent) {
      // Preserve the button element
      const button = dialogContent.querySelector(
        'button[type="submit"]',
      ) as HTMLElement;
      const replaced = button.cloneNode(true);
      button.parentNode?.replaceChild(replaced, button);
      // Set the inner HTML without removing the button
      dialogContent.innerHTML = content;

      // Re-append the preserved button if it exists
      if (replaced) {
        dialogContent.appendChild(replaced);
      }
    }
  }

  open() {
    this.el.classList.add("open");
  }
  close() {
    this.el.classList.remove("open");
  }

  setSubmitButton(text: string, callback: () => void) {
    // Find the button element with type="submit"
    const button = this.el.querySelector('button[type="submit"]');
    if (button) {
      // Set the button text
      button.textContent = text;
      // Set the button onclick event
      button.addEventListener("click", () => {
        this.close();
        callback();
      });
    }
  }
}
