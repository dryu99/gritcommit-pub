import { ShowCreateGoalFormButton } from "@/ui/components/show-create-goal-form-button";
import { ibmPlexMono } from "@/ui/fonts";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} text-2xl font-bold mb-1`}>
        GritCommit
      </h1>
      <p className="text-gray-500 mb-10 text-sm text-center flex sm:flex-row gap-1 sm:gap-2 flex-col items-center">
        Commit to your goals with grit <span>(and a buddy)</span>
      </p>

      <ShowCreateGoalFormButton />
    </div>
  );
}
