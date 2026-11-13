import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { UserRole } from "~/db/schema";
import Settings from "./settings";

function renderSettings(count: number) {
  const props = {
    loaderData: {
      user: {
        id: 1,
        name: "Alex",
        email: "alex@example.com",
        bio: null,
        role: UserRole.Student,
      },
      pendingChargebacks: Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        courseTitle: `Course ${index + 1}`,
        courseSlug: `course-${index + 1}`,
        amountPaid: 4999,
        requestedAt: "2026-11-12T12:00:00.000Z",
        reason: "Not right for me — please review!",
      })),
    },
  } as ComponentProps<typeof Settings>;
  const router = createMemoryRouter([
    { path: "/", element: <Settings {...props} /> },
  ]);
  try {
    return renderToStaticMarkup(<RouterProvider router={router} />);
  } finally {
    router.dispose();
  }
}

describe("Settings refund requests", () => {
  it.each([
    [1, "1 refund request is awaiting review."],
    [2, "2 refund requests are awaiting review."],
  ])(
    "shows %i requests awaiting review with requested amounts and unchanged reasons",
    (count, summary) => {
      const markup = renderSettings(count);

      expect(markup).toContain("Refund requests</h2>");
      expect(markup).toContain(summary);
      expect(markup.match(/Awaiting review/g)).toHaveLength(count);
      expect(markup).toContain(
        `$49.99 requested on ${new Date("2026-11-12T12:00:00.000Z").toLocaleDateString()}`
      );
      expect(markup).toContain("Not right for me — please review!");
      expect(markup).toContain('href="/courses/course-1"');
      expect(markup).not.toMatch(
        /chargeback|reversal|refunded|refund pending/i
      );
    }
  );

  it("does not show a request section when there are no open requests", () => {
    expect(renderSettings(0)).not.toContain("Refund requests");
  });
});
