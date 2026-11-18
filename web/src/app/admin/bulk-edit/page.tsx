import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSchoolAdmin } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { BulkEditWizard } from "./BulkEditWizard";

export default async function BulkEditPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const admin = await requireSchoolAdmin();
  const staff = (await searchParams).kind === "staff";
  const sections = staff ? [] : await prisma.classSection.findMany({ where: { schoolId: admin.schoolId }, orderBy: [{ classLevel: "asc" }, { section: "asc" }], include: { _count: { select: { enrollments: true } } } });
  const staffCount = staff ? await prisma.user.count({ where: { schoolId: admin.schoolId, role: { in: ["TEACHER", "ADMIN"] } } }) : 0;
  const sel = "mt-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  const tab = (on: boolean) => `rounded-full px-4 py-1.5 text-sm font-semibold ${on ? "bg-brand text-white" : "bg-surface-2 text-ink-2 hover:bg-brand-soft"}`;
  return (
    <div className="space-y-6">
      <PageHeader title="Bulk edit" subtitle="Change many people's details at once in Excel: download the list, edit it, upload it. You see every change before it is saved." />
      <nav className="flex gap-2" aria-label="Who to edit">
        <Link href="/admin/bulk-edit" className={tab(!staff)} aria-current={!staff ? "page" : undefined}>Students</Link>
        <Link href="/admin/bulk-edit?kind=staff" className={tab(staff)} aria-current={staff ? "page" : undefined}>Teachers &amp; staff</Link>
      </nav>
      <Card title="1. Download the current list">
        {staff ? (
          <a href="/api/admin/staff-export" className="inline-block rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">⬇ Download Excel file ({staffCount} teachers and admins)</a>
        ) : (
          <form action="/api/admin/students-export" method="get" className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium">Students in
              <select name="section" className={`${sel} block`}>
                <option value="">All classes</option>
                {sections.map((s) => <option key={s.id} value={s.id}>Class {s.classLevel}-{s.section} ({s._count.enrollments})</option>)}
              </select>
            </label>
            <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">⬇ Download Excel file</button>
          </form>
        )}
      </Card>
      <Card title="2. Edit it in Excel">
        {staff ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
            <li>Change any cell: name, username, role (<em>teacher</em> or <em>admin</em>), designation, email, phone, status (<em>active</em> / <em>inactive</em>).</li>
            <li><strong>Teaches</strong>: the classes and subjects, separated by semicolons, e.g. <code className="font-mono">6-A CT; 7-A AI; 3-B CT</code>. AI is for Classes 6–8. The list replaces the person&apos;s current classes; an empty cell removes them all. The classes must already exist.</li>
            <li><strong>Do not change the Staff ID column</strong> — it matches each row to the person. Delete rows or whole columns you don&apos;t want to change.</li>
            <li>You cannot change your own role or deactivate yourself, and the school must keep at least one active admin.</li>
            <li>Changing a username changes how the person signs in; the password stays the same. New teachers are added on the <a href="/admin/teachers" className="font-semibold text-brand">Teachers</a> page.</li>
          </ul>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
            <li>Change any cell: name, username, class and section, roll no, admission no, date of birth (YYYY-MM-DD or DD/MM/YYYY), parent/guardian name and phone, email, phone, status (active / inactive).</li>
            <li><strong>Do not change the Student ID column</strong> — it matches each row to the student. You can delete rows you don&apos;t want to change, and whole columns you don&apos;t want to touch.</li>
            <li>An empty cell clears that detail (name, username and class cannot be empty). Moving a student to another class: change Class and Section; the class must already exist.</li>
            <li>Changing a username changes how the student signs in; the password stays the same.</li>
            <li>Save as Excel Workbook (.xlsx) or CSV. New students are added on the <a href="/admin/import" className="font-semibold text-brand">Bulk import</a> page.</li>
          </ul>
        )}
      </Card>
      <Card title="3. Upload and check"><BulkEditWizard key={staff ? "staff" : "students"} kind={staff ? "staff" : "students"} /></Card>
    </div>
  );
}
