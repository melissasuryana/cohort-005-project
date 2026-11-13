# Refund terminology glossary

Source: [Refund request terminology](docs/refund-terminology.md), the agreed
customer-facing copy and scope.

| Term                 | Meaning                                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Refund request**   | A customer's request for manual review of a course purchase. Submission is not approval or confirmation that money has been returned.     |
| **Request a refund** | The customer-facing action for opening and submitting the request form.                                                                   |
| **Awaiting review**  | The customer-facing label for a request with internal status `requested`.                                                                 |
| **Requested amount** | The amount being requested, not confirmation of an approved or paid refund. Existing amount calculations and formatting remain unchanged. |
| **Chargeback**       | A bank/payment-provider dispute, not this refund request flow.                                                                            |
| **Close**            | Dismisses the form only. It does not withdraw a submitted request or change the purchase.                                                 |

## Wording to avoid in this flow

- **Cancel my purchase**, **cancellation**, and **reversal** are not alternative
  names for a refund request.
- **Pending chargeback** incorrectly describes the request as a bank dispute.
- **Refund pending**, **Refunded**, and **Refund sent** could imply approval or
  payment processing; none describes a submitted request.

The acknowledgement **Refund request received** confirms submission only. It
does not promise approval, repayment, a processing date, or a follow-up email.
The existing confirmation email template is logged, not delivered. This
terminology introduces no new screens or workflows and changes no eligibility,
access, internal identifiers/statuses, or payment behavior.
