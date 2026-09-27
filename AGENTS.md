# AGENTS.md

Shared rules for every coding agent and PR reviewer in this repo, a pnpm
monorepo with React and TypeScript under `apps/` and `libs/`, and Go services
under `go/`. The "Writing" section applies to every kind of prose an agent produces
here: code comments, commit bodies, PR descriptions, test names, and replies
to users.

## Writing

**Plain words.** Name the real thing: the function, the file, the platform, the
failure. Use the word you would say out loud, and prefer a verb to a noun built
from one ("validates", not "performs validation of"). No abstract sentence
where a fact belongs.

**Accuracy.** A sentence stating a checkable fact (a field list, a state set,
a count, a returned shape, a path, a script name) must match the code. Verify
it or leave it out; a reader trusts a comment over the code.

**Numbers.** A number the code or the contract fixes (a 200ms interval, a
retry cap) passes in a comment, and so does one derived from the mechanism. Do
not hedge them: a fixed 2x stays "2x", not "~2x". A number someone had to run
something to get (a benchmark result, a profile percentage, a measured timing)
fails in a comment; it drifts while still reading as fact. State the mechanism
in the comment and put the measurement in the PR description, where its
conditions live.

**Never write**: delve, leverage, utilize, robust, seamless, crucial, pivotal,
paramount, realm, underscore, foster, elevate, unlock, streamline, boast,
landscape, holistic, bespoke, groundbreaking, testament, synergy, endeavor,
meticulous, nuanced, notably, importantly, essentially, effectively, simply,
basically, additionally, furthermore, moreover, comprehensive, myriad,
plethora, facilitate, elegant, load-bearing, slice, gate, seam, or "landed"
for shipped or merged. No em-dashes, no arrows, no "not just X, it's Y"
pivot, no negative-flip contrast, no rule of three, no over-bolding. Colons,
semicolons, and parentheses carry those jobs.

A word on that list is fine where it is the codebase's own term: a function
name, an API verb, a field, a character. The list targets filler.

### Code comments

Comments carry what the code cannot say. Two kinds only, and both must hold
for a reader with only this file in front of them:

- **A genuine why**: an ordering constraint, race, invariant, platform quirk,
  or past bug, where the reasoning cannot be re-derived from the code. The
  sharpest form names the alternative a reader would reach for and the
  failure it prevents.
- **Surprising behavior**: what the code does where that is not evident from
  the code.

A file, schema, or non-trivial function opens with a header saying what it is
and the problem it solves; non-obvious fields and steps get their comments
inline.

**Length.** Inline comments run one or two lines. Go past two only when the
why rests on a premise a reader of this file cannot see; state that premise
instead of compressing it into an allusion. A header has no line count, but a
sentence that restates the code or softens ends both kinds of comment: cut
it, keep the rest.

**Every sentence carries a new fact.**

- Never open with "This is important because", "The reason for this is",
  "It's worth understanding that", "Note that", "Here we", "In order to",
  or "For clarity".
- Never retell control flow: "first we load the rows, then we filter" is the
  code with worse formatting.
- Never hedge where the code is definite.
- Name the mechanism, do not allude to it: say which functions, states, and
  boundaries are involved and in what order, and where something goes wrong,
  say what a person would see. Three shapes are out: a statement followed by
  a colon and the reveal, a noun phrase standing in for a clause ("the part
  alignment does not explain"), and an inversion that withholds the subject
  until after the point.

Never write in a comment: a restatement of the line beneath; edit-history
narration ("now uses X", "previously"), except in a migration or shim whose
subject is the before-and-after; a justification of ordinary design ("a
helper so call sites don't drift", "DRY", "single source of truth"); a
section divider; a reference to a file, spec, or plan the reader does not
have; or narration of the model's own thought process ("I checked this", "as
discussed earlier").

When refactoring, carry a genuine-why comment with its code. For each comment
a diff deletes, restore it if the why still holds.

**Test names** state the behavior in plain words and match what the test
asserts. "A removed row draws no result mark" is a name; "absence is not
information" is an aphorism.

## Commits, PR descriptions, and replies

Commits and PR descriptions answer the same question: what was wrong, why,
and what the change does about it. Replies to users answer a different one:
what happened, and what the user should do next.

**Commits.** The subject names the effect, not the mechanism. The body is one
or two short paragraphs; bullets only for genuinely separate changes, never
one per file. More technical than a PR description is fine, longer is not.
Describe the final state relative to the base branch.

**PR descriptions.** Write for a reader who opens it cold, with no stack
position, linked spec, plan file, or memory of the conversation; a reference
to "the previous PR" or "as discussed" is a defect. Lead with the
consequence: three or four sentences, what was wrong in
the words someone using the product would use, then the cause, then what the
change does. Name a file or symbol only where the reader needs it, define a
term specific to this codebase on first use, and never claim a behavior you
have not checked.

**Replies to users and review threads.** Lead with the result in one or two
sentences, then only the detail that was asked for. No restating the
question, no hedging. State what you checked and name what you
did not check rather than implying it; a reply that reads as verified when it
was not is a defect.
