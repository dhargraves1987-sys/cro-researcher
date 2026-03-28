import { useState, useRef } from "react";

const ACCENT = "#00E5A0";
const BG = "#0A0C10";
const CARD = "#111318";
const BORDER = "#1E2330";
const TEXT = "#E8EAF0";
const MUTED = "#6B7280";

const categoryIcons = {
  "Value Proposition": "◈",
  "Call to Action": "⬡",
  "Trust & Credibility": "◉",
  "User Experience": "⬢",
  "Messaging & Copy": "◆",
  "Page Speed & Tech": "⟡",
  "Social Proof": "◎",
  "Overall Score": "★",
};

const priorityColor = {
  High: "#FF4D6D",
  Medium: "#FFB347",
  Low: "#00E5A0",
};

export default function CROResearcher() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const normalizeUrl = (raw) => {
    let u = raw.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
    return u;
  };

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setStage("🔍 Crawling website...");

    const systemPrompt = `You are an expert conversion rate optimization (CRO) analyst. When given a website URL, use web search to research it thoroughly — look at the homepage, pricing page, about page, and any public reviews or analyses.

Then return ONLY a valid JSON object (no markdown, no preamble) with this exact structure:
{
  "siteName": "Company name",
  "tagline": "What the site does in one sentence",
  "overallScore": 72,
  "overallSummary": "2-3 sentence executive summary of conversion health",
  "categories": [
    {
      "name": "Value Proposition",
      "score": 65,
      "summary": "One sentence assessment",
      "findings": [
        { "issue": "What the problem is", "impact": "Why it hurts conversions", "fix": "Specific actionable fix", "priority": "High" }
      ]
    }
  ],
  "quickWins": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "topOpportunity": "The single highest-impact change they could make"
}

Categories to always include: Value Proposition, Call to Action, Trust & Credibility, User Experience, Messaging & Copy, Social Proof.
Scores are 0-100. Priority is "High", "Medium", or "Low".
Base everything on what you actually find from searching the website. Be specific, not generic.`;

    try {
      setStage("🧠 Analyzing with AI...");
      const response = await fetch("https://cro-api-proxy.dhargraves1987.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: systemPrompt,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [
            {
              role: "user",
              content: `Analyze this website for CRO opportunities: ${normalizeUrl(url)}\n\nSearch for the site, explore its key pages, look for reviews or analyses online, then return the JSON analysis.`,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      setStage("📊 Compiling report...");

      // Extract text from response
      const textBlocks = data.content.filter((b) => b.type === "text");
      const fullText = textBlocks.map((b) => b.text).join("");

      // Parse JSON
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse analysis. Please try again.");

      const parsed = JSON.parse(jsonMatch[0]);
      setResults(parsed);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStage("");
    }
  };

  const ScoreRing = ({ score, size = 80 }) => {
    const r = (size / 2) * 0.78;
    const circ = 2 * Math.PI * r;
    const color = score >= 70 ? ACCENT : score >= 45 ? "#FFB347" : "#FF4D6D";
    return (
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={size * 0.08} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={size * 0.08}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
          style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: size * 0.22, fontWeight: 700, fill: color, fontFamily: "monospace" }}>
          {score}
        </text>
      </svg>
    );
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Georgia', 'Times New Roman', serif", color: TEXT, padding: "0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${BG}; } ::-webkit-scrollbar-thumb { background: ${BORDER}; }
        .url-input { background: ${CARD}; border: 1.5px solid ${BORDER}; color: ${TEXT}; font-family: 'DM Mono', monospace; font-size: 15px; padding: 14px 18px; border-radius: 8px; width: 100%; outline: none; transition: border-color 0.2s; }
        .url-input:focus { border-color: ${ACCENT}; }
        .btn-primary { background: ${ACCENT}; color: #000; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 14px; letter-spacing: 0.05em; border: none; padding: 14px 28px; border-radius: 8px; cursor: pointer; transition: opacity 0.2s, transform 0.1s; white-space: nowrap; }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .card { background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 12px; padding: 24px; }
        .finding-row { border-left: 3px solid; padding: 14px 16px; margin-bottom: 10px; border-radius: 0 8px 8px 0; background: rgba(255,255,255,0.02); }
        .pulse { animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .fade-in { animation: fadeIn 0.5s ease forwards; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .score-bar-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: ACCENT, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>◈</div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, letterSpacing: "-0.01em" }}>CRO Researcher</span>
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: "0.1em" }}>AI-POWERED ANALYSIS</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

        {/* Hero */}
        {!results && !loading && (
          <div style={{ textAlign: "center", marginBottom: 48 }} className="fade-in">
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1.15, marginBottom: 16, letterSpacing: "-0.02em" }}>
              What's killing your<br />
              <span style={{ color: ACCENT }}>conversions?</span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: MUTED, fontSize: 16, maxWidth: 480, margin: "0 auto 0" }}>
              Paste any URL. AI will crawl the site, benchmark it against CRO best practices, and surface your highest-impact opportunities.
            </p>
          </div>
        )}

        {/* Input */}
        <div style={{ display: "flex", gap: 10, marginBottom: 40, maxWidth: results ? "100%" : 640, margin: results ? "0 auto 32px" : "0 auto 40px" }}>
          <input
            ref={inputRef}
            className="url-input"
            placeholder="https://yourwebsite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            disabled={loading}
          />
          <button className="btn-primary" onClick={analyze} disabled={loading || !url.trim()}>
            {loading ? "Analyzing..." : "Analyze →"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: MUTED, letterSpacing: "0.05em" }}>{stage}</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: 10, padding: "16px 20px", color: "#FF4D6D", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="fade-in">

            {/* Overview */}
            <div className="card" style={{ marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
              <ScoreRing score={results.overallScore} size={90} />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 4 }}>{results.siteName}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: ACCENT, marginBottom: 10, letterSpacing: "0.05em" }}>{results.tagline}</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>{results.overallSummary}</p>
              </div>
              {results.topOpportunity && (
                <div style={{ background: "rgba(0,229,160,0.06)", border: `1px solid rgba(0,229,160,0.2)`, borderRadius: 10, padding: "14px 18px", maxWidth: 260 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: ACCENT, letterSpacing: "0.12em", marginBottom: 6 }}>TOP OPPORTUNITY</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, lineHeight: 1.55 }}>{results.topOpportunity}</div>
                </div>
              )}
            </div>

            {/* Score bars */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: "0.1em", marginBottom: 18 }}>CATEGORY SCORES</div>
              <div style={{ display: "grid", gap: 12 }}>
                {results.categories?.map((cat) => {
                  const color = cat.score >= 70 ? ACCENT : cat.score >= 45 ? "#FFB347" : "#FF4D6D";
                  return (
                    <div key={cat.name} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 28, textAlign: "center", fontSize: 14 }}>{categoryIcons[cat.name] || "◆"}</div>
                      <div style={{ width: 150, fontFamily: "'DM Sans', sans-serif", fontSize: 13, flexShrink: 0 }}>{cat.name}</div>
                      <div style={{ flex: 1, height: 6, background: BORDER, borderRadius: 4, overflow: "hidden" }}>
                        <div className="score-bar-fill" style={{ width: `${cat.score}%`, background: color }} />
                      </div>
                      <div style={{ width: 34, textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 12, color }}>{cat.score}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick wins */}
            {results.quickWins?.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: "0.1em", marginBottom: 16 }}>QUICK WINS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {results.quickWins.map((win, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,229,160,0.12)", border: `1px solid rgba(0,229,160,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'DM Mono', monospace", fontSize: 10, color: ACCENT }}>{i + 1}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.55, paddingTop: 2 }}>{win}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deep findings per category */}
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: "0.1em", marginBottom: 14 }}>DETAILED FINDINGS</div>
            <div style={{ display: "grid", gap: 16 }}>
              {results.categories?.map((cat) => (
                <div key={cat.name} className="card">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 16 }}>{categoryIcons[cat.name] || "◆"}</span>
                    <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17 }}>{cat.name}</span>
                    <span style={{ marginLeft: "auto", fontFamily: "'DM Mono', monospace", fontSize: 12, color: cat.score >= 70 ? ACCENT : cat.score >= 45 ? "#FFB347" : "#FF4D6D" }}>{cat.score}/100</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: MUTED, margin: "0 0 16px", lineHeight: 1.55 }}>{cat.summary}</p>
                  {cat.findings?.map((f, i) => (
                    <div key={i} className="finding-row" style={{ borderColor: priorityColor[f.priority] || MUTED }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.1em", background: `${priorityColor[f.priority]}22`, color: priorityColor[f.priority], padding: "2px 7px", borderRadius: 4 }}>{f.priority?.toUpperCase()}</span>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13 }}>{f.issue}</span>
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: MUTED, marginBottom: 6, lineHeight: 1.5 }}>Impact: {f.impact}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: ACCENT, lineHeight: 1.5 }}>→ {f.fix}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Re-analyze */}
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <button className="btn-primary" onClick={() => { setResults(null); setUrl(""); setTimeout(() => inputRef.current?.focus(), 100); }} style={{ background: "transparent", color: MUTED, border: `1px solid ${BORDER}` }}>
                Analyze another site
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
