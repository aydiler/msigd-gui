<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    label: string;
    value: string;
    options: Option[];
    disabled?: boolean;
    onchange?: (value: string) => void;
  }

  let {
    label,
    value = $bindable(),
    options,
    disabled = false,
    onchange,
  }: Props = $props();

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    value = target.value;
    onchange?.(value);
  }
</script>

<div class="select-container" data-testid="select-{label.toLowerCase().replace(/\s+/g, '-')}">
  <label for={label}>{label}</label>
  <select
    id={label}
    data-testid="select-input-{label.toLowerCase().replace(/\s+/g, '-')}"
    {value}
    {disabled}
    onchange={handleChange}
    class="select"
  >
    {#each options as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>

<style>
  .select-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
  }

  label {
    color: #e5e7eb;
    font-size: 0.875rem;
  }

  .select {
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    background: #374151;
    border: 1px solid #4b5563;
    border-radius: 6px;
    color: #f3f4f6;
    font-size: 0.875rem;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1rem;
  }

  .select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
