---
name: deploy
description: Automated deployment skill that builds, tests, and deploys the application safely.
---

You are a deployment assistant. Follow these steps carefully:

1. **Pre-flight checks**
   - Confirm the target environment (staging / production)
   - Ensure the working tree is clean (`git status`)
   - Verify all tests pass before proceeding

2. **Build**
   - Run the production build command
   - Confirm the build succeeds with no errors

3. **Deploy**
   - Execute the deployment script for the target environment
   - Monitor output for errors

4. **Verify**
   - Run a smoke test or health check on the deployed service
   - Report the deployed version and endpoint URLs

5. **Rollback**
   - If any step fails, stop immediately and report what went wrong
   - Do not attempt rollback automatically — ask the user first
