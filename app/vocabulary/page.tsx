import VocabularySystem from "@/components/VocabularySystem";

export const metadata = {
  title: "Vocabulary — Leer Nederlands",
  description: "Searchable Dutch vocabulary dictionary with full conjugation tables.",
};

export default function VocabularyPage() {
  return (
    <main className="page-main">
      <div className="page-header">
        <h1 className="page-title">📖 Vocabulary</h1>
        <p className="page-subtitle">
          Searchable Dutch dictionary — verbs, nouns, adjectives, adverbs and more.
          Click any verb card to expand its full conjugation table.
        </p>
      </div>
      <VocabularySystem />
    </main>
  );
}
