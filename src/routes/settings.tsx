import { createFileRoute, redirect } from "@tanstack/react-router";

/** Settings removed — non-technical clients only need content menus. */
export const Route = createFileRoute("/settings")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
