"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, audit } from "@/lib/auth";
import { setVideoUploadRoles, UPLOAD_ROLE_OPTIONS } from "@/lib/videos";

/** Super-admin: choose which roles may upload concept videos. */
export async function saveVideoUploadRoles(form: FormData) {
  const user = await requireUser("SUPERADMIN");
  const roles = await setVideoUploadRoles(form.getAll("roles").map(String));
  await audit(user, "VIDEO_UPLOAD_ROLES", roles.length ? roles.map((r) => UPLOAD_ROLE_OPTIONS.find((o) => o.role === r)!.label).join(", ") : "nobody");
  revalidatePath("/", "layout");
  redirect("/hq/settings?saved=1");
}
