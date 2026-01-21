<script lang="ts">
  import Select from "../components/Select.svelte";
  import { monitorState } from "../state/monitors.svelte";
  import { uiState } from "../state/ui.svelte";
  import { setMysticLight } from "../api/monitor";
  import type { MysticLightMode } from "../types";

  // msigd supported modes: off, static, breathing, blinking, flashing, blinds, meteor, rainbow, random
  const modes: { value: MysticLightMode; label: string }[] = [
    { value: "off", label: "Off" },
    { value: "static", label: "Static" },
    { value: "breathing", label: "Breathing" },
    { value: "blinking", label: "Blinking" },
    { value: "flashing", label: "Flashing" },
    { value: "blinds", label: "Blinds" },
    { value: "meteor", label: "Meteor" },
    { value: "rainbow", label: "Rainbow" },
    { value: "random", label: "Random" },
  ];

  // Convert #RRGGBB to 0xRRGGBB format for msigd
  function hexToMsigdColor(hex: string): string {
    // Remove # prefix and add 0x prefix
    return "0x" + hex.replace("#", "").toUpperCase();
  }

  function buildMysticConfig(): string {
    if (!monitorState.settings) return "0:off:0x000000";

    const { ledMode, ledColor, ledColor2 } = monitorState.settings;
    // msigd format: ledgroup:mode:colors
    // ledgroup is 0 or 1
    // colors are comma-separated in 0xRRGGBB format
    const ledGroup = "0"; // Use LED group 0

    if (ledMode === "off") {
      return `${ledGroup}:off:0x000000`;
    }

    if (ledMode === "rainbow" || ledMode === "random") {
      // Rainbow and random modes don't need colors
      return `${ledGroup}:${ledMode}:0x000000`;
    }

    const color1 = hexToMsigdColor(ledColor);

    // Modes that support two colors
    if (
      ledMode === "breathing" ||
      ledMode === "blinking"
    ) {
      const color2 = hexToMsigdColor(ledColor2);
      return `${ledGroup}:${ledMode}:${color1},${color2}`;
    }

    return `${ledGroup}:${ledMode}:${color1}`;
  }

  async function applyLedSettings() {
    const monitorId = monitorState.selectedId;
    if (!monitorId || !monitorState.settings) return;

    try {
      const config = buildMysticConfig();
      await setMysticLight(monitorId, config);
      uiState.showToast("LED settings applied", "success");
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleModeChange(value: string) {
    await monitorState.updateSetting("ledMode", value as MysticLightMode);
  }

  async function handleColorChange(event: Event) {
    const target = event.target as HTMLInputElement;
    await monitorState.updateSetting("ledColor", target.value);
  }

  async function handleColor2Change(event: Event) {
    const target = event.target as HTMLInputElement;
    await monitorState.updateSetting("ledColor2", target.value);
  }

  // Check if current mode supports colors
  const showColorPicker = $derived(
    monitorState.settings?.ledMode !== "off" &&
    monitorState.settings?.ledMode !== "rainbow" &&
    monitorState.settings?.ledMode !== "random"
  );

  // Check if current mode supports second color
  const showSecondColor = $derived(
    monitorState.settings?.ledMode === "breathing" ||
    monitorState.settings?.ledMode === "blinking"
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
        value={monitorState.settings.ledMode}
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
            <input type="color" value={monitorState.settings.ledColor} onchange={handleColorChange} class="color-input" data-testid="led-color-primary" />
          </label>
        </div>

        {#if showSecondColor}
          <div class="color-picker-row">
            <label class="color-label">
              <span>Secondary Color</span>
              <input type="color" value={monitorState.settings.ledColor2} onchange={handleColor2Change} class="color-input" data-testid="led-color-secondary" />
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
