# The Two of Us

*A little closer, one question at a time.*

A playful, psychology-informed conversation game for two, built to the v4.0 specification
("Psychology-Informed, Playful by Design"). Two experiences share one engine:

- **Discover** — 10 questions in two five-question levels, for first dates and new sparks.
- **Together** — the original 100 questions as a ten-level journey in four chapters.

Play happens five questions at a time. Each round ends with *Finish for tonight* as the main
action. Guess & Reveal is the signature mechanic, with optional twists alongside. Sparks and
badges reward showing up, never agreement or disclosure. Quiet Mode turns all of that off.

No accounts, no database, no analytics, no AI. Progress stays in the browser. The game never
asks anyone to type an answer.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
npm test               # content integrity, engine, register, boundary tests
npm run build          # runs the tests first, then builds — bad content fails the build
```

## Deploy (GitHub + Vercel, free Hobby tier)

1. Create an empty GitHub repo called `the-two-of-us`.
2. `git remote add origin https://github.com/<you>/the-two-of-us.git && git push -u origin main`
3. On vercel.com, choose **Add New → Project**, import the repo, keep the Next.js defaults and deploy.
4. Optional: once you have a custom domain, set `NEXT_PUBLIC_SITE_URL` so canonical and
   Open Graph links use it.

## Content: where it lives and how to change it

| File | What it is | Rule |
| --- | --- | --- |
| `src/data/questions.ts` | Original 100 Together questions, verbatim from the first brief | **Never edit.** Test-locked to a copy extracted from the PDF. |
| `src/data/discover.ts` | Original 10 Discover questions, verbatim from v3 | **Never edit.** Test-locked. |
| `src/data/review.ts` | **The content-review register.** Revisions, sensitive and opt-in flags, draft classification | The *only* place wording may change. |
| `content/review-register.csv` | The register exported for review: one row per question | Generated. The tests fail if it's stale. |
| `src/data/levels.ts`, `chapters.ts`, `achievements.ts`, `challenges.ts` | Levels, copy, badges, twists | |

**To change a question's wording:**
1. Add an entry to `REVISIONS` in `src/data/review.ts` with `text`, `source`, `reasoning` and
   `status`.
   - `approved_revision` is applied in the app.
   - `proposed_revision` is recorded but not applied. 059, 091 and 092 are in this state now.
2. Run `UPDATE_REGISTER=1 npm test` to regenerate the CSV, then commit both.

The original wording is never overwritten, so every change can be traced back to its source.

**Classification status.** Every question has an evidence class, constructs, references,
intimacy level, relationship stage, risks and a follow-up. These are a **draft** prepared from
the v4 spec (`reviewStatus: "draft"` on all 110). They need review by a qualified relationship
psychologist before any stronger claims are made. References come only from the five in v4 §21,
and entertainment questions carry none.

## Two safeguards built into the architecture

**1. Gamification is separate from psychology.**
- The rewards engine (`src/lib/rewards.ts`) only knows that a voluntary interaction happened,
  by ID: a question answered or skipped, a challenge completed, a bookmark saved.
- It reads `src/lib/catalog.ts`, which holds only IDs and level membership. That catalog is
  built from the level definitions and never loads question text, sensitivity or review data.
- Every question is worth the same. Guess accuracy and agreement aren't inputs, so they can't
  be rewarded.
- `tests/boundaries.test.ts` enforces this. It fails if `rewards.ts` imports anything beyond
  the catalog, if the catalog carries question text, or if reward rules mention sensitivity,
  topics or answers.
- Keep this boundary when a database and AI arrive: answers go in one place and reward events
  in another.

**2. A traceable content register.** Described above.

## Gameplay rules worth knowing

- **Completion.** A question counts only when someone taps *We've answered*. *Skip* is always
  available and never penalised.
- **Levels.** A level is complete when every question has been answered, skipped or
  deliberately left out as a sensitive topic, and at least one was answered.
- **Sparks:**
  - 10 per answered question
  - 25 per round
  - 50 per level
  - 10 per optional challenge (Guess & Reveal or a twist)
- **One reward per key, per journey.** Each reward has a key and is granted once. Refreshing,
  going back, replaying, reshuffling or switching modes can't add more, and the tests prove it.
  *Reset journey* starts a new ledger.
- **Sensitive topics (v4 §5.3):**
  - 18 questions are flagged and labelled "Personal · skip anytime" on the card. None of them
    offers a twist.
  - 8 opt-in questions (062, 063, 072, 080, 083, 089, 095, 096) are left out of every deck
    unless both players choose to include them on the intro screen.
  - Guess & Reveal is turned off on those 8.
  - Settings can exclude them everywhere. Leaving them out never blocks a level or a badge.
- **Quiet Mode** hides Sparks, badges, confetti and non-essential animation. Rewards are still
  recorded silently, so turning it off later loses nothing.

## Structure

```
src/app/                 routes: / start discover together play saved progress settings about recap
src/components/          UI (JourneyMap, PlayScreen, GuessReveal, TwistDialog, SessionIntro, Celebrations…)
src/data/                content: questions, discover, review (register), levels, chapters, achievements, challenges, topics
src/lib/engine.ts        sessions, rounds, levels, sensitive-topic decks — pure functions
src/lib/rewards.ts       Sparks + achievements — IDs only (see boundary above)
src/lib/catalog.ts       ID-only view of the content for the rewards engine
src/lib/validation.ts    storage validation + v1 → v2 migration
src/lib/register.ts      builds the register + CSV
tests/                   Vitest suites; fixtures extracted from the brief PDFs
```

Storage is versioned (v2). v1 saves from the first release keep their bookmarks and notes; v1
"progress" isn't carried over, because v1 counted cards that were only paged past. Corrupted or
hand-edited data is cleaned on load: Spark amounts always come from the policy, never from storage.

## Known limitations

- Two phones don't sync. Each device keeps its own private progress.
- Progress lives in one browser. Clearing site data, private windows or a different browser
  starts fresh.
- All psychological classification is draft. Nothing has had expert review, and nothing may be
  described as clinically validated.
- Not built: sound, the timer, the v3 game variations other than Guess My Answer, and paired
  private answers. The data model leaves room for these.
- Editorial note in the register: revised #010 is now close to #022.
