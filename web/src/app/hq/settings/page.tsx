import { requireUser } from "@/lib/auth";
import { Card, PageHeader, btn } from "@/components/ui";
import { UPLOAD_ROLE_OPTIONS, videoUploadRoles } from "@/lib/videos";
import { saveVideoUploadRoles } from "@/app/actions/videos";

export default async function HqSettings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireUser("SUPERADMIN");
  const roles = await videoUploadRoles();
  const saved = (await searchParams).saved;
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Platform-wide permissions" />
      <Card title="Who can upload concept videos?">
        <p className="text-sm text-ink-2">
          People in the roles you tick get a <strong>Concept videos</strong> page where they add recordings (a YouTube link, a video link or a video file).
          If no role is ticked, uploading is switched off and nobody sees the upload page. Teachers and students only ever see videos that have a recording.
        </p>
        <form action={saveVideoUploadRoles} className="mt-4 space-y-2">
          {UPLOAD_ROLE_OPTIONS.map((o) => (
            <label key={o.role} className="flex items-center gap-2 text-sm"><input type="checkbox" name="roles" value={o.role} defaultChecked={roles.includes(o.role)} /> {o.label}</label>
          ))}
          <button className={`${btn.primary} mt-2`}>Save</button>
          {saved && <span className="ml-3 text-sm text-good">Saved.</span>}
        </form>
        <p className="mt-3 text-xs text-muted">Currently allowed: {roles.length ? roles.map((r) => UPLOAD_ROLE_OPTIONS.find((o) => o.role === r)!.label).join(", ") : "nobody (uploading is off)"}.</p>
      </Card>
    </div>
  );
}
