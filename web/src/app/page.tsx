import { ibmPlexMono } from "@/ui/fonts";
import { GoalForm } from "../ui/components/goal-form";

export default function HomePage() {
  return (
    <div>
      <h1 className={`${ibmPlexMono.className} text-2xl font-bold mb-10`}>
        GritCommit
      </h1>
      <GoalForm />
    </div>
  );
}
