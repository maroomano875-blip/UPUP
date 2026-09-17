"use client";
// ==========================================================
// بوابة الموافقة — تظهر عندما confidence_score أقل من الحد الأدنى
// أو عندما requires_human_approval = true
// ==========================================================
import { useState } from "react";

interface ApprovalGateProps {
  requestId: string;
  reason: string;                       // لماذا تحتاج مراجعة بشرية؟
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string, note: string) => Promise<void>;
}

export function ApprovalGate({ requestId, reason, onApprove, onReject }: ApprovalGateProps) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="border-r-4 border-brass bg-paper-raised border border-hairline px-5 py-4">
      <div className="font-mono text-xs text-brass tracking-wider mb-2">
        NEEDS HUMAN REVIEW
      </div>
      <p className="font-arabic text-sm text-ink mb-4">{reason}</p>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="ملاحظة تصحيح (اختياري عند الرفض)"
        className="w-full border border-hairline bg-paper font-arabic text-sm p-2 mb-3 focus:outline-none focus:border-brass"
        rows={2}
      />

      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={async () => { setBusy(true); await onApprove(requestId); setBusy(false); }}
          className="font-arabic text-sm bg-forest text-white px-4 py-2 disabled:opacity-50"
        >
          ✓ موافقة وتسليم
        </button>
        <button
          disabled={busy}
          onClick={async () => { setBusy(true); await onReject(requestId, note); setBusy(false); }}
          className="font-arabic text-sm border border-oxblood text-oxblood px-4 py-2 disabled:opacity-50"
        >
          تصحيح وإعادة
        </button>
      </div>
    </div>
  );
}
