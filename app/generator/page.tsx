import TranslationDrill from "@/components/TranslationDrill";

export const metadata = {
  title: "Translation Drill — Leer Nederlands",
  description: "Bidirectional Dutch↔English translation drill with procedurally generated sentences.",
};

export default function GeneratorPage() {
  return (
    <main className="page-main">
      <div className="page-header">
        <h1 className="page-title">✍️ Translation Drill</h1>
        <p className="page-subtitle">
          Translate procedurally generated sentences. Mode A: English → Dutch.
          Mode B: Dutch → English. Mode C: side-by-side study.
        </p>
      </div>
      <TranslationDrill />
    </main>
  );
}
