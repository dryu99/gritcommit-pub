import { DB } from "@/database/db";
import { getSessionUser } from "@/lib/auth/auth.lib";
import { CURRENT_YEAR } from "@/lib/date";
import { CommitGraph } from "@/ui/components/commit-graph";
import { LoginForm } from "@/ui/components/login-form";
import { ibmPlexMono } from "@/ui/fonts";
import { redirect } from "next/navigation";

export const revalidate = 120;

export default async function HomePage() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect("/dashboard");
  }

  const goalEntries = await DB.get()
    .selectFrom("goalEntry")
    .select(["createdAt"])
    .where("createdAt", ">=", new Date(CURRENT_YEAR, 0, 1))
    .where("createdAt", "<=", new Date(CURRENT_YEAR, 11, 31))
    .execute();

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} mb-1 text-2xl font-bold`}>
        GritCommit
      </h1>
      <p className="mb-8 text-gray-500">
        Commit to your goals with grit (and a buddy)
      </p>
      <div className="mb-8 w-full">
        <CommitGraph
          dates={goalEntries.map((entry) => new Date(entry.createdAt))}
        />
      </div>
      {/* <CommitLine includeNode />
      <div className="w-full rounded-md border border-neutral-300 p-4 text-sm sm:w-[500px]">
        GritCommit is a commitment device service that sends you notifications
      </div>
      <CommitLine includeNode /> */}
      <LoginForm />
    </div>
  );
}

const CommitLine = ({
  height = 20,
  includeNode,
}: {
  height?: number;
  includeNode?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-[2px] bg-neutral-300"
        style={{ height: `${height}px` }}
      />
      {includeNode && (
        <div className="h-2 w-2 rounded-full border-2 border-neutral-300 bg-neutral-300" />
      )}
      <div
        className="w-[2px] bg-neutral-300"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
