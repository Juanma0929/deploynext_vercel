import { redirect } from "next/navigation";

import { HOME_PATH } from "@/shared/domain/session";

/** The root has no screen of its own: the proxy already sent anonymous visitors to /login. */
export default function RootPage() {
  redirect(HOME_PATH);
}
