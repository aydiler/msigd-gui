<script lang="ts">
  import { onMount } from "svelte";
  import { monitorState } from "./lib/state/monitors.svelte";
  import { uiState } from "./lib/state/ui.svelte";
  import DisplayView from "./lib/views/DisplayView.svelte";
  import type { Tab } from "./lib/types";

  const tabs: { id: Tab; label: string }[] = [
    { id: "display", label: "Display" },
    { id: "color", label: "Color" },
    { id: "led", label: "LED" },
    { id: "advanced", label: "Advanced" },
  ];

  onMount(() => {
    monitorState.loadMonitors();
  });

  function handleMonitorChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    monitorState.selectMonitor(target.value);
  }
</script>

<main class="app">
  <!-- Header -->
  <header class="header">
    <h1>MSI Monitor Control</h1>

    <select
      class="monitor-select"
      value={monitorState.selectedId ?? ""}
      onchange={handleMonitorChange}
      disabled={monitorState.loading || monitorState.monitors.length === 0}
    >
      {#if monitorState.monitors.length === 0}
        <option value="">No monitors</option>
      {:else}
        {#each monitorState.monitors as monitor (monitor.id)}
          <option value={monitor.id}>
            {monitor.model} ({monitor.serial})
          </option>
        {/each}
      {/if}
    </select>
  </header>

  <!-- Tab navigation -->
  <nav class="tabs">
    {#each tabs as tab (tab.id)}
      <button
        class="tab"
        class:active={uiState.activeTab === tab.id}
        onclick={() => uiState.setTab(tab.id)}
        disabled={tab.id !== "display"}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  <!-- Content area -->
  <div class="content">
    {#if monitorState.loading && monitorState.monitors.length === 0}
      <div class="status-message">
        <div class="spinner"></div>
        <p>Detecting monitors...</p>
      </div>
    {:else if monitorState.error}
      <div class="status-message error">
        <p>{monitorState.error}</p>
        <button class="retry-button" onclick={() => monitorState.loadMonitors()}>
          Retry
        </button>
      </div>
    {:else if monitorState.monitors.length === 0}
      <div class="status-message">
        <p>No MSI monitors detected</p>
        <p class="hint">Make sure your monitor is connected via USB</p>
        <button class="retry-button" onclick={() => monitorState.loadMonitors()}>
          Scan Again
        </button>
      </div>
    {:else if uiState.activeTab === "display"}
      <DisplayView />
    {:else}
      <div class="status-message">
        <p>Coming soon...</p>
      </div>
    {/if}
  </div>

  <!-- Toast notifications -->
  {#if uiState.toast}
    <div class="toast" class:error={uiState.toast.type === "error"}>
      {uiState.toast.message}
    </div>
  {/if}
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    background: #111827;
    color: #f3f4f6;
    -webkit-font-smoothing: antialiased;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #1f2937;
    border-bottom: 1px solid #374151;
  }

  h1 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: #f9fafb;
  }

  .monitor-select {
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    background: #374151;
    border: 1px solid #4b5563;
    border-radius: 6px;
    color: #f3f4f6;
    font-size: 0.875rem;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1rem;
  }

  .monitor-select:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .monitor-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Tabs */
  .tabs {
    display: flex;
    background: #1f2937;
    border-bottom: 1px solid #374151;
    padding: 0 1rem;
  }

  .tab {
    padding: 0.875rem 1.25rem;
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.15s;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .tab:hover:not(:disabled) {
    color: #d1d5db;
  }

  .tab.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }

  .tab:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Content */
  .content {
    flex: 1;
    overflow-y: auto;
  }

  .status-message {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 300px;
    color: #6b7280;
    gap: 1rem;
    text-align: center;
    padding: 2rem;
  }

  .status-message.error {
    color: #ef4444;
  }

  .hint {
    font-size: 0.875rem;
    opacity: 0.7;
    margin: 0;
  }

  .retry-button {
    padding: 0.5rem 1rem;
    background: #374151;
    border: 1px solid #4b5563;
    border-radius: 6px;
    color: #f3f4f6;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.15s;
  }

  .retry-button:hover {
    background: #4b5563;
  }

  /* Spinner */
  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #374151;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem 1.5rem;
    background: #22c55e;
    color: white;
    border-radius: 8px;
    font-size: 0.875rem;
    animation: slide-up 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .toast.error {
    background: #ef4444;
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(1rem);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
