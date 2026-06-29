"use client";

import { useState } from 'react';

interface AccordionProps {
  title: string;
  content: string;
}

export default function Accordion({ title, content }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left font-bold text-slate-900"
      >
        {title}
      </button>
      {isOpen && (
        <div className="mt-3 text-slate-700">
          {content}
        </div>
      )}
    </div>
  );
}
