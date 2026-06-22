"use client";

import { useState } from "react";

export default function PricingFAQ({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  return <div className="border-y border-gray-200">{items.map((item, index) => { const open = openIndex === index; return <article key={item.question} className="border-b border-gray-200 last:border-0"><h3><button type="button" onClick={() => setOpenIndex(open ? -1 : index)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-semibold text-gray-900 hover:text-blue-700"><span>{item.question}</span><svg className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg></button></h3>{open && <p className="max-w-3xl pb-5 pr-8 text-sm leading-6 text-gray-500">{item.answer}</p>}</article>; })}</div>;
}
