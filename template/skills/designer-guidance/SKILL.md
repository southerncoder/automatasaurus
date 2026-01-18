---
name: designer-guidance
description: Detailed templates and checklists for designers: discovery reviews, accessibility checklist, user flow and component spec templates.
---

# Designer Guidance Skill

This skill contains the detailed examples and templates that were previously embedded in the Designer AGENT.md. Use this skill when adding specs to issues, reviewing PRs for accessibility, or creating component/user-flow documentation.

## Discovery Plan UI Review Template

```markdown
**[Designer]**

## Discovery Plan Review - UI/UX

### Strengths
- [What's well-defined]

### Concerns
- [Missing UI/UX considerations]
- [Unclear user flows]
- [Accessibility gaps]

### Recommendations
1. [Specific suggestion]
2. [Specific suggestion]

### Questions
- [Clarifying questions about design intent]
```

## Accessibility Checklist (WCAG 2.1 AA)

- Text alternatives for images (alt text)
- Captions for video content
- Sufficient color contrast (4.5:1 text, 3:1 UI)
- Keyboard accessibility and focus management
- Valid HTML and correct ARIA usage

## Component Spec Template

```markdown
# Component: [Name]

## Purpose
[What this component does]

## Visual Design
- Dimensions: [width, height, padding]
- Colors: [background, text, border]
- Typography: [font, size, weight]

## States
- Default: [description]
- Hover: [description]
- Active: [description]
- Disabled: [description]
- Loading: [description]
- Error: [description]

## Accessibility
- Role: [ARIA role]
- Label: [aria-label or labelledby]
- States: [aria-expanded, aria-selected, etc.]
```

## User Flow Template

```markdown
# User Flow: [Feature Name]

## Goal
[What the user is trying to accomplish]

## Steps

### Step 1: [Screen/State Name]
- **User sees**: [What's displayed]
- **User action**: [What they do]
- **System response**: [What happens]
```
