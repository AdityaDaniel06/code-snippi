import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Landing from "@/components/landing";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return <Landing />;
}
