import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const query = body.query || "Press 04 breakdown";

    return NextResponse.json({
      intent: {
        disruptionType: "machine_down",
        targetMachine: "PRESS_04",
        durationHours: 24,
        priorityOrderToProtect: "SO-8812",
      },
      options: [
        {
          id: "option_a",
          title: "Option A (Recommended by Solver)",
          summary: "Re-sequence Press 04 batch jobs to Press 02 & Press 07. Mold M-17 verified compatible.",
          kpiDelta: {
            otdBefore: 96.2,
            otdAfter: 94.8,
            tardinessDeltaHours: "+4.2h",
            changeoverDeltaMin: "+45m",
            affectedJobsCount: 4,
          },
          bindingConstraints: [
            "Mold M-17 only compatible with Press 02 and Press 07",
            "Press 05 locked for scheduled Tooling PM on Shift 2",
            "SO-8812 priority locked to due date 2026-11-20",
          ],
        },
        {
          id: "option_b",
          title: "Option B (Overtime Mode)",
          summary: "Authorize 4 hours overtime on Press 01 & Press 02 to maintain 96.0% OTD.",
          kpiDelta: {
            otdBefore: 96.2,
            otdAfter: 96.0,
            tardinessDeltaHours: "+0.8h",
            changeoverDeltaMin: "+60m",
            affectedJobsCount: 2,
          },
          bindingConstraints: [
            "Operator overtime approval required for Shift 3",
            "Saves customer SO-8812 with zero tardiness",
          ],
        },
      ],
      auditRequired: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to evaluate scenario", details: String(err) }, { status: 400 });
  }
}
