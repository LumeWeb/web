interface LoadingScreenProps {
  label: string;
}

export function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <section className="bg-canvas-subtle border-border-default mb-4 rounded-lg border p-5">
      <p className="text-fg-muted mt-0">{label}</p>
    </section>
  );
}
