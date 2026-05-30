interface MigrationNoteProps {
  from: string;
}

export default function MigrationNote({ from }: MigrationNoteProps) {
  return (
    <section className="py-[60px] md:py-[80px]">
      <div className="xl:container px-6">
        <div className="mx-auto max-w-2xl rounded-lg border-l-4 border-content-text bg-content-section-gray p-6 md:p-8 text-center">
          <p className="text-content-text text-base font-medium md:text-lg">
            Switching from {from}?
          </p>
          <p className="text-content-text-muted mt-1 text-sm md:text-base">
            Founding accounts get free migration from your current host.
          </p>
        </div>
      </div>
    </section>
  );
}
