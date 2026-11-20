import Link from "next/link";
import { requireSchoolAdmin } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { ImportWizard } from "../forms";
import { StaffImportWizard } from "./StaffImportWizard";

export default async function ImportPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const user = await requireSchoolAdmin();
  const staff = (await searchParams).kind === "staff";
  const tab = (on: boolean) => `rounded-full px-4 py-1.5 text-sm font-semibold ${on ? "bg-brand text-white" : "bg-surface-2 text-ink-2 hover:bg-brand-soft"}`;
  const code = "rounded bg-surface-2 px-1 font-mono";
  return (
    <div className="space-y-6">
      <PageHeader title="Bulk import" subtitle="Add many new people at once from Excel. We check every row before creating any accounts." />
      <nav className="flex gap-2" aria-label="Who to import">
        <Link href="/admin/import" className={tab(!staff)} aria-current={!staff ? "page" : undefined}>Students</Link>
        <Link href="/admin/import?kind=staff" className={tab(staff)} aria-current={staff ? "page" : undefined}>Teachers &amp; staff</Link>
      </nav>
      {staff ? (
        <>
          <Card title="1. Prepare your file">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-2">
              <li>Download the template below. Row 1 holds the headings: <code className={code}>Name, Role, Designation, Email, Phone, Teaches</code>. Only <strong>Name</strong> is required.</li>
              <li><strong>Role</strong> is <code className={code}>teacher</code> or <code className={code}>admin</code> (school admin). Leave it empty for teacher.</li>
              <li><strong>Teaches</strong> lists class-sections and subjects separated by <code className={code}>;</code> — e.g. <code className={code}>6-A CT; 6-A AI; 7-B CT</code>. AI is for Classes 6–8. Create the classes first on the <a href="/admin/classes" className="font-semibold text-brand">Classes</a> page, or leave it empty and assign classes later.</li>
              <li>Save as an <strong>Excel Workbook (.xlsx)</strong> or as <strong>CSV</strong>. Up to 300 people at a time.</li>
              <li>Usernames and temporary passwords are made for you. Everyone chooses their own password at first sign-in.</li>
              <li>To change staff who are already on the platform, use <a href="/admin/bulk-edit?kind=staff" className="font-semibold text-brand">Bulk edit</a>.</li>
            </ol>
            <a href="/api/admin/staff-template?format=xlsx" className="mt-3 inline-block text-sm font-semibold text-brand">⬇ Download a template (Excel)</a>
            <a href="/api/admin/staff-template" className="ml-4 mt-3 inline-block text-sm font-semibold text-brand">CSV template</a>
          </Card>
          <Card title="2. Upload and check"><StaffImportWizard schoolName={user.school.name} /></Card>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
