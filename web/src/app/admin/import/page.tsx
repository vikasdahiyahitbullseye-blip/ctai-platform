import { requireSchoolAdmin } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { ImportWizard } from "../forms";

export default async function ImportPage() {
  const user = await requireSchoolAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="Bulk import students" subtitle="Upload a class list from Excel. We check every row before creating any accounts." />
      <Card title="1. Prepare your file">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-2">
          <li>In Excel, use these column headings in row 1: <code className="font-mono">name, class, section, roll</code>.</li>
          <li>Create the class sections first (Classes page).</li>
          <li>Save as <strong>CSV (Comma delimited)</strong>.</li>
        </ol>
        <a href="/api/admin/students-template" className="mt-3 inline-block text-sm font-semibold text-brand">⬇ Download a template</a>
      </Card>
      <Card title="2. Upload and check"><ImportWizard schoolName={user.school.name} /></Card>
    </div>
  );
}
