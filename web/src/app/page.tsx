import { getSessionUser } from "@/lib/auth/auth.lib";
import { LoginForm } from "@/ui/components/login-form";
import { ibmPlexMono } from "@/ui/fonts";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${ibmPlexMono.className} mb-1 text-2xl font-bold`}>
        GritCommit
      </h1>
      <p className="mb-10 text-sm text-gray-500">
        Commit with grit (and a buddy)
      </p>
      <LoginForm />
    </div>
  );
}
