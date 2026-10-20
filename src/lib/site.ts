export const SITE_NAME = "The Two of Us";
export const SITE_TITLE = "The Two of Us — A Conversation Game for Two";
export const SITE_DESCRIPTION =
  "A playful conversation game for first dates and couples. Five questions at a time, a little Guess & Reveal, and no wrong answers.";
export const TAGLINE = "A little closer, one question at a time.";
export const SUPPORTING = "Five questions at a time. Two perspectives. No wrong answers.";

/**
 * Public base URL, used for canonical and Open Graph URLs.
 * Set NEXT_PUBLIC_SITE_URL in Vercel once you have a custom domain; otherwise
 * Vercel's production URL is used automatically.
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}
