import { createFileRoute, redirect } from "@tanstack/react-router";

/** Public sign-up disabled — Super Admin creates accounts. */
export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
});
