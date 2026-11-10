import { requireUser } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { ImportForm } from "./ImportForm";

export default async function StudioImport() {
  await requireUser("CONTENT", "SUPERADMIN");
  return (
    <div className="space-y-6">
      <PageHeader title="Import questions from a spreadsheet" subtitle="Authors can write in Excel; every imported row becomes a DRAFT that still needs review." />
      <Card title="Columns">
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <tbody className="[&_td]:border-t [&_td]:border-line [&_td]:py-1.5 [&_td]:pr-4">
              <tr><td className="font-mono">class</td><td>3–8</td></tr>
              <tr><td className="font-mono">part</td><td>CT, AI or EVS</td></tr>
              <tr><td className="font-mono">chapter</td><td>Chapter number within the part</td></tr>
              <tr><td className="font-mono">type</td><td>MCQ, MULTI, TRUE_FALSE, NUMERIC, FILL_BLANK, ORDER, SHORT</td></tr>
              <tr><td className="font-mono">difficulty</td><td>1 easy, 2 medium, 3 hard</td></tr>
              <tr><td className="font-mono">skills</td><td>e.g. PATTERN|DECOMPOSITION (ABSTRACT, PATTERN, DECOMPOSITION, ALGORITHMIC, GENERALISATION, EVALUATION, AI_CONCEPT, DATA, ETHICS)</td></tr>
              <tr><td className="font-mono">question</td><td>Text; write \n for a new line</td></tr>
              <tr><td className="font-mono">options</td><td>Separated by | (for ORDER, in the correct order)</td></tr>
              <tr><td className="font-mono">answer</td><td>Same formats as the editor (b · a,c · true · 36 · word|variant · model answer)</td></tr>
              <tr><td className="font-mono">solution, hint</td><td>Worked solution (required), hint (optional)</td></tr>
            </tbody>
          </table>
        </div>
        <a href="/api/studio/questions-template" className="mt-3 inline-block text-sm font-semibold text-brand">⬇ Download template with examples</a>
      </Card>
      <Card title="Upload"><ImportForm /></Card>
    </div>
  );
}
