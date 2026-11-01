/** Leaves evidence if argument validation incorrectly starts the owned fixture worker. */
import { writeFile } from "node:fs/promises";
await writeFile(process.env.SIA_TEST_FIXTURE_MARKER, "ran", {
  flag: "wx",
  mode: 0o600,
});
