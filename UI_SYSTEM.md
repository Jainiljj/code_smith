# UI_SYSTEM.md — Visual Design System

## Product

SIH26100 — AI-Powered Integrated Bid Compliance Verification Platform

The UI should look like a serious enterprise/government procurement operations platform: calm, trustworthy, structured, information-dense, and highly auditable.

Use **shadcn/ui + Tailwind CSS** as the primary component foundation.

The repository may also contain **React Bits** resources under `.agents/react-bits`. React Bits is an enhancement library, not the project design-system authority. Use it selectively for high-quality motion, transitions, and distinctive but restrained interface details. Never replace the SIH26100 visual language with a generic React Bits showcase aesthetic.

---

# 1. Design Principles

1. Trust over decoration
2. Clear hierarchy
3. Dense but readable information
4. Evidence must be easy to trace
5. Status must be immediately scannable
6. Human review must be visually distinct from AI recommendation
7. Accessibility first
8. Responsive by default
9. Reuse components
10. No unnecessary animations
11. Motion must communicate state, hierarchy, or feedback
12. React Bits components are optional enhancements, never mandatory dependencies
13. shadcn/ui primitives and this document remain the source of truth
14. Government/procurement seriousness must never be sacrificed for visual novelty

---

# 1A. React Bits Integration Rules

React Bits resources may be available at:

```text
.agents/react-bits/
```

Treat this directory as a **component and animation toolbox**, not as a second application architecture. The AI code editor must inspect the available React Bits component/skill before using one and must adapt it to this UI system.

## Allowed use

Prefer React Bits selectively for:

- Subtle page/section entrance transitions
- Evidence-panel reveal/expand motion
- Processing/progress visualizations
- Empty-state illustrations or lightweight animated visual cues
- Focused dashboard emphasis
- Hover/focus micro-interactions
- Smooth transitions between analysis states
- Carefully chosen text or background effects when they improve comprehension

## Restricted use

Do **not** use React Bits merely because an effect looks impressive. Avoid or reject:

- Full-screen flashy animated backgrounds
- Excessive particle effects
- Large 3D/WebGL scenes
- Decorative text animations on every page
- Infinite marquee effects
- Parallax-heavy layouts
- Bouncy or playful enterprise navigation
- Animation that competes with compliance results
- Components that introduce large dependency chains without clear value

Three.js, React Three Fiber, GSAP, Chakra UI, or other React Bits dependencies must not be added just to support a decorative effect. Prefer the lightest implementation that achieves the required UX.

## Selection hierarchy

When building a UI element, use this order:

```text
1. Existing project component
2. shadcn/ui primitive
3. Existing local reusable component
4. React Bits component adapted to this system
5. New custom component only when necessary
```

Never copy an entire React Bits demo/application into the SIH26100 frontend. Copy/adapt only the specific component needed.

## Adaptation requirements

Every React Bits component used in the application must:

- Follow the project's semantic color tokens
- Follow the typography scale in this document
- Follow the project's spacing and radius rules
- Work in both light and dark themes
- Respect `prefers-reduced-motion`
- Have keyboard/focus accessibility where interactive
- Avoid hard-coded brand colors unless explicitly defined as tokens
- Avoid introducing a second styling system
- Avoid unnecessary global CSS
- Be composable with shadcn/ui
- Preserve readable evidence and compliance information

If a React Bits component conflicts with this document, **this document wins**.

## Motion budget

Motion is treated as a limited UX budget. Use animation where it answers one of these questions:

```text
What changed?
What is processing?
What can I interact with?
What should I notice?
What has completed?
```

If the animation answers none of these, remove it.

---

# 2. Typography

Preferred font stack:

```text
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

## Scale

| Token | Size | Weight | Usage |
|---|---:|---:|---|
| display | 32px | 700 | Major page title |
| h1 | 28px | 700 | Main headings |
| h2 | 24px | 650 | Section headings |
| h3 | 20px | 600 | Card/section title |
| h4 | 16px | 600 | Subsection |
| body-lg | 16px | 400 | Important body |
| body | 14px | 400 | Default UI |
| body-sm | 13px | 400 | Secondary content |
| caption | 12px | 500 | Metadata |
| mono | 12–13px | 500 | IDs, JSON, technical values |

Rules:

- Do not use more than 4 typography levels on one screen.
- Use sentence case for UI labels.
- Avoid all-caps except tiny status labels where necessary.
- IDs such as `REQ-014` should use monospace.

---

# 3. Color System

Use semantic tokens rather than hard-coded colors.

Base:

```text
background:        --background
foreground:        --foreground
card:              --card
card-foreground:   --card-foreground
muted:             --muted
muted-foreground:  --muted-foreground
border:            --border
input:             --input
ring:              --ring
primary:           --primary
primary-foreground:--primary-foreground
```

## Semantic compliance colors

Use these consistently:

```text
COMPLIANT
→ success semantic

PARTIALLY_COMPLIANT
→ warning semantic

NON_COMPLIANT
→ destructive/error semantic

UNVERIFIED
→ neutral/info semantic

NOT_APPLICABLE
→ muted semantic
```

Do not rely on color alone.

Every compliance badge should contain:

```text
icon + text
```

Example:

```text
✓ Compliant
◐ Partially compliant
! Non-compliant
? Unverified
— Not applicable
```

---

# 4. Dark/Light Mode

Support light and dark themes through CSS variables.

Never hard-code a color in component JSX.

Bad:

```tsx
className="text-red-500"
```

Prefer semantic design tokens.

The compliance semantics must remain understandable in both themes.

---

# 5. Spacing

Use an 8px-based rhythm.

Preferred:

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Typical layout:

```text
Page padding: 24–32px
Card padding: 20–24px
Section gap: 24–32px
Table cell padding: 12–16px
Form field gap: 16px
```

Avoid excessive whitespace in operational dashboards.

---

# 6. Shapes / Border Radius

Use restrained enterprise shapes.

```text
small controls: 6px
buttons:        6–8px
inputs:         6–8px
cards:          10–12px
dialogs:        12px
large panels:   12–16px
```

Avoid:

- Extremely rounded cards
- Pill-shaped everything
- Excessive glassmorphism
- Decorative blobs
- Excessive shadows

Pills are appropriate for statuses/tags only.

---

# 7. Borders and Shadows

Default:

```text
1px subtle border
```

Cards should normally use borders rather than heavy shadows.

Use shadows only for:

- Dialogs
- Dropdowns
- Floating panels
- Important elevated surfaces

---

# 8. Buttons

Hierarchy:

### Primary

Used for the main action:

```text
Upload Tender
Run Analysis
Review Result
Generate Report
```

### Secondary

For supporting actions:

```text
View Evidence
Download
Filter
```

### Destructive

For irreversible actions:

```text
Delete
Reject
Remove
```

### Ghost

For low-emphasis actions:

```text
Cancel
Close
Back
```

Rules:

- Do not put two competing primary buttons beside each other.
- Every destructive action requires confirmation.
- Loading buttons must show progress.

---

# 9. Cards

Use cards for:

- KPI summaries
- Tender summary
- Bidder summary
- Risk summary
- Processing status
- Evidence blocks
- Review panels

A card should have:

```text
Title
Primary value/content
Supporting context
Optional action
```

Do not turn every small UI element into a card.

---

# 10. Dashboard KPI Cards

Example:

```text
┌────────────────────────────┐
│ Requirements Checked       │
│ 48                         │
│ ↑ 12 from last tender      │
└────────────────────────────┘
```

Recommended KPIs:

- Requirements
- Compliant
- Partial
- Non-compliant
- Unverified
- High-risk
- Pending review

---

# 11. Tables

Compliance is table-heavy.

Columns should be:

```text
Requirement
Category
Status
Evidence
Verification
Confidence
Review
```

Rules:

- Sticky table header for long lists
- Sortable columns where useful
- Filters above table
- Pagination for large datasets
- Empty state
- Loading skeleton
- Error state
- Row hover
- Keyboard accessibility
- Clickable rows only when obvious

Do not use tiny unreadable text to fit more columns.

---

# 12. Compliance Matrix

Primary visual pattern:

```text
Requirement       Status              Evidence     Confidence
──────────────────────────────────────────────────────────────
REQ-001           ✓ Compliant         2 sources      98%
REQ-002           ! Non-compliant     1 source       99%
REQ-003           ? Unverified        0 sources      72%
REQ-004           ◐ Partial           2 sources      84%
```

Status must be visually dominant.

---

# 13. Evidence Panel

When a reviewer opens a compliance result, show:

```text
Requirement
────────────────────
[requirement text]

Status
────────────────────
[status badge]

Verification
────────────────────
Deterministic / AI / Hybrid

Evidence
────────────────────
Document name
Page
Extracted value
Source snippet

Reasoning
────────────────────
Short explanation

Confidence
────────────────────
97%

Reviewer decision
────────────────────
Approve / Override / Add note
```

The user should never have to hunt for the source page.

---

# 14. AI vs Human Visual Language

AI-generated recommendation:

```text
AI Recommendation
```

Human decision:

```text
Human Decision
```

Use separate containers.

Never make AI recommendation visually look like the final decision.

Example:

```text
AI Recommendation
✓ Compliant
Confidence: 96%

        ↓

Human Review
[Approve] [Override]
```

---

# 15. Risk Score

Risk score should be transparent.

Show:

```text
Risk Score: 72 / 100

Contributors:
• 3 unverified requirements
• 1 contradiction
• 0 blacklist matches
• 2 missing documents
```

Do not present an unexplained black-box score.

---

# 16. Upload Experience

Document upload should support:

```text
Drag & drop
Browse files
Multiple files
Progress
Processing state
Success
Failure
Retry
```

Show accepted formats.

Example:

```text
PDF, DOCX, XLSX
Maximum file size: configured by backend
```

Never claim a document has been processed until backend confirmation exists.

---

# 17. Processing State

Use a visible progress component:

```text
Uploading        ✓
Parsing          ✓
Extracting       ✓
Indexing         ●
Analyzing        ○
Completed        ○
```

For long jobs:

```text
Analysis in progress
67%

Requirements: 34 / 48
Evidence: 92 / 130
```

---

# 18. Empty States

Every page must have a useful empty state.

Bad:

```text
No data
```

Good:

```text
No tenders yet

Create your first tender to begin compliance verification.

[Create Tender]
```

---

# 19. Error States

Errors must explain:

1. What failed
2. Why it may have failed
3. What the user can do

Example:

```text
Document processing failed

We could not extract readable content from this file.

Try uploading a clearer PDF or scanned document.

[Retry]
```

Never expose stack traces.

---

# 20. Toasts

Use toasts for:

- Saved
- Uploaded
- Export started
- Review completed
- Background job completed

Do not use toasts for critical compliance information that must remain visible.

---

# 21. Dialogs / Drawers

Use:

### Dialog

For:

- Confirmation
- Small forms
- Destructive actions

### Drawer / Sheet

For:

- Requirement detail
- Evidence detail
- Review
- Audit information

This keeps the user in context.

---

# 22. Icons

Use Lucide icons through shadcn-compatible icon usage.

Rules:

- Icon must have a semantic purpose.
- Do not use icons as decoration everywhere.
- Icon-only buttons require tooltips/accessible labels.
- Keep icon sizes consistent.

Typical:

```text
16px — inline
18px — buttons
20px — navigation
24px — major empty-state/icon areas
```

---

# 23. Charts

Charts should answer a question.

Good:

- Compliance distribution
- Risk contributors
- Processing time
- Non-compliance categories
- Tender comparison

Avoid decorative charts.

Every chart needs:

- Title
- Useful legend if required
- Tooltip
- Accessible text alternative where practical

---

# 24. Accessibility

Minimum expectations:

- Keyboard navigation
- Visible focus
- Proper labels
- ARIA only when necessary
- Color contrast
- No color-only status
- Accessible dialogs
- Accessible tables
- Screen-reader-friendly status labels

---

# 25. Responsive Behavior

Desktop is the primary procurement dashboard target, but support:

```text
Desktop
Tablet
Small laptop
```

At smaller widths:

- Collapse sidebar
- Convert dense tables to horizontal scrolling or structured cards
- Preserve evidence readability
- Never truncate important compliance status without a way to inspect it

---

# 26. Page Shell

Preferred structure:

```text
┌──────────────────────────────────────────────────────────────┐
│ Top bar                                                       │
├──────────────┬───────────────────────────────────────────────┤
│ Sidebar      │ Breadcrumb                                    │
│              │ Page title                                    │
│ Dashboard    │ Description / actions                         │
│ Tenders      │                                               │
│ Bidders      │ Main content                                  │
│ Documents    │                                               │
│ Compliance   │                                               │
│ Reviews      │                                               │
│ Reports      │                                               │
│ Audit Log    │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

---

# 27. Component Rules

Before creating a new component:

1. Check whether shadcn/ui already provides it.
2. Check whether the project already has a reusable version.
3. Check `.agents/react-bits` for a suitable component only when visual enhancement is genuinely useful.
4. Reuse before duplicating.
5. Keep components focused.
6. Avoid giant page components.
7. Separate data fetching from visual presentation where practical.
8. Do not introduce a component library dependency when a small local component is sufficient.
9. Keep visual behavior independent from backend business logic.

## React Bits component checklist

Before accepting a React Bits component, verify:

- It solves a real UX problem.
- It does not conflict with the enterprise visual language.
- It uses project tokens rather than hard-coded colors.
- It supports light/dark mode.
- It supports reduced motion.
- It is keyboard accessible when interactive.
- Its dependencies are justified.
- It does not increase bundle size unnecessarily.
- It does not obscure evidence, status, citations, or review actions.

Prefer adapting the component into `src/components/` over importing a large standalone demo.

---

# 28. Frontend State Rules

Always design these states:

```text
Loading
Success
Empty
Error
Permission denied
Processing
Partial data
```

Compliance pages additionally need:

```text
AI recommendation pending
Human review pending
Human override
Evidence unavailable
Evidence conflicting
```

---

# 29. Motion & Micro-interactions

Motion should feel polished, calm, responsive, and purposeful. React Bits may be used to implement these behaviors when the selected component can be kept lightweight and compliant with this document.

## Timing

```text
Instant feedback:     100–150ms
Standard transition:  150–250ms
Panel/modal motion:   200–300ms
Complex state change: 250–400ms maximum
```

Do not make users wait for decorative animation before they can act.

## Preferred motion patterns

- Fade/slide for contextual panels
- Subtle scale for dialogs and focused surfaces
- Smooth expand/collapse for evidence details
- Progress animation for document processing
- Skeleton shimmer for loading where appropriate
- Small status transitions when a compliance state changes
- Spring-like motion only when it remains restrained and fast

## Reduced motion

All non-essential motion must respect:

```css
@media (prefers-reduced-motion: reduce) {
  /* disable or simplify non-essential animation */
}
```

The application must remain fully understandable and usable with reduced motion enabled.

## Do not use

- Large bouncing elements
- Excessive parallax
- Attention-grabbing animation
- Decorative animated backgrounds
- Persistent motion behind tables or evidence
- Animation that changes the meaning of a compliance status
- Long entrance animations
- Multiple competing animations on the same screen

## AI code editor animation rule

Before adding an animated React Bits component, state briefly in the implementation plan:

```text
Purpose: <what user problem the animation solves>
Trigger: <what causes it>
Duration: <timing>
Reduced motion: <fallback>
Dependency impact: <new dependency or none>
```

If there is no clear purpose, do not add the animation.

---

# 30A. AI Code Editor UI Build Protocol

When implementing any frontend feature, the AI code editor must:

1. Read `README.md`.
2. Read `UI_SYSTEM.md`.
3. Inspect existing components before creating new ones.
4. Inspect `.agents/react-bits` only when an animation or visual component could materially improve the UX.
5. Prefer shadcn/ui for structure and controls.
6. Use React Bits only for the specific enhancement required.
7. Adapt the selected component to the SIH26100 tokens and accessibility rules.
8. Keep animations subtle around compliance, evidence, and audit data.
9. Avoid adding React Bits dependencies globally.
10. Run lint, type-check, and build after UI changes.
11. Verify light mode, dark mode, responsive behavior, keyboard navigation, and reduced-motion behavior.
12. Record meaningful UI decisions in `PROMPT_LOG.txt`.

The AI editor must never conclude that a screen is better simply because it contains more animation or visual effects.

---

# 30. Golden UI Rule

Every screen should answer:

> What is happening, why is it happening, what evidence supports it, and what can the procurement officer do next?

If a UI element does not help answer one of those questions, question whether it belongs.
