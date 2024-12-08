import { fetchGoals } from "@/lib/goals/goals.helpers";
import { ShowCreateGoalFormButton } from "@/ui/components/show-create-goal-form-button";
import { ibmPlexMono } from "@/ui/fonts";

export default async function HomePage() {
  const goals = await fetchGoals();

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} text-2xl font-bold mb-1`}>
        GritCommit
      </h1>
      <p className="text-gray-500 mb-10 text-sm text-center flex sm:flex-row gap-1 sm:gap-2 flex-col items-center">
        Commit to your goals with grit <span>(and a buddy)</span>
      </p>
      <div className="mb-4">
        <ShowCreateGoalFormButton />
      </div>
      <div className="flex flex-col gap-4 text-sm">
        {goals.map((goal) => (
          <div key={goal.id}>{goal.description}</div>
        ))}
      </div>
    </div>
  );
}
