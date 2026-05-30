import { createFileRoute } from "@tanstack/react-router";

// Server route that proxies the WHO Disease Outbreak News RSS feed.
// Avoids browser CORS issues and normalizes the response to JSON.

type DonItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
};

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decode(m[1]) : "";
}

function parseRss(xml: string, limit = 8): DonItem[] {
  const items: DonItem[] = [];
  const re = /<item\b[\s\S]*?<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) && items.length < limit) {
    const block = match[0];
    items.push({
      title: pick(block, "title"),
      link: pick(block, "link"),
      pubDate: pick(block, "pubDate"),
      description: pick(block, "description").slice(0, 320),
    });
  }
  return items;
}

export const Route = createFileRoute("/api/who-don")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await fetch("https://www.who.int/feeds/entity/csr/don/en/rss.xml", {
            headers: { "User-Agent": "EpidemicMonitor/1.0" },
          });
          if (!res.ok) {
            return Response.json({ ok: false, error: `WHO feed ${res.status}`, items: [] }, { status: 200 });
          }
          const xml = await res.text();
          const items = parseRss(xml);
          return Response.json(
            { ok: true, fetchedAt: new Date().toISOString(), items },
            { headers: { "Cache-Control": "public, max-age=300" } },
          );
        } catch (err) {
          return Response.json(
            { ok: false, error: err instanceof Error ? err.message : "fetch failed", items: [] },
            { status: 200 },
          );
        }
      },
    },
  },
});