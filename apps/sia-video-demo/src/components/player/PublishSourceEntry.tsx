import { publishEntryState } from "./PublishEntryState";

/**
 * Publish source-entry UI (a mode panel of the player screen). Authenticated
 * app-key sessions land here with an input for a valid Sia share URL and
 * inline validation; the player screen owns the source selection, so this
 * panel is controlled, it renders the hoisted share-URL text and reports each
 * keystroke up through `onInputChange`. The armed source model (object
 * identity, indexer origin, and the `sia://` fetch form) is derived by the
 * same `publishEntryState` the hoisted normalizer uses, so the plaintext seed
 * never enters React state or the UI.
 *
 * The player screen composes the armed source through the player; this panel
 * owns the publish entry point.
 */
export interface PublishSourceEntryProps {
  /** Controlled share-URL text, owned by the hoisted selection state. */
  readonly input: string;
  /** Reports each keystroke up to the hoisted selection state. */
  readonly onInputChange: (input: string) => void;
}

/** Plain play-prompt heading for the publish source-entry panel. */
export const PUBLISH_HEADING = "Play from a Sia share URL";

/** Armed summary label for the canonical 64-hex object key. */
export const PUBLISH_OBJECT_KEY_LABEL = "Object key";

/** Armed summary label for the object's backing indexer URL. */
export const PUBLISH_INDEXER_URL_LABEL = "Indexer URL";

export function PublishSourceEntry({
  input,
  onInputChange,
}: PublishSourceEntryProps) {
  const entry = publishEntryState(input);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="mt-0 mb-3 text-lg">{PUBLISH_HEADING}</h2>
      <label
        className="text-fg-muted flex flex-col gap-1 text-[13px]"
        htmlFor="publish-source-input">
        Sia share URL
      </label>
      <input
        aria-describedby={
          entry.status === "invalid" ? "publish-source-error" : undefined
        }
        className="font-inherit bg-canvas-default border-border-default rounded-md border px-2.5 py-2 text-inherit"
        id="publish-source-input"
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="https://…/objects/<64-hex-key>/shared#encryption_key=…"
        spellCheck={false}
        type="text"
        value={input}
      />
      {entry.status === "invalid" ? (
        <p className="text-danger" id="publish-source-error" role="alert">
          {entry.reason}
        </p>
      ) : null}
      {entry.status === "armed" ? (
        <dl className="m-0 flex flex-col gap-1 text-[13px]">
          <dt className="text-fg-muted">{PUBLISH_OBJECT_KEY_LABEL}</dt>
          <dd>
            <code>{entry.source.objectKey}</code>
          </dd>
          <dt className="text-fg-muted">{PUBLISH_INDEXER_URL_LABEL}</dt>
          <dd>
            <code>{entry.source.indexerUrl}</code>
          </dd>
        </dl>
      ) : null}
    </div>
  );
}
