import { AuthProvider } from "@/features/auth/presentation";

/**
 * The public area. It still needs the provider, because the login form reaches
 * the use case through the facade hook, but it starts with no session.
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return <AuthProvider initialUser={null}>{children}</AuthProvider>;
}
