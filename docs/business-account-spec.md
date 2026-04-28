# Business Account Mini-Spec

Status: planned; owner decision captured on 2026-04-28.

This document records the account direction before implementation. It does not start code work.

## Owner Decision

The first personal cabinet should be for businesses only.

Candidate, student, community-member and general user profiles are not planned for the first account implementation. They remain a future product direction and should not be removed from project docs, but they must not be treated as current MVP scope.

## Goal

Give approved businesses a private cabinet for working with BARSYNERGY requests and placements without building public profiles, candidate profiles, employer self-service publishing or online payments.

## Target Business Users

Business account can represent:

- venue or bar employer;
- supplier;
- partner;
- education or corporate-training client;
- service provider from the bar industry.

The account belongs to a company or organization, not to a public personal profile.

## Registration And Login Direction

Recommended MVP flow:

```txt
Business submits a public request
-> admin reviews the request
-> admin approves the business account
-> system creates or invites the business account owner
-> business sets password or receives a login link
-> business logs in to the business cabinet
```

Rules:

- open self-registration can exist only as a request, not as instant account activation;
- admin approval is required before a business can manage placements;
- login should use email and password with PostgreSQL sessions and httpOnly cookies;
- password reset and invite acceptance should be email-based when an approved email provider is configured;
- until email is configured, admin-created accounts or manual invite links may be used for local/internal testing only;
- business accounts must not expose candidate personal data automatically.

## First Cabinet Capabilities

First useful business cabinet scope:

- company profile: company name, contact person, city, website, phone or Telegram, description;
- vacancy placement requests: create, edit draft, submit for review, see status;
- supplier or partner placement requests: create, edit draft, submit for review, see status;
- corporate training or certificate order requests: create and track status;
- view own submitted applications and placement requests;
- see admin status and notes intended for the business;
- respond to admin clarification requests;
- receive reviewed candidate responses only after admin forwarding and candidate consent;
- see manual payment or invoice status later, without online payment in the first slice.

## Out Of Scope For First Business Cabinet

- candidate personal cabinet;
- saved resume profile;
- public user profiles;
- public employer profile pages;
- instant vacancy publishing without admin review;
- automatic candidate matching;
- automatic forwarding of vacancy responses;
- online payment, acquiring, receipts or subscriptions;
- business team management with multiple staff users;
- public messaging between candidates and businesses.

## Data Model Direction

Likely future entities:

- `BusinessAccount` or `Organization`;
- business owner relation to `User`;
- business profile fields;
- relation from `Application` to business account when the request comes from an authenticated business;
- optional relation from `Vacancy`, `Supplier` and `Partner` to business account after admin approval.

Keep the first implementation small. If a field is only needed for one request type, store it in `Application.payload` until repeated usage proves it deserves a first-class column.

## Relationship To Phase 3

Phase 3 public application forms should still work without a business account.

Business cabinet is a later account layer over the application flow:

- unauthenticated business can submit a request;
- approved business can later log in and track or edit its own requests;
- admin remains the publishing gate for vacancies, suppliers and partners.

## Validation Expectations

Before the business cabinet is marked done:

```bash
npm run lint
npm run typecheck
npm run build
./node_modules/.bin/prisma validate
```

Additional checks:

- unapproved business cannot access the cabinet;
- business can see only its own requests;
- business cannot view candidate personal data before admin forwarding;
- business cannot publish public content directly;
- admin can approve, block or archive business access;
- ordinary users still have no general personal profile in this slice.
