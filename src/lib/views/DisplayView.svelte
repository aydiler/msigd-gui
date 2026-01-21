<script lang="ts">
  import Slider from "../components/Slider.svelte";
  import Toggle from "../components/Toggle.svelte";
  import Select from "../components/Select.svelte";
  import { monitorState } from "../state/monitors.svelte";
  import { uiState } from "../state/ui.svelte";
  import {
    setBrightness,
    setContrast,
    setSharpness,
    setResponseTime,
    setEyeSaver,
    setZeroLatency,
    setScreenSize,
  } from "../api/monitor";
  import type { ScreenSize } from "../types";

  async function handleBrightness(value: number) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setBrightness(monitorId, value);
      await monitorState.updateSetting("brightness", value);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleContrast(value: number) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setContrast(monitorId, value);
      await monitorState.updateSetting("contrast", value);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleSharpness(value: number) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setSharpness(monitorId, value);
      await monitorState.updateSetting("sharpness", value);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleResponseTime(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setResponseTime(monitorId, value);
      await monitorState.updateSetting(
        "responseTime",
        value as "normal" | "fast" | "fastest"
      );
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleEyeSaver(enabled: boolean) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setEyeSaver(monitorId, enabled);
      await monitorState.updateSetting("eyeSaver", enabled);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleZeroLatency(enabled: boolean) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setZeroLatency(monitorId, enabled);
      await monitorState.updateSetting("zeroLatency", enabled);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleScreenSize(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setScreenSize(monitorId, value);
      await monitorState.updateSetting("screenSize", value as ScreenSize);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }
</script>

<div class="display-view" data-testid="view-display">
  {#if monitorState.loading}
    <div class="loading" data-testid="loading">Loading settings...</div>
  {:else if monitorState.settings}
    <div class="settings-group">
      <h3>Picture</h3>
      <Slider
        label="Brightness"
        bind:value={monitorState.settings.brightness}
        min={0}
        max={100}
        unit="%"
        onchange={handleBrightness}
      />

      <Slider
        label="Contrast"
        bind:value={monitorState.settings.contrast}
        min={0}
        max={100}
        unit="%"
        onchange={handleContrast}
      />

      <Slider
        label="Sharpness"
        bind:value={monitorState.settings.sharpness}
        min={0}
        max={5}
        onchange={handleSharpness}
      />
    </div>

    <div class="settings-group">
      <h3>Screen</h3>
      <Select
        label="Screen Size"
        value={monitorState.settings.screenSize}
        options={[
          { value: "auto", label: "Auto" },
          { value: "4:3", label: "4:3" },
          { value: "16:9", label: "16:9" },
          { value: "21:9", label: "21:9" },
          { value: "1:1", label: "1:1" },
          { value: "19", label: "19 inch" },
          { value: "24", label: "24 inch" },
        ]}
        onchange={handleScreenSize}
      />
    </div>

    <div class="settings-group">
      <h3>Performance</h3>
      <Select
        label="Response Time"
        value={monitorState.settings.responseTime}
        options={[
          { value: "normal", label: "Normal" },
          { value: "fast", label: "Fast" },
          { value: "fastest", label: "Fastest" },
        ]}
        onchange={handleResponseTime}
      />

      <Toggle
        label="Zero Latency"
        bind:checked={monitorState.settings.zeroLatency}
        onchange={handleZeroLatency}
      />
    </div>

    <div class="settings-group">
      <h3>Comfort</h3>
      <Toggle
        label="Eye Saver Mode"
        bind:checked={monitorState.settings.eyeSaver}
        onchange={handleEyeSaver}
      />
    </div>
  {:else}
    <div class="no-monitor">
      <p>No monitor selected</p>
    </div>
  {/if}
</div>

<style>
  .display-view {
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

  .no-monitor,
  .loading {
    color: #6b7280;
    text-align: center;
    padding: 3rem;
  }
</style>
