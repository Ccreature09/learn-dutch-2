import Link from "next/link";
import { DUTCH_VERBS } from "@/lib/data/verbs";
import { GRAMMAR_RULE_GUIDES } from "@/lib/grammar/rules/catalog";

const MODULES = [
  {
    href: "/generator",
    icon: "✍️",
    title: "Translation Drill",
    desc: "Translate procedurally generated sentences bidirectionally (EN↔NL). Three modes: type Dutch, type English, or study both side-by-side.",
    cta: "Start drilling →",
  },
  {
    href: "/translation",
    icon: "🔄",
    title: "Translation Engine",
    desc: "Bidirectional rule-based translation between English and Dutch, with word glossaries and grammar notes.",
    cta: "Translate →",
  },
  {
    href: "/flashcards",
    icon: "🃏",
    title: "Flashcard System",
    desc: "Count-based spaced repetition for verbs, vocabulary, and sentences. Cards you miss come back sooner.",
    cta: "Start reviewing →",
  },
  {
    href: "/builder",
    icon: "🧩",
    title: "Sentence Builder",
    desc: "Two modes: arrange scrambled word tiles (structured), or build freely from a vocabulary bank with real-time grammar validation.",
    cta: "Build sentences →",
  },
  {
    href: "/error-correction",
    icon: "🔍",
    title: "Error Correction",
    desc: "Spot and fix procedurally generated grammar mistakes in Dutch sentences. Infinite exercises — no repetition.",
    cta: "Find the errors →",
  },
  {
    href: "/vocabulary",
    icon: "📖",
    title: "Vocabulary",
    desc: "Searchable Dutch dictionary with full verb conjugation tables, filters by POS, difficulty, and category.",
    cta: "Browse dictionary →",
  },
];

export default function DashboardPage() {
  return (
    <>
      <div className="dashboard-hero">
        <span className="dashboard-hero__flag">🇳🇱</span>
        <h1 className="dashboard-hero__title">Leer Nederlands</h1>
        <p className="dashboard-hero__subtitle">
          A rule-based Dutch grammar learning platform — no guessing, pure linguistics.
        </p>
        <div className="dashboard-stats">
          <div className="dashboard-stat">
            <span className="dashboard-stat__value">{DUTCH_VERBS.length}+</span>
            <span className="dashboard-stat__label">Verbs in database</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat__value">{GRAMMAR_RULE_GUIDES.length}</span>
            <span className="dashboard-stat__label">Grammar rules</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat__value">{MODULES.length}</span>
            <span className="dashboard-stat__label">Learning modules</span>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat__value">∞</span>
            <span className="dashboard-stat__label">Procedural exercises</span>
          </div>
        </div>
      </div>

      <div className="module-cards">
        {MODULES.map((m) => (
          <Link key={m.href} href={m.href} className="module-card">
            <span className="module-card__icon">{m.icon}</span>
            <h2 className="module-card__title">{m.title}</h2>
            <p className="module-card__desc">{m.desc}</p>
            <span className="module-card__cta">{m.cta}</span>
          </Link>
        ))}
      </div>

      <section className="grammar-guide-section">
        <div className="grammar-guide-section__header">
          <h2 className="grammar-guide-section__title">Grammar Rules</h2>
          <p className="grammar-guide-section__subtitle">
            The validator, exercises, and sentence generators all reference this shared rule set.
          </p>
        </div>
        <div className="grammar-guide-grid">
          {GRAMMAR_RULE_GUIDES.map((rule) => (
            <article key={rule.ruleId} className="grammar-guide-card">
              <div className="grammar-guide-card__title-row">
                <h3 className="grammar-guide-card__title">{rule.title}</h3>
                <span className="grammar-guide-card__id">{rule.ruleId}</span>
              </div>
              <p className="grammar-guide-card__summary">{rule.summary}</p>
              <p className="grammar-guide-card__details">{rule.details}</p>
              <div className="grammar-guide-card__example">
                <span className="grammar-guide-card__example-label">Example</span>
                <em>{rule.example}</em>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
