"use client";

import { useState } from "react";
import { Copy, Download, Trash2, X } from "lucide-react";
import type { DiscussionMarker } from "@/types/game";
import { clearBookmarks, setMarker, toggleBookmark } from "@/lib/engine";
import { getLevel, getQuestion } from "@/lib/metadata";
import { copyText, downloadText, homeUrl } from "@/lib/share";
import { SITE_NAME } from "@/lib/site";
import { act, update, useProgress } from "@/hooks/useProgress";
import { AppShell, Loading, PageTitle } from "./AppShell";
import { ConfirmDialog, Dialog } from "./Dialog";
import { DiscussionMarkers, MARKER_LABELS } from "./DiscussionMarkers";
import { QuestionCard } from "./QuestionCard";
import { showToast } from "./Toast";

function savedAsText(ids: string[]): string {
  const lines = ids.map((id) => {
    const q = getQuestion(id);
    const where = q.gameId === "discover" ? "Discover" : `Together · Level ${getLevel(q.levelId).number}`;
    return `• ${q.text}\n  ${where} · ${q.topic}`;
  });
  return `${SITE_NAME} — Worth another conversation\n\n${lines.join("\n\n")}\n\n${homeUrl()}\n`;
}

export function SavedScreen() {
  const p = useProgress();
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <AppShell title="Saved">
      <PageTitle eyebrow="Saved conversations" title="Worth another conversation." intro="Some conversations are worth coming back to." />
      {!p ? (
        <Loading />
      ) : p.bookmarkedQuestionIds.length === 0 ? (
        <div className="mt-8 rounded-[24px] border-2 border-dashed border-ink/15 px-6 py-10 text-center">
          <p className="font-serif text-xl text-ink">Nothing saved yet.</p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">Tap the bookmark on any card to keep it here for another evening.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary min-h-11 px-4 text-sm"
              onClick={async () => showToast((await copyText(savedAsText(p.bookmarkedQuestionIds))) ? "Copied to clipboard" : "Couldn’t copy")}
            >
              <Copy className="size-4" aria-hidden /> Copy all
            </button>
            <button
              type="button"
              className="btn-secondary min-h-11 px-4 text-sm"
              onClick={() => {
                downloadText("the-two-of-us-saved.txt", savedAsText(p.bookmarkedQuestionIds));
                showToast("Saved as a text file");
              }}
            >
              <Download className="size-4" aria-hidden /> Export .txt
            </button>
            <button type="button" className="btn-ghost ml-auto text-burgundy hover:text-burgundy" onClick={() => setConfirmClear(true)}>
              <Trash2 className="size-4" aria-hidden /> Clear all
            </button>
          </div>

          <ul className="mt-5 flex flex-col gap-3">
            {p.bookmarkedQuestionIds.map((id) => {
              const q = getQuestion(id);
              const marker = p.discussionMarkers[id] as DiscussionMarker | undefined;
              return (
                <li key={id} className="panel flex items-stretch overflow-hidden">
                  <span className="w-1.5 shrink-0" style={{ background: getLevel(q.levelId).accentColor }} aria-hidden />
                  <button type="button" onClick={() => setOpenId(id)} className="flex-1 px-4 py-4 text-left transition hover:bg-ivory/50">
                    <span className="block text-[12px] font-semibold text-ink-faint">
                      {q.gameId === "discover" ? "Discover" : `Together · Level ${getLevel(q.levelId).number}`} · {q.topic}
                    </span>
                    <span className="mt-1 block font-serif text-[17px] leading-snug text-ink">{q.text}</span>
                    {marker && <span className="mt-2 inline-block rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-[12px] font-bold text-ink-soft">{MARKER_LABELS[marker]}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      act((pp) => toggleBookmark(pp, id));
                      showToast("Bookmark removed");
                    }}
                    className="icon-btn m-1 self-center"
                    aria-label={`Remove bookmark: ${q.text}`}
                  >
                    <X className="size-[18px]" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {p && (
        <Dialog open={openId !== null} onClose={() => setOpenId(null)} title="Saved question" hideTitle size="md">
          {openId && (
            <div className="pt-8">
              <QuestionCard
                question={getQuestion(openId)}
                headingLevel="p"
                bookmarked={p.bookmarkedQuestionIds.includes(openId)}
                onToggleBookmark={() => act((pp) => toggleBookmark(pp, openId))}
              />
              <DiscussionMarkers value={p.discussionMarkers[openId]} onChange={(m) => update((pp) => setMarker(pp, openId, m))} />
            </div>
          )}
        </Dialog>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear all bookmarks?"
        body="This removes every saved question on this device. Your progress isn't affected."
        confirmLabel="Clear bookmarks"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          update(clearBookmarks);
        }}
      />
    </AppShell>
  );
}
