# redactthing Development Plan

## Project Overview

redactthing is a Chrome extension that helps streamers and content creators hide sensitive personal information (PII) like email addresses from being visible in the browser. With one click, it redacts emails and other configured sensitive data using various modes (blur, hide, redact, mask).

**Tech Stack:** Chrome Extension (Manifest V3), vanilla JavaScript, HTML/CSS

## Current State

- Version 0.0.1 with basic functionality
- Manifest V3 extension structure
- Content script for page manipulation
- Service worker for background processing
- Options page for PRO settings
- Popup for quick toggle
- Modes: blur, hide, redact, mask, show

## Phase 1: Core Functionality (Weeks 1-2)

### Goals
- Reliable email detection and redaction
- Smooth toggle experience
- Persistent settings

### Deliverables
- [ ] Robust email regex pattern
- [ ] All redaction modes working (blur, hide, redact, mask)
- [ ] Settings persistence via chrome.storage
- [ ] One-click toggle from popup
- [ ] Auto-redact on page load option
- [ ] Handle dynamically loaded content (MutationObserver)
- [ ] Whitelist specific domains

## Phase 2: Enhanced Detection (Weeks 3-4)

### Goals
- Broader PII detection
- Custom patterns
- Better UX

### Deliverables
- [ ] Phone number detection
- [ ] Address detection
- [ ] Credit card number patterns
- [ ] Custom regex patterns in settings
- [ ] Import/export settings
- [ ] Keyboard shortcut for toggle
- [ ] Badge icon showing status
- [ ] Context menu integration

## Phase 3: Chrome Web Store Launch (Weeks 5-6)

### Goals
- Production-ready extension
- Store listing
- Monetization setup

### Deliverables
- [ ] Privacy policy
- [ ] Extension screenshots and promo images
- [ ] Store description and keywords
- [ ] Code review and security audit
- [x] Remove jQuery dependency (vanilla JS)
- [ ] Performance optimization
- [ ] Chrome Web Store submission
- [ ] PRO tier setup (one-time or subscription)
- [ ] Landing page for marketing

## Success Metrics

| Metric | Target |
|--------|--------|
| Chrome Web Store rating | 4.5+ stars |
| Weekly active users | 1000+ |
| Detection accuracy | 99%+ (no false negatives) |
| Page performance impact | < 50ms |
| PRO conversion | 5% of users |

## Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | Weeks 1-2 | Email detection, modes, settings |
| Phase 2 | Weeks 3-4 | PII patterns, custom rules, UX |
| Phase 3 | Weeks 5-6 | Store launch, monetization |
