<script lang="ts">
  import Slider from "../components/Slider.svelte";
  import Select from "../components/Select.svelte";
  import { monitorState } from "../state/monitors.svelte";
  import { uiState } from "../state/ui.svelte";
  import {
    setColorPreset,
    setColorRgb,
    setNightVision,
    setBlackTuner,
    setImageEnhancement,
  } from "../api/monitor";
  import type { NightVision } from "../types";

  async function handleColorPreset(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setColorPreset(monitorId, value);
      await monitorState.updateSetting(
        "colorPreset",
        value as "cool" | "normal" | "warm" | "custom"
      );
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleColorR(value: number) {
    const monitorId = monitorState.selectedId;
    if (!monitorId || !monitorState.settings) return;
    try {
      const { g, b } = monitorState.settings.colorRgb;
      await setColorRgb(monitorId, value, g, b);
      await monitorState.updateSetting("colorRgb", {
        ...monitorState.settings.colorRgb,
        r: value,
      });
      // Switch to custom preset when adjusting RGB
      if (monitorState.settings.colorPreset !== "custom") {
        await monitorState.updateSetting("colorPreset", "custom");
      }
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleColorG(value: number) {
    const monitorId = monitorState.selectedId;
    if (!monitorId || !monitorState.settings) return;
    try {
      const { r, b } = monitorState.settings.colorRgb;
      await setColorRgb(monitorId, r, value, b);
      await monitorState.updateSetting("colorRgb", {
        ...monitorState.settings.colorRgb,
        g: value,
      });
      if (monitorState.settings.colorPreset !== "custom") {
        await monitorState.updateSetting("colorPreset", "custom");
      }
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleColorB(value: number) {
    const monitorId = monitorState.selectedId;
    if (!monitorId || !monitorState.settings) return;
    try {
      const { r, g } = monitorState.settings.colorRgb;
      await setColorRgb(monitorId, r, g, value);
      await monitorState.updateSetting("colorRgb", {
        ...monitorState.settings.colorRgb,
        b: value,
      });
      if (monitorState.settings.colorPreset !== "custom") {
        await monitorState.updateSetting("colorPreset", "custom");
      }
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleNightVision(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setNightVision(monitorId, value);
      await monitorState.updateSetting("nightVision", value as NightVision);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleBlackTuner(value: number) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setBlackTuner(monitorId, value);
      await monitorState.updateSetting("blackTuner", value);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

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
</script>

<div class="color-view" data-testid="view-color">
  {#if monitorState.loading}
    <div class="loading" data-testid="loading">Loading settings...</div>
  {:else if monitorState.settings}
    <div class="settings-group">
      <h3>Color Temperature</h3>
      <Select
        label="Color Preset"
        value={monitorState.settings.colorPreset}
        options={[
          { value: "cool", label: "Cool" },
          { value: "normal", label: "Normal" },
          { value: "warm", label: "Warm" },
          { value: "custom", label: "Custom" },
        ]}
        onchange={handleColorPreset}
      />
    </div>

    <div class="settings-group">
      <h3>RGB Adjustment</h3>
      <p class="hint">Fine-tune individual color channels</p>
      <div class="rgb-sliders">
        <Slider
          label="Red"
          bind:value={monitorState.settings.colorRgb.r}
          min={0}
          max={100}
          onchange={handleColorR}
        />

        <Slider
          label="Green"
          bind:value={monitorState.settings.colorRgb.g}
          min={0}
          max={100}
          onchange={handleColorG}
        />

        <Slider
          label="Blue"
          bind:value={monitorState.settings.colorRgb.b}
          min={0}
          max={100}
          onchange={handleColorB}
        />
      </div>
    </div>

    <div class="settings-group">
      <h3>Image Enhancement</h3>
      <Select
        label="Night Vision"
        value={monitorState.settings.nightVision}
        options={[
          { value: "off", label: "Off" },
          { value: "normal", label: "Normal" },
          { value: "strong", label: "Strong" },
          { value: "strongest", label: "Strongest" },
          { value: "ai", label: "AI" },
        ]}
        onchange={handleNightVision}
      />

      <Slider
        label="Black Tuner"
        bind:value={monitorState.settings.blackTuner}
        min={0}
        max={20}
        onchange={handleBlackTuner}
      />

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
    </div>
  {:else}
    <div class="no-monitor">
      <p>No monitor selected</p>
    </div>
  {/if}
</div>

<style>
  .color-view {
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

  .hint {
    font-size: 0.75rem;
    color: #6b7280;
    margin: -0.5rem 0 1rem 0;
  }

  .rgb-sliders {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .no-monitor,
  .loading {
    color: #6b7280;
    text-align: center;
    padding: 3rem;
  }
</style>
