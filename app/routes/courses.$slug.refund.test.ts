import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RefundStatus } from "~/db/schema";
import { action } from "./courses.$slug.refund";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  all: vi.fn(),
  values: vi.fn().mockReturnThis(),
  getCurrentUserId: vi.fn(),
}));

vi.mock("~/lib/session", () => ({
  getCurrentUserId: mocks.getCurrentUserId,
}));

vi.mock("~/db", () => {
  const query = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    values: mocks.values,
    get: mocks.get,
    all: mocks.all,
  };
  return {
    db: {
      select: vi.fn(() => query),
      insert: vi.fn(() => query),
    },
  };
});

const course = { id: 2, title: "Learn TypeScript", price: 9999 };
const learner = { name: "Alex", email: "alex@example.com" };
const purchase = {
  id: 3,
  amountPaid: 4999,
  country: "IN",
  createdAt: "2026-11-12T10:00:00.000Z",
};

function submit(reason = "This course is not what I expected.") {
  return action({
    params: { slug: "learn-typescript" },
    request: new Request("http://localhost/courses/learn-typescript/refund", {
      method: "POST",
      body: new URLSearchParams({ reason }),
    }),
    context: {},
  } as Parameters<typeof action>[0]);
}

describe("refund request acknowledgement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-12T12:00:00.000Z"));
    mocks.getCurrentUserId.mockResolvedValue(1);
    mocks.get
      .mockReset()
      .mockReturnValueOnce(course)
      .mockReturnValueOnce(learner)
      .mockReturnValueOnce(purchase)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined);
    mocks.all.mockReset().mockReturnValue([]);
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each([
    ["IN", "$49.99"],
    ["US", "$99.99"],
  ])(
    "logs receipt of the requested amount for %s without promising payment",
    async (country, amount) => {
      mocks.get
        .mockReset()
        .mockReturnValueOnce(course)
        .mockReturnValueOnce(learner)
        .mockReturnValueOnce({ ...purchase, country });
      const reason = "The examples don't fit my needs — please review.";

      const response = await submit(reason);

      expect(mocks.values).toHaveBeenCalledWith({
        purchaseId: purchase.id,
        status: RefundStatus.Requested,
        reason,
      });
      expect(console.log).toHaveBeenCalledExactlyOnceWith(
        `[email] to=alex@example.com subject=Refund request received: Learn TypeScript\n` +
          `Hi Alex,\n\n` +
          `We've received your refund request for Learn TypeScript.\n` +
          `Requested amount: ${amount}.\n` +
          `Our team will review your request.\n\n` +
          `— The Cadence team`
      );
      expect(response).toBeInstanceOf(Response);
      expect((response as Response).status).toBe(302);
      expect((response as Response).headers.get("Location")).toBe("/settings");
    }
  );

  it("returns refund request guidance for a short reason without recording a request", async () => {
    const response = await submit("Too short");

    expect(response).toMatchObject({
      data: {
        errors: {
          reason:
            "Tell us a little more about why you are requesting a refund.",
        },
      },
      init: { status: 400 },
    });
    expect(mocks.values).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  it.each([
    {
      condition: "not signed in",
      userId: null,
      rows: [],
      status: 401,
      message: "You must be logged in to request a refund.",
    },
    {
      condition: "an existing request",
      userId: 1,
      rows: [course, learner, purchase, { id: 4 }],
      status: 409,
      message: "You already have a refund request open for this purchase.",
    },
    {
      condition: "a claimed team seat",
      userId: 1,
      rows: [course, learner, purchase, undefined, { id: 5 }],
      status: 403,
      message:
        "A purchase with a claimed team seat is not eligible for a refund.",
    },
    {
      condition: "a closed request window",
      userId: 1,
      rows: [
        course,
        learner,
        { ...purchase, createdAt: "2026-10-01T10:00:00.000Z" },
      ],
      status: 403,
      message: "The 14-day refund request window has closed.",
    },
    {
      condition: "too much watch time",
      userId: 1,
      rows: [course, learner, purchase],
      status: 403,
      message: "You have watched too much of this course to request a refund.",
    },
  ])(
    "uses refund terminology for $condition",
    async ({ userId, rows, status, message, condition }) => {
      mocks.getCurrentUserId.mockResolvedValue(userId);
      mocks.get.mockReset();
      for (const row of rows) mocks.get.mockReturnValueOnce(row);
      if (condition === "too much watch time") {
        mocks.all
          .mockReturnValueOnce([{ id: 6 }])
          .mockReturnValueOnce([{ furthest: 7200 }]);
      }

      await expect(submit()).rejects.toMatchObject({
        data: message,
        init: { status },
      });
      expect(mocks.values).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    }
  );
});
