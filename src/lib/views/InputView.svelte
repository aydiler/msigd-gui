<script lang="ts">
  import Toggle from "../components/Toggle.svelte";
  import Select from "../components/Select.svelte";
  import { monitorState } from "../state/monitors.svelte";
  import { uiState } from "../state/ui.svelte";
  import {
    setInput,
    setAutoScan,
    setScreenSize,
    setPowerButton,
    setHdmiCec,
    setKvm,
    setAudioSource,
    setSoundEnable,
  } from "../api/monitor";
  import type { InputSource, ScreenSize, PowerButton, KvmMode, AudioSource } from "../types";

  async function handleInput(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setInput(monitorId, value);
      await monitorState.updateSetting("input", value as InputSource);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleAutoScan(enabled: boolean) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setAutoScan(monitorId, enabled);
      await monitorState.updateSetting("autoScan", enabled);
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

  async function handlePowerButton(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setPowerButton(monitorId, value);
      await monitorState.updateSetting("powerButton", value as PowerButton);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleHdmiCec(enabled: boolean) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setHdmiCec(monitorId, enabled);
      await monitorState.updateSetting("hdmiCec", enabled);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleKvm(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setKvm(monitorId, value);
      await monitorState.updateSetting("kvm", value as KvmMode);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleAudioSource(value: string) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setAudioSource(monitorId, value);
      await monitorState.updateSetting("audioSource", value as AudioSource);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }

  async function handleSoundEnable(enabled: boolean) {
    const monitorId = monitorState.selectedId;
    if (!monitorId) return;
    try {
      await setSoundEnable(monitorId, enabled);
      await monitorState.updateSetting("soundEnable", enabled);
    } catch (e) {
      uiState.showToast(String(e), "error");
    }
  }
</script>

<div class="input-view" data-testid="view-input">
  {#if monitorState.loading}
    <div class="loading" data-testid="loading">Loading settings...</div>
  {:else if monitorState.settings}
    <div class="settings-group">
      <h3>Input Source</h3>
      <Select
        label="Input"
        value={monitorState.settings.input}
        options={[
          { value: "hdmi1", label: "HDMI 1" },
          { value: "hdmi2", label: "HDMI 2" },
          { value: "dp", label: "DisplayPort" },
          { value: "usbc", label: "USB-C" },
        ]}
        onchange={handleInput}
      />

      <Toggle
        label="Auto Scan"
        bind:checked={monitorState.settings.autoScan}
        onchange={handleAutoScan}
      />
    </div>

    <div class="settings-group">
      <h3>Display</h3>
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
      <h3>Audio</h3>
      <Select
        label="Audio Source"
        value={monitorState.settings.audioSource}
        options={[
          { value: "analog", label: "Analog" },
          { value: "digital", label: "Digital" },
        ]}
        onchange={handleAudioSource}
      />

      <Toggle
        label="Sound Enable"
        bind:checked={monitorState.settings.soundEnable}
        onchange={handleSoundEnable}
      />
    </div>

    <div class="settings-group">
      <h3>System</h3>
      <Select
        label="Power Button"
        value={monitorState.settings.powerButton}
        options={[
          { value: "off", label: "Off" },
          { value: "standby", label: "Standby" },
        ]}
        onchange={handlePowerButton}
      />

      <Toggle
        label="HDMI CEC"
        bind:checked={monitorState.settings.hdmiCec}
        onchange={handleHdmiCec}
      />

      <Select
        label="KVM"
        value={monitorState.settings.kvm}
        options={[
          { value: "auto", label: "Auto" },
          { value: "upstream", label: "Upstream" },
          { value: "type_c", label: "USB-C" },
        ]}
        onchange={handleKvm}
      />
    </div>
  {:else}
    <div class="no-monitor">
      <p>No monitor selected</p>
    </div>
  {/if}
</div>

<style>
  .input-view {
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
