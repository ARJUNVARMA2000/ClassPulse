# ClassPulse UI/UX refresh

## Direction

Bring ClassPulse into the same visual family as Linear and Deuce: quiet near-black
surfaces, one indigo accent, crisp type, hairline borders, restrained depth, and
plainspoken product copy. Preserve the existing session flow and API behavior.

## Plan

- [x] Establish a shared design system in `frontend/src/index.css`: Deuce-inspired
      neutral palette, indigo accent, type scale, spacing, radii, focus states,
      responsive breakpoints, and reduced-motion behavior. Remove the grid,
      scanlines, neon glow, and “command center” styling.
- [x] Redesign the home view as a focused session-creation workspace with a compact
      product header, clearer hierarchy, an example prompt, and concise educator-led
      copy. Keep session creation behavior unchanged.
- [x] Redesign the student response flow for phone-first use: strong question
      hierarchy, simplified fields, clear character guidance, accessible states,
      and a calm confirmation screen.
- [x] Recompose the admin view as a wide live workspace: compact top bar, prominent
      prompt, response/live status, a dedicated share panel, and a clearer themes
      area that scans well as results update.
- [x] Restyle theme cards around one coherent accent system with quieter metadata,
      clearer student attribution, and no per-card rainbow treatment.
- [x] Validate the production build and lint, then review the three routes at desktop
      and mobile widths for overflow, hierarchy, keyboard focus, and readable states.

## Review

- Replaced the neon mission-control aesthetic with a restrained near-black and indigo
  design system inspired by Deuce, Linear, and Beautiful UI's compact AI primitives.
- Reworked all three experiences: prompt-led session creation, phone-first student
  response and confirmation, and a wider live dashboard with a dedicated share panel.
- Added clearer labels, character counts, disabled/loading/error states, keyboard focus
  treatment, reduced-motion support, and responsive layouts without horizontal overflow.
- Verified the production build and lint. Tested session creation, student submission,
  live response counts, empty analysis, and populated theme cards at 1440×1000 and
  390×844.
