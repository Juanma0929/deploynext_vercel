import { redirect } from "next/navigation";

/**
 * The root has nothing of its own to show: the session decides where the user
 * goes, and the middleware sends them to the login page when there is none.
 */
export default function RootPage() {
  redirect("/dashboard");
}
