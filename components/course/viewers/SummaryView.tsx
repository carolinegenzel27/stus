"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { SummaryContent } from "@/lib/types";
import { Button } from "@/components/ui";
import { Markdown } from "./Markdown";

export function SummaryView({ content }: { content: SummaryContent }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="mb-2 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(content.markdown);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
      </div>
      <Markdown>{content.markdown}</Markdown>
    </div>
  );
}
