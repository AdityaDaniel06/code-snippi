import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in · Snippi",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await props.searchParams;
  return <AuthForm mode="login" redirectTo={redirect} />;
}
