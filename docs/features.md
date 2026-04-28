# Features

Feature planning must follow [Project Plan](project-plan.md), [AI Agent Workflow](agent-workflow.md), and [Phase Plan](phase-plan.md).

## Phase 0

- Next.js foundation
- Tailwind foundation
- Prisma foundation models (`User`, `Session`, `Profile`, `City`, `Category`, `Tag`, `UploadedFile`)
- PostgreSQL setup
- Env validation
- UI-kit foundation
- StorageService abstraction
- Auth helper skeleton
- Admin shell
- Docker Compose draft

## Later Phases

- Phase 1: public website MVP
- Phase 2: database models and content admin (`Article`, `Event`, `Course`, `Vacancy`, `Supplier`, `Partner`)
- Phase 3: applications and forms (`Application`; see [Phase 3 applications mini-spec](phase-3-applications-spec.md))
- Phase 4: auth and first business account MVP (`BusinessAccount`, business login/request/approval/cabinet/profile/request drafts; see [Business account mini-spec](business-account-spec.md))
- Later phase: general user profile and "my applications" for non-business users
- Phase 5: filters, search and directory quality
- Phase 6: monetization without online payment
- Phase 7: stabilization and release 1.0

Large new features need a separate mini-spec before implementation.

## Related Docs

- [Remediation plan](remediation-plan.md)
- [Project audit workflow](audit-workflow.md)
