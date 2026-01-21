<script lang="ts">
  import Toggle from "../components/Toggle.svelte";
  import Select from "../components/Select.svelte";
  import { monitorState } from "../state/monitors.svelte";
  import { uiState } from "../state/ui.svelte";
  import {
    setZeroLatency,
    setFreeSync,
    setGameMode,
    setProMode,
    setHdcr,
  } from "../api/monitor";
  import type { GameMode, ProMode } from "../types";

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

  async function handleFreeSync(enabled: boolean) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setFreeSync(monitorId, enabled);
      await monitorState.updateSetting("freeSync", enabled);
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

  async function handleGameMode(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setGameMode(monitorId, value);
      await monitorState.updateSetting("gameMode", value as GameMode);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleProMode(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setProMode(monitorId, value);
      await monitorState.updateSetting("proMode", value as ProMode);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }
</script>

<div class="performance-view" data-testid="view-performance">
  {#if monitorState.loading}
    <div class="loading" data-testid="loading">Loading settings...</div>
  {:else if monitorState.settings}
    <div class="settings-group">
      <h3>Latency</h3>
      <Toggle
        label="Zero Latency"
        bind:checked={monitorState.settings.zeroLatency}
        onchange={handleZeroLatency}
      />

      <Toggle
        label="FreeSync"
        bind:checked={monitorState.settings.freeSync}
        onchange={handleFreeSync}
      />

      <Toggle
        label="HDCR (High Dynamic Contrast)"
        bind:checked={monitorState.settings.hdcr}
        onchange={handleHdcr}
      />
    </div>

    <div class="settings-group">
      <h3>Modes</h3>
      <Select
        label="Game Mode"
        value={monitorState.settings.gameMode}
        options={[
          { value: "user", label: "User" },
          { value: "fps", label: "FPS" },
          { value: "racing", label: "Racing" },
          { value: "rts", label: "RTS" },
          { value: "rpg", label: "RPG" },
          { value: "premium_color", label: "Premium Color" },
        ]}
        onchange={handleGameMode}
      />

      <Select
        label="Pro Mode"
        value={monitorState.settings.proMode}
        options={[
          { value: "user", label: "User" },
          { value: "reader", label: "Reader" },
          { value: "cinema", label: "Cinema" },
          { value: "designer", label: "Designer" },
          { value: "office", label: "Office" },
          { value: "srgb", label: "sRGB" },
          { value: "adobe_rgb", label: "Adobe RGB" },
          { value: "dci_p3", label: "DCI-P3" },
          { value: "eco", label: "Eco" },
          { value: "anti_blue", label: "Anti-Blue" },
          { value: "movie", label: "Movie" },
        ]}
        onchange={handleProMode}
      />
    </div>
  {:else}
    <div class="no-monitor">
      <p>No monitor selected</p>
    </div>
  {/if}
</div>

<style>
  .performance-view {
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
