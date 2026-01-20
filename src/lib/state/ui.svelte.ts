// Svelte 5 reactive state for UI

import type { Tab } from "../types";

/**
 * UI state using Svelte 5 $state rune
 */
class UIState {
  activeTab = $state<Tab>("display");
  toast = $state<{ message: string; type: "success" | "error" } | null>(null);

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  showToast(message: string, type: "success" | "error" = "success") {
    // Clear existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toast = { message, type };

    // Auto-hide after 3 seconds
    this.toastTimeout = setTimeout(() => {
      this.toast = null;
      this.toastTimeout = null;
    }, 3000);
  }

  hideToast() {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    this.toast = null;
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
  }
}

// Export singleton instance
export const uiState = new UIState();
