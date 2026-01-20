<script lang="ts">
  import Select from "../components/Select.svelte";
  import { monitorState } from "../state/monitors.svelte";
  import { uiState } from "../state/ui.svelte";
  import { setMysticLight } from "../api/monitor";
  import type { MysticLightMode } from "../types";

  let ledMode: MysticLightMode = $state("off");
  let ledColor: string = $state("#ff0000");
  let ledColor2: string = $state("#0000ff");

  const modes: { value: MysticLightMode; label: string }[] = [
    { value: "off", label: "Off" },
    { value: "static", label: "Static" },
    { value: "breathing", label: "Breathing" },
    { value: "blinking", label: "Blinking" },
    { value: "flashing", label: "Flashing" },
    { value: "double_flashing", label: "Double Flashing" },
    { value: "lightning", label: "Lightning" },
    { value: "rainbow", label: "Rainbow" },
    { value: "meteor", label: "Meteor" },
    { value: "rainbow_gradient", label: "Rainbow Gradient" },
  ];

  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  function buildMysticConfig(): string {
    // Format: mode:r:g:b or mode:r1:g1:b1:r2:g2:b2 for multi-color modes
    const rgb1 = hexToRgb(ledColor);

    if (ledMode === "off") {
      return "off";
    }

    if (ledMode === "rainbow" || ledMode === "rainbow_gradient") {
      return ledMode;
    }

    // Modes that support two colors
    if (
      ledMode === "breathing" ||
      ledMode === "blinking" ||
      ledMode === "double_flashing"
    ) {
      const rgb2 = hexToRgb(ledColor2);
      return `${ledMode}:${rgb1.r}:${rgb1.g}:${rgb1.b}:${rgb2.r}:${rgb2.g}:${rgb2.b}`;
    }

    return `${ledMode}:${rgb1.r}:${rgb1.g}:${rgb1.b}`;
  }

  async function applyLedSettings() {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;

    try {
      const config = buildMysticConfig();
      await setMysticLight(monitorId, config);
      uiState.showToast("LED settings applied", "success");
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  function handleModeChange(value: string) {
    ledMode = value as MysticLightMode;
  }

  // Check if current mode supports colors
  const showColorPicker = $derived(
    ledMode !== "off" && ledMode !== "rainbow" && ledMode !== "rainbow_gradient"
  );

  // Check if current mode supports second color
  const showSecondColor = $derived(
    ledMode === "breathing" ||
      ledMode === "blinking" ||
      ledMode === "double_flashing"
  );
</script>

<div class="led-view" data-testid="view-led">
  {#if monitorState.loading}
    <div class="loading" data-testid="loading">Loading settings...</div>
  {:else if monitorState.settings}
    <div class="settings-group">
      <h3>Mystic Light</h3>
      <Select
        label="LED Mode"
        value={ledMode}
        options={modes}
        onchange={handleModeChange}
      />
    </div>

    {#if showColorPicker}
      <div class="settings-group" data-testid="led-colors">
        <h3>Colors</h3>
        <div class="color-picker-row">
          <label class="color-label">
            <span>Primary Color</span>
            <input type="color" bind:value={ledColor} class="color-input" data-testid="led-color-primary" />
          </label>
        </div>

        {#if showSecondColor}
          <div class="color-picker-row">
            <label class="color-label">
              <span>Secondary Color</span>
              <input type="color" bind:value={ledColor2} class="color-input" data-testid="led-color-secondary" />
            </label>
          </div>
        {/if}
      </div>
    {/if}

    <div class="settings-group">
      <button class="apply-button" data-testid="apply-led-button" onclick={applyLedSettings}>
        Apply LED Settings
      </button>
    </div>
  {:else}
    <div class="no-monitor">
      <p>No monitor selected</p>
    </div>
  {/if}
</div>

<style>
  .led-view {
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

  .color-picker-row {
    margin-bottom: 1rem;
  }

  .color-picker-row:last-child {
    margin-bottom: 0;
  }

  .color-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  .color-label span {
    color: #d1d5db;
    font-size: 0.875rem;
  }

  .color-input {
    width: 48px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background: transparent;
  }

  .color-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-input::-webkit-color-swatch {
    border: 2px solid #4b5563;
    border-radius: 6px;
  }

  .apply-button {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #3b82f6;
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .apply-button:hover {
    background: #2563eb;
  }

  .apply-button:active {
    background: #1d4ed8;
  }

  .no-monitor,
  .loading {
    color: #6b7280;
    text-align: center;
    padding: 3rem;
  }
</style>
