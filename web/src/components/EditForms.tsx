"use client";
import { useState, useTransition } from "react";
import { updatePerson, updateSchool, updateHqStaff, renameSchoolGroup, updateMyContact, type EditResult } from "@/app/actions/people";
import { btn } from "./ui";

const input = "mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm";
type Action = (prev: EditResult, form: FormData) => Promise<EditResult>;

function Field({ label, name, value, type = "text", required, hint, ...rest }: { label: string; name: string; value?: string | null; type?: string; required?: boolean; hint?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "name" | "type" | "required">) {
  return (
    <label className="block text-sm font-medium">
      {label}{required && <span className="text-bad"> *</span>}
      <input name={name} type={type} defaultValue={value ?? ""} required={required} className={input} {...rest} />
      {hint && <span className="mt-0.5 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}

function Shell({ action, children, submit = "Save changes" }: { action: Action; children: React.ReactNode; submit?: string }) {
  // Submitted by hand (not through the form's action) so the fields keep what was typed, also after an error.
  const [state, setState] = useState<EditResult>(undefined);
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => setState(await action(undefined, fd)));
      }}
      className="space-y-4"
    >
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button className={btn.primary} disabled={pending}>{pending ? "Saving…" : submit}</button>
        {!pending && state?.error && <p className="text-sm text-bad" role="alert">{state.error}</p>}
        {!pending && state?.ok && <p className="text-sm text-good" role="status">✓ {state.message ?? "Saved."}</p>}
      </div>
    </form>
  );
}

type Person = { id: string; role: string; name: string; username: string; rollNo: string | null; admissionNo: string | null; dateOfBirth: string | null; guardianName: string | null; guardianPhone: string | null; designation: string | null; email: string | null; phone: string | null; sectionId: string | null };

export function EditPersonForm({ person: p, sections, isSelf }: { person: Person; sections: { id: string; label: string }[]; isSelf: boolean }) {
  const student = p.role === "STUDENT";
  return (
    <Shell action={updatePerson.bind(null, p.id)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" value={p.name} required maxLength={80} />
        <Field label="Username (used to sign in)" name="username" value={p.username} required maxLength={40} pattern="[a-zA-Z0-9._\-]{3,40}" hint="Changing it changes how they sign in. The password stays the same." />
        {student ? (
          <>
            <label className="block text-sm font-medium">Class<span className="text-bad"> *</span>
              <select name="sectionId" defaultValue={p.sectionId ?? ""} required className={input}>{sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
            </label>
            <Field label="Roll number" name="rollNo" value={p.rollNo} maxLength={10} />
            <Field label="Admission number" name="admissionNo" value={p.admissionNo} maxLength={30} />
            <Field label="Date of birth" name="dateOfBirth" value={p.dateOfBirth} type="date" />
            <Field label="Parent / guardian name" name="guardianName" value={p.guardianName} maxLength={80} />
            <Field label="Parent / guardian phone" name="guardianPhone" value={p.guardianPhone} type="tel" maxLength={20} />
            <Field label="Email (optional)" name="email" value={p.email} type="email" maxLength={120} />
            <Field label="Phone (optional)" name="phone" value={p.phone} type="tel" maxLength={20} />
          </>
        ) : (
          <>
            <label className="block text-sm font-medium">Role
              <select name="role" defaultValue={p.role} disabled={isSelf} className={input}><option value="TEACHER">Teacher</option><option value="ADMIN">School admin</option></select>
              {isSelf && <><input type="hidden" name="role" value={p.role} /><span className="mt-0.5 block text-xs font-normal text-muted">You can&apos;t change your own role.</span></>}
            </label>
            <Field label="Designation" name="designation" value={p.designation} maxLength={60} placeholder="e.g. Computer teacher" />
            <Field label="Email" name="email" value={p.email} type="email" maxLength={120} />
            <Field label="Phone" name="phone" value={p.phone} type="tel" maxLength={20} />
          </>
        )}
      </div>
    </Shell>
  );
}

export function EditSchoolForm({ school: s }: { school: { id: string; name: string; city: string | null; code: string | null; session: string } }) {
  return (
    <Shell action={updateSchool.bind(null, s.id)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="School name" name="name" value={s.name} required maxLength={120} />
        <Field label="City" name="city" value={s.city} required maxLength={60} />
        <Field label="School code" name="code" value={s.code} required maxLength={20} className={`${input} uppercase`} />
        <Field label="Session" name="session" value={s.session} required pattern="\d{4}-\d{2}" placeholder="2026-27" />
      </div>
    </Shell>
  );
}

export function EditHqStaffForm({ staff: u, groups }: { staff: { id: string; role: string; name: string; username: string; email: string | null; phone: string | null; schoolGroupId: string | null }; groups: { id: string; name: string }[] }) {
  return (
    <Shell action={updateHqStaff.bind(null, u.id)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" value={u.name} required maxLength={80} />
        <Field label="Username" name="username" value={u.username} required maxLength={40} />
        <Field label="Email" name="email" value={u.email} type="email" maxLength={120} />
        <Field label="Phone" name="phone" value={u.phone} type="tel" maxLength={20} />
        {(u.role === "REVIEWER" || u.role === "CONTENT") && (
          <label className="block text-sm font-medium">Role
            <select name="role" defaultValue={u.role} className={input}><option value="REVIEWER">Question reviewer</option><option value="CONTENT">Content team</option></select>
          </label>
        )}
        {u.role === "GROUPADMIN" && (
          <label className="block text-sm font-medium">Group of schools
            <select name="schoolGroupId" defaultValue={u.schoolGroupId ?? ""} className={input}>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
          </label>
        )}
      </div>
    </Shell>
  );
}

export function RenameGroupForm({ group }: { group: { id: string; name: string } }) {
  return (
    <Shell action={renameSchoolGroup.bind(null, group.id)} submit="Rename">
      <Field label="Group name" name="name" value={group.name} required maxLength={100} />
    </Shell>
  );
}

export function ContactForm({ email, phone }: { email: string | null; phone: string | null }) {
  return (
    <Shell action={updateMyContact}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" value={email} type="email" maxLength={120} />
        <Field label="Phone" name="phone" value={phone} type="tel" maxLength={20} />
      </div>
    </Shell>
  );
}
