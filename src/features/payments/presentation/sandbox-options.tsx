"use client";

interface SandboxOption {
  readonly value: string;
  /** How the value is shown: "4242…4242". */
  readonly display: string;
  /** What it does in the sandbox: "aprueba", "rechaza". */
  readonly outcome: string;
}

interface SandboxOptionsProps {
  readonly title: string;
  readonly options: readonly SandboxOption[];
  readonly onPick: (value: string) => void;
}

/**
 * The test values of the Wompi sandbox as buttons that fill the field, for
 * the demo: one approves, the other declines.
 */
export function SandboxOptions({ title, options, onPick }: SandboxOptionsProps) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span>{title}</span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onPick(option.value)}
          className="rounded border border-slate-300 bg-white px-2 py-0.5 font-mono hover:bg-slate-100"
        >
          {option.display} <span className="font-sans">({option.outcome})</span>
        </button>
      ))}
    </span>
  );
}
