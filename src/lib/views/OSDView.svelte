<script lang="ts">
  import Slider from "../components/Slider.svelte";
  import Toggle from "../components/Toggle.svelte";
  import Select from "../components/Select.svelte";
  import { monitorState } from "../state/monitors.svelte";
  import { uiState } from "../state/ui.svelte";
  import {
    setOsdTransparency,
    setOsdTimeout,
    setRefreshRateDisplay,
    setRefreshPosition,
    setScreenAssistance,
    setAlarmClock,
    setAlarmPosition,
    setScreenInfo,
  } from "../api/monitor";
  import type { Position, ScreenAssistance, AlarmClock } from "../types";

  async function handleOsdTransparency(value: number) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setOsdTransparency(monitorId, value);
      await monitorState.updateSetting("osdTransparency", value);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleOsdTimeout(value: number) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setOsdTimeout(monitorId, value);
      await monitorState.updateSetting("osdTimeout", value);
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

  async function handleRefreshPosition(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setRefreshPosition(monitorId, value);
      await monitorState.updateSetting("refreshPosition", value as Position);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleScreenAssistance(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setScreenAssistance(monitorId, value);
      await monitorState.updateSetting("screenAssistance", value as ScreenAssistance);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleAlarmClock(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setAlarmClock(monitorId, value);
      await monitorState.updateSetting("alarmClock", value as AlarmClock);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleAlarmPosition(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setAlarmPosition(monitorId, value);
      await monitorState.updateSetting("alarmPosition", value as Position);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleScreenInfo(enabled: boolean) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setScreenInfo(monitorId, enabled);
      await monitorState.updateSetting("screenInfo", enabled);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  const positionOptions = [
    { value: "left_top", label: "Top Left" },
    { value: "right_top", label: "Top Right" },
    { value: "left_bottom", label: "Bottom Left" },
    { value: "right_bottom", label: "Bottom Right" },
  ];
</script>

<div class="osd-view" data-testid="view-osd">
  {#if monitorState.loading}
    <div class="loading" data-testid="loading">Loading settings...</div>
  {:else if monitorState.settings}
    <div class="settings-group">
      <h3>OSD Settings</h3>
      <Slider
        label="OSD Transparency"
        bind:value={monitorState.settings.osdTransparency}
        min={0}
        max={5}
        onchange={handleOsdTransparency}
      />

      <Slider
        label="OSD Timeout"
        bind:value={monitorState.settings.osdTimeout}
        min={0}
        max={30}
        unit="s"
        onchange={handleOsdTimeout}
      />

      <Toggle
        label="Screen Info"
        bind:checked={monitorState.settings.screenInfo}
        onchange={handleScreenInfo}
      />
    </div>

    <div class="settings-group">
      <h3>Refresh Rate Display</h3>
      <Toggle
        label="Show Refresh Rate"
        bind:checked={monitorState.settings.refreshRateDisplay}
        onchange={handleRefreshRateDisplay}
      />

      <Select
        label="Position"
        value={monitorState.settings.refreshPosition}
        options={positionOptions}
        onchange={handleRefreshPosition}
      />
    </div>

    <div class="settings-group">
      <h3>Screen Assistance (Crosshair)</h3>
      <Select
        label="Crosshair Type"
        value={monitorState.settings.screenAssistance}
        options={[
          { value: "off", label: "Off" },
          { value: "red1", label: "Red 1" },
          { value: "red2", label: "Red 2" },
          { value: "red3", label: "Red 3" },
          { value: "red4", label: "Red 4" },
          { value: "red5", label: "Red 5" },
          { value: "red6", label: "Red 6" },
          { value: "white1", label: "White 1" },
          { value: "white2", label: "White 2" },
          { value: "white3", label: "White 3" },
          { value: "white4", label: "White 4" },
          { value: "white5", label: "White 5" },
          { value: "white6", label: "White 6" },
        ]}
        onchange={handleScreenAssistance}
      />
    </div>

    <div class="settings-group">
      <h3>Alarm Clock</h3>
      <Select
        label="Timer"
        value={monitorState.settings.alarmClock}
        options={[
          { value: "off", label: "Off" },
          { value: "1", label: "15 min" },
          { value: "2", label: "30 min" },
          { value: "3", label: "45 min" },
          { value: "4", label: "60 min" },
        ]}
        onchange={handleAlarmClock}
      />

      <Select
        label="Position"
        value={monitorState.settings.alarmPosition}
        options={positionOptions}
        onchange={handleAlarmPosition}
      />
    </div>
  {:else}
    <div class="no-monitor">
      <p>No monitor selected</p>
    </div>
  {/if}
</div>

<style>
  .osd-view {
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
