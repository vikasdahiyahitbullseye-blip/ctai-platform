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
          <li>Save as an <strong>Excel Workbook (.xlsx)</strong> or as <strong>CSV</strong>.</li>
          <li>To change students who are already on the platform, use <a href="/admin/bulk-edit" className="font-semibold text-brand">Bulk edit</a>.</li>
        </ol>
        <a href="/api/admin/students-template?format=xlsx" className="mt-3 inline-block text-sm font-semibold text-brand">⬇ Download a template (Excel)</a>
        <a href="/api/admin/students-template" className="ml-4 mt-3 inline-block text-sm font-semibold text-brand">CSV template</a>
      </Card>
      <Card title="2. Upload and check"><ImportWizard schoolName={user.school.name} /></Card>
    </div>
  );
}
