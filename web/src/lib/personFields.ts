// Validation for people's details, shared by the edit form and the Excel bulk edit.
import { z } from "zod";

export const opt = (max: number) => z.string().trim().max(max, `At most ${max} characters`).transform((v) => v || null);
export const phone = z.string().trim().refine((v) => !v || /^[+0-9][0-9 ()\-]{5,19}$/.test(v), "Phone: digits, spaces, + or - only (6–20 characters)").transform((v) => v || null);
export const email = z.string().trim().refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Please enter a valid email address").transform((v) => v || null);
export const username = z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,40}$/, "Username: 3–40 lowercase letters, numbers, dots, dashes or underscores");
export const name = z.string().trim().min(2, "Name is required").max(80);
export const dob = z.string().trim().refine((v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)) && new Date(v) < new Date() && v > "1900-01-01"), "Date of birth: use YYYY-MM-DD, e.g. 2015-08-14").transform((v) => v || null);
