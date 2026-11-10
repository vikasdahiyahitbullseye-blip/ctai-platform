"use client";
export function PrintButton() {
  return <button onClick={() => window.print()} className="rounded-lg bg-[#2f5bea] px-3 py-1.5 font-semibold text-white">Print / Save PDF</button>;
}
