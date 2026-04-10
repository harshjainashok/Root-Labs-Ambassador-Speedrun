const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, HeadingLevel,
  ExternalHyperlink, PageBreak, Footer, PageNumber, NumberFormat,
  TableOfContents, Header, Tab, TabStopPosition, TabStopType,
  LevelFormat, convertInchesToTwip
} = require("docx");
const fs = require("fs");

// ── Constants ──
const AUTHOR = "Harsh Ashok";
const CLAUDE_LINK = "https://claude.ai/share/04bf274c-233b-4f87-8fcc-95dcc1f9f8d4";
const GITHUB_LINK = "https://github.com/harshjainashok/Root-Labs-Ambassador-Speedrun";
const M4_PAGES_LINK = "https://harshjainashok.github.io/Root-Labs-Ambassador-Speedrun/mission4/";
const M6_PAGES_LINK = "https://harshjainashok.github.io/Root-Labs-Ambassador-Speedrun/mission6-dashboard/";
const M5_PROMPT_LINK = "https://github.com/harshjainashok/Root-Labs-Ambassador-Speedrun/blob/main/mission5-activation-tool.md";
const M6_PROMPT_LINK = "https://github.com/harshjainashok/Root-Labs-Ambassador-Speedrun/blob/main/mission6-content-brief.md";
const NAVY = "1B3A5C";
const AMBER_FILL = "FFF3CD";
const LIGHT_GRAY = "F5F5F5";
const BOX_FILL = "F8F8F8";
const MONO_FILL = "F0F0F0";
const BORDER_GRAY = "CCCCCC";

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY };
const allThinBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

// ── Helpers ──
function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    borders: allThinBorders,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })],
      spacing: { before: 40, after: 40 },
    })],
  });
}

function dataCell(text, width, fill) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    borders: allThinBorders,
    children: [new Paragraph({
      children: [new TextRun({ text, font: "Arial", size: 20 })],
      spacing: { before: 40, after: 40 },
    })],
  });
}

function dataCellBold(text, width, fill, textColor) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    borders: allThinBorders,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, font: "Arial", size: 20, color: textColor })],
      spacing: { before: 40, after: 40 },
    })],
  });
}

function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, font: "Arial", size: 26 })],
    spacing: { before: 280, after: 100 },
  });
}

function heading2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, font: "Arial", size: 24 })],
    spacing: { before: 200, after: 80 },
  });
}

function bodyText(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22 })],
    spacing: { after: 80 },
  });
}

function italicGray(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 20, italics: true, color: "999999" })],
    spacing: { before: 60, after: 60 },
  });
}

function footerWithLink(prefix, link) {
  return new Paragraph({
    children: [
      new TextRun({ text: prefix, font: "Arial", size: 20, italics: true, color: "999999" }),
      new ExternalHyperlink({ children: [
        new TextRun({ text: link, font: "Arial", size: 20, italics: true, color: "4472C4", underline: {} }),
      ], link }),
    ],
    spacing: { before: 60, after: 60 },
  });
}

function footerWithLinks(parts) {
  // parts: array of { text, link } or { text } (plain)
  const children = [];
  parts.forEach((p, i) => {
    if (i > 0) children.push(new TextRun({ text: "  |  ", font: "Arial", size: 20, italics: true, color: "999999" }));
    if (p.link) {
      children.push(new ExternalHyperlink({
        children: [new TextRun({ text: p.text, font: "Arial", size: 20, italics: true, color: "4472C4", underline: {} })],
        link: p.link,
      }));
    } else {
      children.push(new TextRun({ text: p.text, font: "Arial", size: 20, italics: true, color: "999999" }));
    }
  });
  return new Paragraph({ children, spacing: { before: 60, after: 60 } });
}

function shadedBox(lines) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: BOX_FILL, type: ShadingType.CLEAR },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY },
          left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY },
          right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY },
        },
        children: lines.map(l => new Paragraph({
          children: Array.isArray(l) ? l : [new TextRun({ text: l, font: "Arial", size: 20 })],
          spacing: { after: 60 },
        })),
      })],
    })],
  });
}

function monoBox(lines) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: MONO_FILL, type: ShadingType.CLEAR },
        borders: allThinBorders,
        children: lines.map(l => new Paragraph({
          children: [new TextRun({ text: l, font: "Arial", size: 20 })],
          spacing: { after: 40 },
        })),
      })],
    })],
  });
}

function hrLine() {
  return new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY } },
    spacing: { after: 100 },
  });
}

// ── Top 8 Data ──
const top8 = [
  { handle: "@tuti_fit", followers: "9,184", er: "28.90%*", score: "3.00", email: "tutifit@yahoo.com",
    why: "Perfect score \u2014 fitness/wellness creator in the micro tier, posting daily, owns a wellness brand, and has email in bio. Closest thing to guaranteed activation.",
    risk: "ER inflated by 2024 viral posts (10K likes). Recent posts average ~30 interactions (0.33% true ER). Content partly in Spanish \u2014 may limit US audience reach." },
  { handle: "@ana.laura.624", followers: "413", er: "5.41%", score: "2.10", email: "Missing",
    why: "Highest genuine engagement rate (5.41%) with consistent posting every 4-5 days. \"Beauty from within\" positioning maps directly to supplement storytelling.",
    risk: "Sub-nano (413 followers) means low reach. Content in Spanish \u2014 Root Labs would need to confirm US Hispanic audience targeting makes sense." },
  { handle: "@atasteofcherie", followers: "9,238", er: "0.19%", score: "1.90", email: "Missing",
    why: "RN + Celebrity Health Coach + Author is the credibility trifecta for a supplement brand. Active micro account (9.2K) posting daily. Professional background gives content clinical authority Root Labs needs.",
    risk: "0.19% ER on 9.2K followers is very low \u2014 audience isn't engaging with current content, or follower base is partially inactive." },
  { handle: "@yourholistic.bff", followers: "41,726", er: "31.25%*", score: "1.75", email: "Missing",
    why: "Integrative Nurse Practitioner specializing in gut health, detox, and hormones \u2014 Root Labs' exact category. Business account, 41.7K followers, and founder of @eunoiadmv health brand. Niche alignment is unmatched.",
    risk: "41.7K is the largest account in the top 8 \u2014 may command rates above $600 budget. Recent ER (excluding 74K viral post) is ~0.10%, suggesting audience fatigue or follower quality issues." },
  { handle: "@vanessafoundit", followers: "491", er: "0.58%", score: "1.70", email: "Missing",
    why: "\"50-year-old mom aging in public, testing what actually works\" is a compelling content angle for supplement testimonials. Anti-aging + energy niche maps directly to Root Labs' shilajit positioning. Active poster.",
    risk: "Sub-nano (491 followers) with 0.58% ER. Very small account with limited reach. The bet is on content quality and growth potential, not current audience size." },
  { handle: "@mckenziewren_", followers: "270", er: "2.10%", score: "1.65", email: "mckenziewcollab@gmail.com",
    why: "Email in bio signals she's actively seeking brand partnerships. 2.10% ER shows real audience interaction. Collab-ready infrastructure (Linktree, dedicated collab email) means low activation friction.",
    risk: "Zero wellness niche fit \u2014 content is home finds + TikTok shop favorites. Only 270 followers and 8 posts total. She'd need to pivot content to wellness, which is a big ask." },
  { handle: "@viralbliss25", followers: "4,556", er: "0.01%", score: "1.60", email: "Missing",
    why: "OB Nurse + Content Creator + Amazon Influencer checks three boxes: medical credibility, content creation skill, and existing affiliate commerce experience. Micro tier (4.6K) at a good range for ambassador economics.",
    risk: "0.01% ER is a major red flag \u2014 near-zero engagement on 4.5K followers suggests bought followers or completely disengaged audience. Posts daily but nobody interacts. Activation risk is very high." },
  { handle: "@fuelforfoodd", followers: "10,673", er: "1.73%", score: "1.50", email: "Missing",
    why: "Verified account with 10.7K followers and daily posting shows platform legitimacy and consistency. 1.73% ER is decent for the tier. High content velocity (1,968 posts).",
    risk: "Zero wellness niche fit \u2014 \"Certified Hitmaker\" in media/news category. No bio email, no website. Content would need a complete pivot for Root Labs. Weakest pick \u2014 could be swapped for @heather_dedeaux (#9, Health/Beauty, 4.2K) if niche fit is weighted more heavily." },
];

// ── Mission 2 Messages (verbatim) ──
const m2_tuti_outreach = `Hey Tuti,

Saw your morning routine reel \u2014 the way you tie fitness to mindset is exactly the energy we're looking for. I run ambassador partnerships at Root Labs. We make Himalayan Shilajit gummies \u2014 4,000mg, no resin mess. You'd get free product plus 15% commission on every sale you drive. Given you already run @tuttifit.wellness, this feels like a natural overlap. Worth a 10-minute call?

\u2014 [Name]`;

const m2_tuti_followup = `Hey Tuti \u2014 totally fine if the timing's off. One thing I should've added: Alpha Gummies just hit #4 in Trace Mineral Supplements on Amazon with 10K+ buys last month. There's real demand already \u2014 you'd be walking into proof, not a gamble. Still open to a quick call if it makes sense.

\u2014 [Name]`;

const m2_lux_outreach = `Hey Lux,

RN + celebrity health coach is a rare combo \u2014 most supplement brands want the follower count, not the credential. We care about the credential. Root Labs makes Himalayan Shilajit gummies with KSM-66 Ashwagandha, and every batch ships with a third-party Certificate of Analysis. Given your clinical background, I figured you'd want to vet the product before deciding. Free product + 15% commission. Open to it?

\u2014 [Name]`;

const m2_lux_followup = `Hey Lux \u2014 circling back in case this got buried. One detail I didn't mention: you can pull any batch's Certificate of Analysis directly on our site \u2014 heavy metals, pesticides, microbials. For someone with your background, that's probably table stakes anyway. Still happy to send product so you can evaluate it yourself before committing to anything.

\u2014 [Name]`;

const m2_mckenzie_outreach = `Hey McKenzie,

You're already deep in TikTok Shop \u2014 you know exactly how the affiliate side works. Root Labs makes Himalayan Shilajit gummies, and shilajit is trending hard on TikTok right now. Free product + 15% commission on every sale you drive. We're not asking you to pivot your whole account \u2014 one honest "tried this" post is enough to start. Interested?

\u2014 [Name]`;

const m2_mckenzie_followup = `Hey McKenzie \u2014 no worries if this doesn't fit. One thing worth knowing: shilajit is one of the fastest-moving supplement categories on TikTok right now, and Root Labs already has 400K+ units sold through TikTok Shop to prove the demand is real. For someone already comfortable with the platform, the conversion side isn't a guess. Happy to send product first \u2014 you try it, then decide if you want to post.

\u2014 [Name]`;

// ── Mission 3 Messages (verbatim) ──
const m3_reply = `Hey Tuti,

Glad it landed. Flat $2,500 is outside what we can do right now \u2014 we're a funded startup, not a legacy brand, so base budgets are capped at $600. But that's not the full picture.

At 15% commission, $4,000 in monthly sales gets you $600 in commission on top of the $600 base \u2014 that's $1,200 total, no ceiling. Our Alpha Gummies are already at 10K+ buys a month on Amazon. The demand is there.

Product ships same week you're onboarded.

Two options: $600 base + 15% commission, or we part on good terms. Which works for you?

\u2014 [Name]`;

const m3_tactics = [
  "Offer a 60-day performance pilot. $600 base for two months. If she hits $3,000 in tracked sales, the rate reopens. Puts the negotiation back in her hands and gives her a number to chase.",
  "Reframe commission as uncapped, not capped. \"There's no ceiling \u2014 if you drive $10K in sales, that's $1,500 in commission on top of base.\" The conversation shifts from \"what's your flat rate\" to \"what can you realistically drive\" \u2014 a better frame for someone who already runs a wellness business.",
  "Swap cash for product value. If $600 base is the hard floor, offer $600 base + $200 in free product credit monthly. Total perceived value hits $800 without breaking the budget ceiling. Useful if she already buys supplements regularly.",
  "Let her walk and keep the door open. Reply: \"Totally understand \u2014 let's revisit in 90 days when we have more commission data from our current cohort.\" Scarcity and social proof from other ambassadors is often what converts a no into a yes three months later.",
];

// ── Mission 5 Sample Data ──
const m5_sampleInput = `| Name | Handle | Niche | Days Since Signing | Status | Notes |
| Priya Mehta | @priyawellness | Ayurveda / yoga | 2 | SIGNED | Excited in onboarding call |
| Jake Torres | @jaketfitness | Gym / supplements | 6 | SIGNED | No response to Day 3 nudge |
| Megan Liu | @meganmindful | Meditation / clean eating | 1 | DRAFT RECEIVED | Sent a Reel concept, needs feedback |
| Carlos Diaz | @carlos.eats.clean | Meal prep / fitness | 11 | SIGNED | Ghosted two nudges |
| Aisha Patel | @aishaglows | Skincare / holistic health | 3 | PRODUCT SHIPPED | Product delivered yesterday |`;

const m5_sampleOutput = `PRIORITY ACTION LIST

RED \u2014 Act today or lose them
- Jake Torres (@jaketfitness) \u2014 6 days in SIGNED, no response to last nudge. One more attempt before breakup.
- Carlos Diaz (@carlos.eats.clean) \u2014 11 days in SIGNED, ghosted twice. Flag as GHOST.

AMBER \u2014 Nudge today
- Priya Mehta (@priyawellness) \u2014 2 days in SIGNED. Energy is fresh from onboarding. Send content hook now.
- Megan Liu (@meganmindful) \u2014 Draft received, needs review + feedback to keep momentum.

GREEN \u2014 On track
- Aisha Patel (@aishaglows) \u2014 Product shipped, delivered yesterday. Check in at Day 3 post-delivery.

NUDGE MESSAGES

Priya Mehta (AMBER \u2014 Day 2 nudge)
Hey Priya \u2014 quick thought for your first post. You've done that Ayurvedic morning routine content before. What if you dropped our Shilajit gummies into that flow? Just a 15-sec clip of your actual routine. I can send product as soon as you share a rough concept.

Jake Torres (RED \u2014 final attempt before breakup)
Jake \u2014 wanted to send product this week so you can try it before your next gym content day. Can you shoot me a rough idea for a post by Friday? Even a sentence works. If the timing's off, no stress \u2014 we can revisit later.

Megan Liu (AMBER \u2014 draft feedback)
Megan, the Reel concept looks great. The meditation-to-morning-supplement angle is exactly right. One tweak: mention it's sugar-free \u2014 your audience will care about that. Approved on our end. Shipping product today.

Carlos Diaz (RED \u2014 breakup message)
Carlos \u2014 looks like the timing isn't right, and that's completely fine. I'll keep your spot warm. If you want to revisit in a month or two, just DM me and we'll pick up where we left off. No hard feelings.

ESCALATION FLAGS

GHOST: Carlos Diaz (@carlos.eats.clean)
- 11 days in SIGNED. Two nudges unanswered.
- Action: Remove from active pipeline. Do NOT ship product. Add to 30-day re-engagement list.
- Note: Do not send further messages until the 30-day cool-off.`;

// ── Build Document ──
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22 },
      },
    },
  },
  numbering: {
    config: [{
      reference: "tactics-numbering",
      levels: [{
        level: 0,
        format: LevelFormat.DECIMAL,
        text: "%1.",
        alignment: AlignmentType.START,
        style: { paragraph: { indent: { left: 360, hanging: 360 } } },
      }],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1008, right: 1008, bottom: 1008, left: 1008 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: `Ambassador Speedrun \u2013 ${AUTHOR}  |  Confidential`, font: "Arial", size: 18, color: "999999" }),
            new TextRun({ text: "\t", font: "Arial", size: 18 }),
            new TextRun({ text: "Page ", font: "Arial", size: 18, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" }),
            new TextRun({ text: " of ", font: "Arial", size: 18, color: "999999" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 18, color: "999999" }),
          ],
          tabStops: [{ type: TabStopType.RIGHT, position: 9360 }],
        })],
      }),
    },
    children: [
      // ═══════════════════════════════════════
      // HEADER BLOCK
      // ═══════════════════════════════════════
      new Paragraph({
        children: [new TextRun({ text: `Ambassador Speedrun \u2013 ${AUTHOR}`, bold: true, font: "Arial", size: 28 })],
      }),
      new Paragraph({
        children: [new TextRun({ text: "Mesa School of Business  |  Root Labs \u00d7 Mosaic Wellness", font: "Arial", size: 20, color: "666666" })],
        spacing: { after: 40 },
      }),
      new Paragraph({
        children: [
          new ExternalHyperlink({
            children: [new TextRun({ text: "Claude AI \u2192", font: "Arial", size: 20, color: "4472C4", underline: {} })],
            link: CLAUDE_LINK,
          }),
          new TextRun({ text: "  |  ", font: "Arial", size: 20, color: "666666" }),
          new ExternalHyperlink({
            children: [new TextRun({ text: "GitHub Repo \u2192", font: "Arial", size: 20, color: "4472C4", underline: {} })],
            link: GITHUB_LINK,
          }),
        ],
        spacing: { after: 40 },
      }),
      hrLine(),

      // ═══════════════════════════════════════
      // MISSION 1 \u2014 THE SCOUT
      // ═══════════════════════════════════════
      heading1("Mission 1 \u2014 The Scout"),
      bodyText("Scraped 14 Instagram profiles via Apify. Scored on 5 weighted dimensions. Selected top 8 by activation probability."),

      heading2("Scoring Framework"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        rows: [
          new TableRow({ children: [headerCell("Dimension", 2400), headerCell("Weight", 900), headerCell("Rationale", 6060)] }),
          new TableRow({ children: [dataCell("Engagement Rate", 2400), dataCell("30%", 900), dataCell("Predicts content trust \u2014 high followers with 1% engagement = ghost risk", 6060)] }),
          new TableRow({ children: [dataCell("Content Recency", 2400, LIGHT_GRAY), dataCell("25%", 900, LIGHT_GRAY), dataCell("Days since last post predicts post-signing activation", 6060, LIGHT_GRAY)] }),
          new TableRow({ children: [dataCell("Wellness Niche Fit", 2400), dataCell("20%", 900), dataCell("Supplement brand needs aligned audience, not general lifestyle", 6060)] }),
          new TableRow({ children: [dataCell("Audience Tier Fit", 2400, LIGHT_GRAY), dataCell("15%", 900, LIGHT_GRAY), dataCell("Micro/mid preferred \u2014 macro won't close at $600/month", 6060, LIGHT_GRAY)] }),
          new TableRow({ children: [dataCell("Contact Accessibility", 2400), dataCell("10%", 900), dataCell("Email in bio = lower friction, higher professionalism signal", 6060)] }),
        ],
      }),

      heading2("Top 8 Selected"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        rows: [
          new TableRow({ children: [headerCell("Handle", 1800), headerCell("Followers", 1400), headerCell("Eng. Rate", 1200), headerCell("Score", 1000), headerCell("Email Status", 3960)] }),
          ...top8.map((a, i) => new TableRow({
            children: [
              dataCell(a.handle, 1800, i % 2 ? LIGHT_GRAY : undefined),
              dataCell(a.followers, 1400, i % 2 ? LIGHT_GRAY : undefined),
              dataCell(a.er, 1200, i % 2 ? LIGHT_GRAY : undefined),
              dataCell(a.score, 1000, i % 2 ? LIGHT_GRAY : undefined),
              dataCell(a.email, 3960, i % 2 ? LIGHT_GRAY : undefined),
            ],
          })),
        ],
      }),

      // Why selected / Risk for each ambassador
      ...top8.flatMap(a => [
        new Paragraph({
          children: [
            new TextRun({ text: `${a.handle} \u2014 `, bold: true, font: "Arial", size: 20 }),
            new TextRun({ text: `Why selected: ${a.why}`, font: "Arial", size: 20 }),
          ],
          spacing: { before: 60, after: 20 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Risk: ", bold: true, font: "Arial", size: 20 }),
            new TextRun({ text: a.risk, font: "Arial", size: 20 }),
          ],
          spacing: { after: 60 },
        }),
      ]),

      footerWithLink("Claude Code + Apify session: ", GITHUB_LINK),

      // ═══════════════════════════════════════
      // MISSION 2 \u2014 THE FIRST LINE
      // ═══════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      heading1("Mission 2 \u2014 The First Line"),
      bodyText("Ambassadors: @tuti_fit (email)  \u2022  @atasteofcherie (DM)  \u2022  @mckenziewren_ (email)"),

      heading2("@tuti_fit (TutiCruz) \u2014 Email"),
      shadedBox([m2_tuti_outreach]),
      new Paragraph({
        children: [
          new TextRun({ text: "48-Hour Follow-Up:", bold: true, font: "Arial", size: 20 }),
        ],
        spacing: { before: 80, after: 40 },
      }),
      shadedBox([m2_tuti_followup]),

      heading2("@atasteofcherie (Lux Cherie) \u2014 Instagram DM"),
      shadedBox([m2_lux_outreach]),
      new Paragraph({
        children: [
          new TextRun({ text: "48-Hour Follow-Up:", bold: true, font: "Arial", size: 20 }),
        ],
        spacing: { before: 80, after: 40 },
      }),
      shadedBox([m2_lux_followup]),

      heading2("@mckenziewren_ (McKenzie) \u2014 Email"),
      shadedBox([m2_mckenzie_outreach]),
      new Paragraph({
        children: [
          new TextRun({ text: "48-Hour Follow-Up:", bold: true, font: "Arial", size: 20 }),
        ],
        spacing: { before: 80, after: 40 },
      }),
      shadedBox([m2_mckenzie_followup]),

      footerWithLink("Claude.ai session: ", CLAUDE_LINK),

      // ═══════════════════════════════════════
      // MISSION 3 \u2014 THE STANDOFF
      // ═══════════════════════════════════════
      heading1("Mission 3 \u2014 The Standoff"),
      bodyText("@tuti_fit replied: \"Love the brand! My rate is $2,500/month flat, I don't do commission, and I need free product shipped by Friday.\""),

      heading2("Our Reply"),
      shadedBox([m3_reply]),

      heading2("If She Still Says No \u2014 4 Tactical Moves"),
      ...m3_tactics.map((t, i) => new Paragraph({
        children: [new TextRun({ text: t, font: "Arial", size: 20 })],
        numbering: { reference: "tactics-numbering", level: 0 },
        spacing: { after: 60 },
      })),

      footerWithLink("Claude.ai session: ", CLAUDE_LINK),

      // ═══════════════════════════════════════
      // MISSION 4 \u2014 THE MATH
      // ═══════════════════════════════════════
      heading1("Mission 4 \u2014 The Math"),
      bodyText("Baseline: 1\u20132% reply rate. 0 of 7 planned signings closed last week. Funnel math built on reality, not targets."),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        rows: [
          new TableRow({ children: [headerCell("Stage", 3600), headerCell("Count", 1800), headerCell("Conversion Rate", 3960)] }),
          new TableRow({ children: [dataCell("Outreach Sent", 3600), dataCell("500", 1800), dataCell("\u2014", 3960)] }),
          new TableRow({ children: [dataCell("Reply Received", 3600, LIGHT_GRAY), dataCell("25", 1800, LIGHT_GRAY), dataCell("5%", 3960, LIGHT_GRAY)] }),
          new TableRow({ children: [dataCell("Call / Negotiation Started", 3600), dataCell("13", 1800), dataCell("52%", 3960)] }),
          new TableRow({ children: [dataCell("Agreement Signed", 3600, LIGHT_GRAY), dataCell("4", 1800, LIGHT_GRAY), dataCell("31%", 3960, LIGHT_GRAY)] }),
          new TableRow({ children: [dataCell("First Post Live", 3600), dataCell("1", 1800), dataCell("25%", 3960)] }),
        ],
      }),

      // Fragile Stage callout
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        rows: [new TableRow({
          children: [new TableCell({
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: AMBER_FILL, type: ShadingType.CLEAR },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: "F4A261" },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: "F4A261" },
              left: { style: BorderStyle.SINGLE, size: 2, color: "F4A261" },
              right: { style: BorderStyle.SINGLE, size: 2, color: "F4A261" },
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Most Fragile Stage: Agreement Signed \u2192 First Post Live", bold: true, font: "Arial", size: 22 })],
                spacing: { after: 60 },
              }),
              new Paragraph({
                children: [new TextRun({ text: "Root Labs shipped product before any content commitment existed. Free product without a draft gate is charity, not a program.", font: "Arial", size: 20 })],
                spacing: { after: 40 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Fix: ", bold: true, font: "Arial", size: 20 }),
                  new TextRun({ text: "No product ships until draft is submitted and approved.", font: "Arial", size: 20 }),
                ],
              }),
            ],
          })],
        })],
      }),

      footerWithLinks([
        { text: "Live dashboard \u2192", link: M4_PAGES_LINK },
        { text: "GitHub Repo \u2192", link: GITHUB_LINK },
      ]),

      // ═══════════════════════════════════════
      // MISSION 5 \u2014 THE BUILD
      // ═══════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      heading1("Mission 5 \u2014 The Build"),
      bodyText("Tool: Daily Activation Pulse. A reusable Claude workflow that triages every signed ambassador daily into RED / AMBER / GREEN buckets and generates copy-paste nudge messages for each. It replaces hope with a daily operating rhythm \u2014 preventing the failure that killed the program: 56 ambassadors receiving product with no accountability or escalation trigger."),

      heading2("How It Works"),
      bodyText("\u2022 Team pastes a table of ambassadors (handle, niche, days since signing, status, notes)"),
      bodyText("\u2022 Claude sorts them: RED (act today or lose them), AMBER (nudge today), GREEN (on track)"),
      bodyText("\u2022 For RED/AMBER: generates the exact DM to send \u2014 under 50 words, niche-specific, no guilt-tripping"),
      bodyText("\u2022 Flags GHOST (10+ days, no draft) \u2014 recommends removal from pipeline, no product shipment"),

      new Paragraph({
        children: [
          new TextRun({ text: "Full system prompt \u2192 ", font: "Arial", size: 20 }),
          new ExternalHyperlink({
            children: [new TextRun({ text: "mission5-activation-tool.md on GitHub", font: "Arial", size: 20, color: "4472C4", underline: {} })],
            link: M5_PROMPT_LINK,
          }),
        ],
        spacing: { before: 80, after: 80 },
      }),

      heading2("Sample Run"),
      new Paragraph({
        children: [new TextRun({ text: "Input:", bold: true, font: "Arial", size: 20 })],
        spacing: { before: 80, after: 40 },
      }),
      monoBox(m5_sampleInput.split("\n")),
      new Paragraph({
        children: [new TextRun({ text: "Output:", bold: true, font: "Arial", size: 20 })],
        spacing: { before: 80, after: 40 },
      }),
      monoBox(m5_sampleOutput.split("\n")),

      footerWithLinks([
        { text: "Claude Code session \u2192", link: GITHUB_LINK },
      ]),

      // ═══════════════════════════════════════
      // MISSION 6 \u2014 THE WILDCARD
      // ═══════════════════════════════════════
      new Paragraph({ children: [new PageBreak()] }),
      heading1("Mission 6 \u2014 The Wildcard"),
      heading2("Content Brief Generator"),

      bodyText("Root Labs' 93% activation failure isn't a motivation problem \u2014 it's a creative friction problem. Ambassadors who receive product and never post aren't lazy; they open Instagram, stare at the camera, and don't know what to say. This Claude workflow removes the blank-page paralysis by generating a personalized content brief for each ambassador."),

      heading2("How It Works"),
      bodyText("\u2022 Team pastes an ambassador's profile (handle, niche, bio, content style, product sent)"),
      bodyText("\u2022 Claude matches the best Root Labs product to their niche"),
      bodyText("\u2022 Generates 3 content ideas (with format, hook, difficulty, and time-to-create)"),
      bodyText("\u2022 Provides talking points (what to say + FDA-compliant guardrails on what NOT to say)"),
      bodyText("\u2022 Writes a ready-to-post caption in the ambassador's voice \u2014 not brand voice"),

      new Paragraph({
        children: [
          new TextRun({ text: "Full system prompt \u2192 ", font: "Arial", size: 20 }),
          new ExternalHyperlink({
            children: [new TextRun({ text: "mission6-content-brief.md on GitHub", font: "Arial", size: 20, color: "4472C4", underline: {} })],
            link: M6_PROMPT_LINK,
          }),
        ],
        spacing: { before: 80, after: 80 },
      }),

      heading2("Sample Run: @atasteofcherie (Lux Cherie, RN)"),

      new Paragraph({
        children: [new TextRun({ text: "Product Match:", bold: true, font: "Arial", size: 20 })],
        spacing: { before: 60, after: 40 },
      }),
      bodyText("Alpha Gummies (Shilajit) \u2014 her RN credential gives authority to discuss energy and mineral supplementation. Shilajit's trace mineral profile gives her real science to reference without crossing into medical claims."),

      new Paragraph({
        children: [new TextRun({ text: "Easiest Content Idea: \"The Nurse's Morning Shelf\"", bold: true, font: "Arial", size: 20 })],
        spacing: { before: 60, after: 40 },
      }),
      bodyText("Format: Story (3 slides). Hook: \"What an RN actually takes every morning.\" Photo of her morning supplement shelf with Alpha Gummies visible. No script, no editing. Time: 5 minutes. Difficulty: Easy."),

      new Paragraph({
        children: [new TextRun({ text: "Caption Draft:", bold: true, font: "Arial", size: 20 })],
        spacing: { before: 60, after: 40 },
      }),
      shadedBox(["Not sponsored-sounding, I promise. I just get asked what I actually take every morning and I'm tired of typing it out. These are Root Labs Alpha Gummies \u2014 4,000mg Shilajit. I checked the label, checked the COA, and checked the ingredient sourcing before I said yes. RN brain doesn't turn off. If you want to try them, my link is in bio \u2014 15% off with my code. But honestly just look up the COA first. That's the part that sold me."]),

      new Paragraph({
        children: [new TextRun({ text: "Key Talking Points:", bold: true, font: "Arial", size: 20 })],
        spacing: { before: 60, after: 40 },
      }),
      bodyText("Say: \"4,000mg per serving \u2014 one of the highest doses in gummy form\" | \"Third-party tested, COA on their site\" | \"I noticed a difference around day 5\""),
      bodyText("Don't say: anything that \"treats\" or \"cures\" a condition | no competitor name-drops | no clinical claims without citing a specific study"),

      bodyText("Why this tool matters: Mission 5 tells the team who to contact. This tool tells the ambassador what to post. Together they close both gaps in the activation pipeline \u2014 the team's follow-up rhythm and the ambassador's content paralysis."),

      footerWithLinks([
        { text: "Live dashboard \u2192", link: M6_PAGES_LINK },
        { text: "GitHub Repo \u2192", link: GITHUB_LINK },
      ]),
    ],
  }],
});

// ── Generate ──
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("ambassador_speedrun.docx", buffer);
  console.log("Done: ambassador_speedrun.docx written (" + buffer.length + " bytes)");
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
