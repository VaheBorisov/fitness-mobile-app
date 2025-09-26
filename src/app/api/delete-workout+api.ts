import { adminClient } from "@/lib/sanity/client";

export async function POST(request: Request) {
  const { workoutId } = await request.json();

  try {
    await adminClient.delete(workoutId);

    return Response.json({
      success: true,
      message: "Workout deleted successfully.",
    });
  } catch (e) {
    console.error("Error deleting workout:", e);
    return Response.json({ error: "Failed deleting workout" }, { status: 500 });
  }
}
