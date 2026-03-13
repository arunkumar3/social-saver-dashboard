interface BookmarkData {
  full_text: string;
  type: string;
  author: string;
  author_handle: string;
  title: string;
}

export function buildPrompt(bookmark: BookmarkData): string {
  return `You are categorizing a Twitter/X bookmark for a developer and trader.

CATEGORIES (pick one):
- AI/ML & Tech — AI tools, ML techniques, coding, dev tools, tech news
- Trading & Finance — market analysis, trading setups, strategies, financial news
- AI Project Ideas — buildable project concepts, side project inspiration, startup ideas
- Career & Productivity — career advice, workflows, productivity systems, learning
- Other: [your label] — if none of the above fit, create a short descriptive label (2-4 words)

CONTENT:
Type: ${bookmark.type}
Author: ${bookmark.author} (${bookmark.author_handle})
Text: ${bookmark.full_text}

Respond ONLY with valid JSON, no markdown, no backticks:
{"category": "exact category name from above", "action_item": "one concrete next step starting with a verb, or null", "key_insights": ["insight 1", "insight 2", "insight 3"]}

Rules for action_item:
- Start with a verb: Try, Build, Test, Research, Apply, Implement, Read, Watch, etc.
- Specific enough to act on without re-reading the original
- null if content is entertainment or general news with no actionable takeaway

Rules for key_insights:
- 2-3 bullet points, each under 20 words
- Capture what you'd tell someone in 10 seconds`;
}
