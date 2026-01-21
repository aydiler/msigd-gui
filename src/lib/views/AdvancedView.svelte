<script lang="ts">
  import Toggle from "../components/Toggle.svelte";
  import Select from "../components/Select.svelte";
  import { monitorState } from "../state/monitors.svelte";
  import { uiState } from "../state/ui.svelte";
  import {
    setImageEnhancement,
    setHdcr,
    setRefreshRateDisplay,
  } from "../api/monitor";

  async function handleImageEnhancement(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setImageEnhancement(monitorId, value);
      await monitorState.updateSetting(
        "imageEnhancement",
        value as "off" | "weak" | "medium" | "strong" | "strongest"
      );
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleHdcr(enabled: boolean) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setHdcr(monitorId, enabled);
      await monitorState.updateSetting("hdcr", enabled);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleRefreshRateDisplay(enabled: boolean) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setRefreshRateDisplay(monitorId, enabled);
      await monitorState.updateSetting("refreshRateDisplay", enabled);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }
</script>

<div class="advanced-view" data-testid="view-advanced">
  {#if monitorState.loading}
    <div class="loading" data-testid="loading">Loading settings...</div>
  {:else if monitorState.settings}
    <div class="settings-group">
      <h3>Image Processing</h3>
      <Select
        label="Image Enhancement"
        value={monitorState.settings.imageEnhancement}
        options={[
          { value: "off", label: "Off" },
          { value: "weak", label: "Weak" },
          { value: "medium", label: "Medium" },
          { value: "strong", label: "Strong" },
          { value: "strongest", label: "Strongest" },
        ]}
        onchange={handleImageEnhancement}
      />

      <Toggle
        label="HDCR (High Dynamic Contrast)"
        bind:checked={monitorState.settings.hdcr}
        onchange={handleHdcr}
      />
    </div>

    <div class="settings-group">
      <h3>On-Screen Display</h3>
      <Toggle
        label="Show Refresh Rate"
        bind:checked={monitorState.settings.refreshRateDisplay}
        onchange={handleRefreshRateDisplay}
      />
    </div>

    <div class="settings-group info-group" data-testid="monitor-info">
      <h3>Monitor Info</h3>
      {#if monitorState.monitors.length > 0}
        {@const monitor = monitorState.monitors.find(
          (m) => m.id === monitorState.selectedId
        )}
        {#if monitor}
          <div class="info-row">
            <span class="info-label">Model</span>
            <span class="info-value" data-testid="info-model">{monitor.model}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Serial</span>
            <span class="info-value" data-testid="info-serial">{monitor.serial}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Firmware</span>
            <span class="info-value" data-testid="info-firmware">{monitor.firmware || "Unknown"}</span>
          </div>
        {/if}
      {/if}
    </div>
  {:else}
    <div class="no-monitor">
      <p>No monitor selected</p>
    </div>
  {/if}
</div>

<style>
  .advanced-view {
    padding: 1.5rem;
  }

  h3 {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .settings-group {
    background: #1f2937;
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1rem;
  }

  .info-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-label {
    color: #9ca3af;
    font-size: 0.875rem;
  }

  .info-value {
    color: #f3f4f6;
    font-size: 0.875rem;
    font-family: monospace;
  }

  .no-monitor,
  .loading {
    color: #6b7280;
    text-align: center;
    padding: 3rem;
  }
</style>
