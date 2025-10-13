import { adminClient } from "@/lib/sanity/client";
import type { IWorkoutData } from "@/types";

type TSaveWorkoutBody = {
  workoutData: IWorkoutData;
};

export async function POST(request: Request) {
  const { workoutData }: TSaveWorkoutBody = await request.json();

  try {
    const result = await adminClient.create(workoutData);

    console.log("Workout saved successfully.", result);

    return Response.json({
      success: true,
      workoutId: result._id,
      message: `Workout saved successfully.`,
    });
  } catch (e) {
    console.error("Error saving workout:", e);
    return Response.json({ error: "Failed to save workout" }, { status: 500 });
  }
}
