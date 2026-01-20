<script lang="ts">
  interface Props {
    label: string;
    checked: boolean;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
  }

  let {
    label,
    checked = $bindable(),
    disabled = false,
    onchange,
  }: Props = $props();

  function handleChange() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleChange();
    }
  }
</script>

<button
  class="toggle"
  class:checked
  class:disabled
  {disabled}
  onclick={handleChange}
  onkeydown={handleKeydown}
  role="switch"
  aria-checked={checked}
  aria-label={label}
>
  <span class="toggle-label">{label}</span>
  <span class="toggle-track">
    <span class="toggle-thumb"></span>
  </span>
</button>

<style>
  .toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0.75rem 0;
    background: none;
    border: none;
    color: #e5e7eb;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .toggle.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-track {
    width: 44px;
    height: 24px;
    background: #374151;
    border-radius: 12px;
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .toggle.checked .toggle-track {
    background: #3b82f6;
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle.checked .toggle-thumb {
    transform: translateX(20px);
  }

  .toggle:focus-visible .toggle-track {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
</style>
