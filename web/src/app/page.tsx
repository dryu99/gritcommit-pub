import { ibmPlexMono } from "@/ui/fonts";
import { GoalForm } from "../ui/components/goal-form";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} text-2xl font-bold mb-1`}>
        GritCommit
      </h1>
      <p className="text-gray-500 mb-10 text-sm">
        Commit to your goals with grit (and a buddy)
      </p>
      <GoalForm />
    </div>
  );
}
