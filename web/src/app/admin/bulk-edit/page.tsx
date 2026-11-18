import { prisma } from "@/lib/db";
import { requireSchoolAdmin } from "@/lib/auth";
import { Card, PageHeader } from "@/components/ui";
import { BulkEditWizard } from "./BulkEditWizard";

export default async function BulkEditPage() {
  const admin = await requireSchoolAdmin();
  const sections = await prisma.classSection.findMany({ where: { schoolId: admin.schoolId }, orderBy: [{ classLevel: "asc" }, { section: "asc" }], include: { _count: { select: { enrollments: true } } } });
  const sel = "mt-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm";
  return (
    <div className="space-y-6">
      <PageHeader title="Bulk edit students" subtitle="Change many students' details at once in Excel: download the list, edit it, upload it. You see every change before it is saved." />
      <Card title="1. Download the current list">
        <form action="/api/admin/students-export" method="get" className="flex flex-wrap items-end gap-3">
          <label className="text-sm font-medium">Students in
            <select name="section" className={`${sel} block`}>
              <option value="">All classes</option>
              {sections.map((s) => <option key={s.id} value={s.id}>Class {s.classLevel}-{s.section} ({s._count.enrollments})</option>)}
            </select>
          </label>
          <button className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">⬇ Download Excel file</button>
        </form>
      </Card>
      <Card title="2. Edit it in Excel">
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-2">
          <li>Change any cell: name, username, class and section, roll no, admission no, date of birth (YYYY-MM-DD), parent/guardian name and phone, email, phone, status (active / inactive).</li>
          <li><strong>Do not change the Student ID column</strong> — it matches each row to the student. You can delete rows you don&apos;t want to change, and whole columns you don&apos;t want to touch.</li>
          <li>An empty cell clears that detail (name, username and class cannot be empty). Moving a student to another class: change Class and Section; the class must already exist.</li>
          <li>Changing a username changes how the student signs in; the password stays the same.</li>
          <li>Save as Excel Workbook (.xlsx) or CSV. New students are added on the <a href="/admin/import" className="font-semibold text-brand">Bulk import</a> page.</li>
        </ul>
      </Card>
      <Card title="3. Upload and check"><BulkEditWizard /></Card>
    </div>
  );
}
