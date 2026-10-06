# TESTING STRATEGY - WEDDING PLANNER PRO

## 1. Test Suite Overview
Automated tests are powered by **Vitest** configured in `vitest.config.ts`.

## 2. Test Execution
- **Run all unit & business logic tests:**
  ```bash
  npm test
  ```
- **Run TypeScript compilation check:**
  ```bash
  npm run typecheck
  ```
- **Run Next.js production build:**
  ```bash
  npm run build
  ```

## 3. Test Coverage Areas
1. **Countdown calculations:** Handling past, present, future, and missing wedding dates.
2. **Budget management:** Total, spent, committed, remaining balance, and negative amount validation.
3. **Table seating capacity:** Preventing seating guests beyond table limits.
4. **Guest RSVP state transitions:** Token lookup, dietary preference, and head count updates.
5. **Smart checklist milestones:** 12-month to 1-week milestone calculations.
