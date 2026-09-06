# Project conventions

## Parental gate (Photo Studio)

The parental math-question gate (`src/pages/photo/ParentalGate.tsx`) guards
only actions that send a child's photo **outside the app** — currently just
sharing. It does not guard actions that stay local: retaking a shot,
deleting a photo, clearing the whole gallery, or saving a copy to the
device. A child undoing their own mistake isn't what the gate exists to
prevent.

When wiring up a new action in Photo Studio (or gating anything similar
elsewhere in the app), ask "does this leave the app or reach someone else?"
before putting it behind the gate — if the answer is no, it shouldn't need
one.
