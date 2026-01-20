<script lang="ts">
  interface Props {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    onchange?: (value: number) => void;
  }

  let {
    label,
    value = $bindable(),
    min = 0,
    max = 100,
    step = 1,
    unit = "",
    disabled = false,
    onchange,
  }: Props = $props();

  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = parseInt(target.value, 10);

    // Debounce to avoid flooding msigd with commands
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onchange?.(value);
    }, 150);
  }
</script>

<div class="slider-container">
  <div class="slider-header">
    <label for={label}>{label}</label>
    <span class="value">{value}{unit}</span>
  </div>
  <input
    type="range"
    id={label}
    {min}
    {max}
    {step}
    {value}
    {disabled}
    oninput={handleInput}
    class="slider"
  />
</div>

<style>
  .slider-container {
    margin-bottom: 1rem;
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  label {
    color: #e5e7eb;
  }

  .value {
    color: #9ca3af;
    font-family: monospace;
  }

  .slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #374151;
    appearance: none;
    cursor: pointer;
    outline: none;
  }

  .slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
  }

  .slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
  }

  .slider:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .slider:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }
</style>
