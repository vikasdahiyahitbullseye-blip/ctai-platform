import { NextResponse } from "next/server";
import { AlignmentType, Document, HeadingLevel, Packer, PageBreak, Paragraph, TextRun } from "docx";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildPaper, instructionFor, plain, VERSION_NAMES } from "@/lib/paper";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) return new NextResponse("Unauthorised", { status: 401 });
  const t = await prisma.assessment.findUnique({ where: { id } });
  if (!t || t.schoolId !== user.schoolId) return new NextResponse("Not found", { status: 404 });

  const version = Math.min(2, Math.max(0, Number(new URL(req.url).searchParams.get("v") ?? 0) || 0));
  const { test, school, items, totalMarks } = await buildPaper(id, version);
  const lines = (text: string) => plain(text).split("\n").filter((l) => l.trim()).map((l) => new Paragraph({ children: [new TextRun(l.replace(/^\s*-\s+/, "• "))], spacing: { after: 60 } }));

  const header = (title: string) => [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: school?.name ?? "School", bold: true, size: 32 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`Academic Session ${school?.session ?? ""} · Computational Thinking & AI`)] }),
    new Paragraph({ alignment: AlignmentType.CENTER, heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: title, bold: true })] }),
    new Paragraph({ children: [new TextRun(`Class ${test.classLevel} · Set ${VERSION_NAMES[version]}${test.durationMin ? ` · Time: ${test.durationMin} min` : ""} · Maximum marks: ${totalMarks}`)], spacing: { after: 200 } }),
  ];

  const paper = [
    ...header(test.title),
    new Paragraph({ children: [new TextRun("Name: ____________________   Roll no.: ________   Section: ______")], spacing: { after: 120 } }),
    ...(test.instructions ? [new Paragraph({ children: [new TextRun({ text: "Instructions: ", bold: true }), new TextRun(test.instructions)], spacing: { after: 240 } })] : []),
    ...items.flatMap((it) => [
      new Paragraph({ children: [new TextRun({ text: `Q${it.no}. `, bold: true }), new TextRun({ text: `[${it.marks} mark${it.marks > 1 ? "s" : ""}]`, italics: true })], spacing: { before: 200 } }),
      ...lines(it.stem),
      ...(it.figure || it.optionFigures?.some(Boolean) ? [new Paragraph({ children: [new TextRun({ text: "[Picture question: the picture is in the printable version (Print / PDF) of this paper.]", italics: true, color: "B45309" })] })] : []),
      ...(instructionFor(it.type) ? [new Paragraph({ children: [new TextRun({ text: instructionFor(it.type)!, italics: true })] })] : []),
      ...(it.type === "ORDER"
        ? [new Paragraph({ children: [new TextRun(it.options.join("   |   "))] })]
        : it.options.map((o, k) => new Paragraph({ children: [new TextRun(`(${String.fromCharCode(97 + k)}) ${o}`)], indent: { left: 360 } }))),
      ...(["NUMERIC", "FILL_BLANK", "ORDER"].includes(it.type) ? [new Paragraph({ children: [new TextRun("Answer: ______________________________")], spacing: { before: 120 } })] : []),
    ]),
  ];
  const key = [
    new Paragraph({ children: [new PageBreak()] }),
    ...header(`${test.title} — Answer Key`),
    ...items.flatMap((it) => [
      new Paragraph({ children: [new TextRun({ text: `Q${it.no}. `, bold: true }), new TextRun({ text: it.answerText, bold: true })], spacing: { before: 160 } }),
      ...lines(it.solution),
    ]),
  ];

  const doc = new Document({ creator: "Hitbullseye CT & AI", title: test.title, sections: [{ children: [...paper, ...key] }] });
  const buf = await Packer.toBuffer(doc);
  const name = `${test.title.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_")}_Set${VERSION_NAMES[version]}.docx`;
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
