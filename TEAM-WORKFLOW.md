# EcoSphere — Team Workflow (4 developers, 4 branches)

Repo layout: `main` holds the agreed skeleton; each developer works ONLY on
their own branch and ONLY in their own files (listed below), so branches
merge without conflicts.

| Developer | Branch                 | Area                                                                 |
| --------- | ---------------------- | -------------------------------------------------------------------- |
| Dhrumil   | `auth`                 | Auth, users/profile, Settings (departments, categories, ESG config, notification settings), notifications, **integration files** |
| Neel      | `environmental`        | Emission factors, product ESG profiles, carbon transactions, environmental goals, auto-emission calculator |
| Kavya     | `social-governance`    | CSR activities, employee participation, diversity; policies, acknowledgements, audits, compliance issues; evidence upload |
| Yagna     | `gamification-reports` | Challenges, participation, badges, rewards, redemption, leaderboard, ESG scores, executive dashboard, all reports |

Each developer's exact file list is in their folder: `dhrumil/README.md`,
`neel/README.md`, `kavya/README.md`, `yagna/README.md`.

## Conflict rules (important)

- A file is edited by its owner only. Every stub's first line names the owner.
- **Shared integration files** — `Backend/src/app.js`, `Backend/src/config/schema.sql`,
  `Frontend/src/routes/AppRoutes.jsx`, `Frontend/src/components/layout/Sidebar.jsx` —
  are owned by **Dhrumil**. Everyone else sends him what to add (route mounts,
  tables, nav items) instead of editing directly.
- Each module has its OWN routes/validators/service files, so day-to-day work
  never touches another branch's files.

## One-time setup (run by one person, e.g. Dhrumil)

The local clone lives at `D:\ODOO GITHUB\ECOSphere`
(remote: https://github.com/Neel2102/ECOSphere.git). The Phase 1 skeleton is
committed on `main` and the 4 branches exist locally. Push everything:

```bash
cd "D:\ODOO GITHUB\ECOSphere"
git push -u origin main
git push -u origin auth environmental social-governance gamification-reports
```

## Per-developer setup (each of the 4, on their own machine)

```bash
git clone https://github.com/Neel2102/ECOSphere.git
cd ECOSphere
git checkout <your-branch>        # e.g. git checkout environmental
cd Backend  && npm install
cd ../Frontend && npm install
```

## Daily loop (every developer)

```bash
git checkout <your-branch>
git pull origin main              # stay current with merged work
# ...edit ONLY your own files...
git add <your files>
git commit -m "feat(<area>): <what you did>"
git push origin <your-branch>
```

Then open a Pull Request on GitHub: `<your-branch>` → `main`.

## Merge order (after backend is complete)

Merge PRs in this order to keep integration painless:

```bash
# 1. auth (base: middleware, settings, notifications used by everyone)
# 2. environmental
# 3. social-governance
# 4. gamification-reports (depends on scores fed by the other modules)
```

After each merge, the other three run `git pull origin main` on their branch
(or `git merge main`) before continuing.

## Phases

1. **Phase 1 (done)** — this skeleton, on `main`.
2. **Phase 2** — backend implementation; when complete, each developer copies
   their listed backend files onto their branch and pushes (no overlaps).
3. **Phase 3** — frontend implementation; same per-owner split.
