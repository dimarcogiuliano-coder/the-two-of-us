import Link from "next/link";
import { REFERENCES } from "@/data/review";
import { AppShell, PageTitle } from "./AppShell";

const RULES: [string, string][] = [
  ["No wrong answers.", "There is no correct way to feel about a question."],
  ["Be curious, not defensive.", "Try to understand the reasoning behind your partner’s response."],
  ["Ask why.", "Sometimes the real conversation starts after the first answer."],
  ["You can pass.", "Either of you may skip a question without explanation. Skipping never costs you anything."],
  ["You don’t need to agree.", "The aim is understanding, not winning an argument."],
  ["Take your time.", "One question that starts a real conversation beats twenty rushed answers."],
];

export function AboutScreen() {
  return (
    <AppShell title="About">
      <PageTitle eyebrow="How it works" title="A game for two, not a test." />
      <blockquote className="mt-6 border-l-4 border-burgundy pl-4 font-serif text-xl italic leading-snug text-ink">
        We&rsquo;re not building an app you can&rsquo;t put down. We&rsquo;re building one that makes you want to put your
        phones down and talk.
      </blockquote>

      <Section id="how" title="How to play">
        <p>
          Pick <strong>Discover</strong> for first dates and new sparks, or <strong>Together</strong> for a 100-question
          journey across ten levels. Questions come five at a time; every round ends with a natural place to stop.
        </p>
        <p>
          Put one phone between you. Read the question, both answer out loud, then tap <em>We&rsquo;ve answered</em> — or
          <em> Skip</em>. Bookmark anything worth another conversation.
        </p>
      </Section>

      <ol className="mt-6 flex flex-col divide-y-2 divide-ink/[0.06] border-y-2 border-ink/[0.06]">
        {RULES.map(([t, b], i) => (
          <li key={t} className="flex gap-4 py-4">
            <span className="w-7 shrink-0 font-serif text-lg italic text-burgundy" aria-hidden>
              {["i", "ii", "iii", "iv", "v", "vi"][i]}.
            </span>
            <p>
              <strong className="block font-serif text-lg font-[450] text-ink">{t}</strong>
              <span className="text-[15px] leading-relaxed text-ink-soft">{b}</span>
            </p>
          </li>
        ))}
      </ol>

      <Section id="guess" title="Guess & Reveal">
        <p>
          Before answering, each of you quietly predicts what the other will say. Lock in, count down, flip the card, then
          answer for real. There are no points for being right — the wrong guesses are usually the best part, and nobody is
          expected to know everything about anyone.
        </p>
        <p>Want a curveball? <em>Add a twist</em> offers an optional challenge. Either of you can say no.</p>
      </Section>

      <Section id="sparks" title="Sparks and badges">
        <p>
          You earn Sparks for exploring: 10 for a question you answer, 25 for a round, 50 for a level, 10 for an optional
          challenge. They can&rsquo;t be bought, never expire and are never taken away. They&rsquo;re never given for
          agreeing, guessing right, or sharing anything sensitive — the part of the game that counts Sparks can&rsquo;t even
          see the questions. There are no streaks and no leaderboards. Prefer it calmer? Turn on <em>Quiet Mode</em> in
          Settings.
        </p>
      </Section>

      <Section id="sensitive" title="Sensitive topics">
        <p>
          A handful of Together questions touch on children, money, sex, unresolved disagreements and dealbreakers. They
          only appear if you both opt in for that deck, and you can leave them out entirely in Settings. Leaving them out
          never blocks your progress.
        </p>
        <p>
          If a conversation stops feeling okay, stop. If a relationship doesn&rsquo;t feel safe, this game isn&rsquo;t the
          right tool — please talk to someone you trust or a local support service, and in an emergency contact local
          emergency services.
        </p>
      </Section>

      <Section id="two-phones" title="Two phones">
        <p>
          Each phone keeps its own progress, privately — they don&rsquo;t connect. Pick the same level on both to stay in
          step.
        </p>
      </Section>

      <Section id="privacy" title="Privacy">
        <p className="font-serif text-lg text-ink">Your conversations belong to you.</p>
        <p>
          There are no accounts, no analytics and no ads. The game never asks you to type an answer. Your progress,
          bookmarks and notes are stored only in this browser on this device, and you can delete them any time in{" "}
          <Link href="/settings" className="font-bold text-burgundy underline underline-offset-2">
            Settings
          </Link>
          . Sharing the game shares a plain link to the home page — nothing about your progress.
        </p>
      </Section>

      <Section id="psychology" title="The thinking behind it">
        <p>
          Thoughtfully designed using insights from relationship psychology: gentle, reciprocal self-disclosure; feeling
          heard; knowing each other&rsquo;s inner world; and respecting each person&rsquo;s autonomy. Many questions are
          simply for fun — playfulness matters too.
        </p>
        <p>
          These ideas inform the design. The game itself hasn&rsquo;t been clinically tested, isn&rsquo;t a compatibility
          assessment, and isn&rsquo;t a substitute for counselling or professional support.
        </p>
        <details className="mt-2 rounded-2xl bg-ink/[0.04] p-4">
          <summary className="cursor-pointer font-bold text-ink">Research that informed the design</summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px]">
            {Object.values(REFERENCES).map((r) => (
              <li key={r} className="[overflow-wrap:anywhere]">
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[12px]">These support general ideas and design choices. They are not validation of this game or its questions.</p>
        </details>
      </Section>

      <div className="mt-10">
        <Link href="/start" className="btn-primary w-full">
          Let&rsquo;s play
        </Link>
      </div>
    </AppShell>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-8 scroll-mt-20 space-y-3 text-[15px] leading-relaxed text-ink-soft">
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      {children}
    </section>
  );
}
