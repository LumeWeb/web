interface PausedStatusProps {
  pausedAt: string;
}

export function PausedStatus({ pausedAt }: PausedStatusProps) {
  const formattedDate = new Date(pausedAt).toLocaleDateString();

  return (
    <div className="mt-4">
      <div className="flex justify-between">
        <span className="text-muted-foreground text-sm">Status</span>
        <span className="text-amber-500 font-medium">
          Paused since {formattedDate}
        </span>
      </div>
    </div>
  );
}
