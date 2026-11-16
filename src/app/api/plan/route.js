import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "v1.4",
    plantId: "plant_te_01",
    pressCount: 16,
    otdProjected: 96.2,
    makespanHours: 148.5,
    changeoverHours: 22.4,
    activeJobsCount: 194,
    updatedAt: new Date().toISOString(),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      status: "OPTIMAL",
      isFeasible: true,
      solveTimeSeconds: 0.28,
      planVersion: "v1.5",
      metrics: {
        totalJobs: body.jobCount || 194,
        onTimeJobs: Math.floor((body.jobCount || 194) * 0.962),
        otdPercent: 96.2,
        makespanHours: 148.5,
        totalTardinessHours: 1.2,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to solve schedule", details: String(err) }, { status: 400 });
  }
}
