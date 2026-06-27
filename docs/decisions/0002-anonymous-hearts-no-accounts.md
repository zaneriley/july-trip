# 0002 — Hearts are anonymous, with no accounts

Status: accepted

## Context

Five people need a lightweight way to signal "I'd want to do this" across a set of
options. The group is small and trusts each other. Building auth — sign-up,
login, sessions, a database of users — would be far more machinery than a weekend
trip decision warrants, and it would add friction that kills participation.

## Decision

Hearts are anonymous and shared. A small Cloudflare Worker keeps one integer per
card in a KV namespace. The page reads all counts in a single `GET /hearts` and
writes with `POST /heart/:cardId` (add) or `DELETE /heart/:cardId` (take back).
There is no auth and no rate limiting beyond Cloudflare's defaults.

To stop one phone from padding a number, the client remembers in `localStorage`
which cards this device has hearted. That makes hearting a per-device toggle: the
first tap adds, a second takes it back. It is not tamper-proof — a determined
person could clear storage — and that is acceptable for a group of five.

## Consequences

- No personal data is stored anywhere. The Worker holds only counts.
- The signal is approximate, not an audited vote. Good enough to see what the
  group leans toward.
- If the Worker URL is unset, hearts still work locally per device; counts simply
  aren't shared until the Worker is deployed.
