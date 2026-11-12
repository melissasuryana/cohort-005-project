# Refund request terminology

This is the agreed customer-facing terminology for requesting a refund on a
course purchase. This decision documents copy only; it does not implement the
copy changes or change purchase/payment behavior.

## Meaning and scope

The existing flow records a refund request for manual review. Submitting a
request does not mean that a refund has been approved or that money has been
returned.

- Use **refund request** for the customer's request.
- Use **Request a refund** for the action.
- Use **Awaiting review** for a request with internal status `requested`.
- Reserve **chargeback** for a bank/payment-provider dispute, not this flow.
- Do not use **reversal**, **cancel my purchase**, or **pending chargeback** as
  alternative names for this flow.
- Do not describe a submitted request as **Refund pending**, **Refunded**, or
  **Refund sent**. Those labels could imply approval or payment processing.

Apply this vocabulary throughout the customer-facing journey: the course page,
form, validation and route errors, confirmation email template, and Settings.
There is no existing purchase-history screen in this flow; do not add one.

## Approved course-page copy

| Surface | Copy |
| --- | --- |
| Button opening the form | Request a refund |
| Form heading | Request a refund |
| Form explanation | Requested amount: {amount}. Our team reviews refund requests manually. |
| Reason prompt | Why are you requesting a refund? |
| Submit button | Request a refund |
| Submitting button | Submitting... |
| Form-dismiss button | Close |

**Close** only dismisses the form; it does not withdraw a submitted request or
change the purchase. Preserve the existing redirect to Settings after successful
submission rather than introducing a new success notice.

## Approved acknowledgement copy

Email subject:

```text
Refund request received: {courseTitle}
```

Email body, retaining the existing greeting and sign-off:

```text
We've received your refund request for {courseTitle}.
Requested amount: {amount}.
Our team will review your request.
```

This acknowledgement is for after submission. Do not use receipt language in the
form before submission. Do not promise approval, repayment, a processing date, or
a follow-up email. The current implementation logs the confirmation email
template rather than sending it; this decision does not add email delivery.

## Approved Settings copy

| Surface | Copy |
| --- | --- |
| Section heading | Refund requests |
| Request badge | Awaiting review |
| Single-request summary | 1 refund request is awaiting review. |
| Multiple-request summary | {count} refund requests are awaiting review. |
| Request detail | {amount} requested on {date} |

The section continues to show only requests with internal status `requested`.
Continue displaying the customer's reason verbatim. Keep the existing amount and
date formatting; `{amount}` is the requested amount, not confirmation of payment.

## Related errors

Use the same vocabulary without changing when an error occurs.

| Condition | Copy |
| --- | --- |
| Reason too short | Tell us a little more about why you are requesting a refund. |
| Reason too long | Please keep your reason under 1000 characters. |
| Not signed in | You must be logged in to request a refund. |
| No purchase | You have not bought this course. |
| Existing request | You already have a refund request open for this purchase. |
| Claimed team seat | A purchase with a claimed team seat is not eligible for a refund. |
| Request window closed | The {REFUND_WINDOW_DAYS}-day refund request window has closed. |
| Watch-time limit exceeded | You have watched too much of this course to request a refund. |

## Unchanged behavior and implementation locations

Eligibility rules, review workflow, course access, amount calculations, payment
processing, email delivery, and internal identifiers/status values are unchanged.
This decision does not introduce approval, decline, payment, or bank-dispute
workflows, nor does it define customer-facing labels for unimplemented states.
Unrelated uses of "cancel" elsewhere in the application are out of scope.

The copy changes belong in:

- [Course page and form](../app/routes/courses.$slug.tsx)
- [Refund action, errors, and email template](../app/routes/courses.$slug.refund.ts)
- [Settings request list](../app/routes/settings.tsx)
