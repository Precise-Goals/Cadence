# Cadence: A Self-Calibrating, Explainable What-If Planning Copilot for Press-Based Production

> **TE AI Cup 2027 | Theme: AI-Powered Production Planning & Capacity Optimization**
> Team of 6 | Virtual | Nov 2026 to Jun 2027
> Status: v0.2 draft (monorepo, hosting and LLM gateway decisions added). Items marked **[ASSUMPTION]** must be validated with TE mentors.

**Tagline:** *AI-powered production planning & capacity optimization that keeps its rhythm.*
**Package scope / repo name:** `@cadence/*`, `cadence`

---

## 1. One-Line Pitch

Planners can't trust production plans because the input data is stale, the constraints are hidden, and a single disruption breaks the plan within hours. **Cadence** learns real shop-floor behaviour from actuals, builds constraint-feasible schedules, stress-tests them with simulation, and lets planners ask "what if?" in plain language, with every answer explained and quantified.

It sits **beside** the planner's Excel and ERP. It does not replace them.

---

## 2. Problem Statement

### 2.1 The problem
In high-mix, press-based manufacturing (molding, stamping), planning breaks down for four connected reasons:

1. **Planning parameters are wrong.** Standard cycle times, yields, setup times and lead times in the ERP are often years old. Plans built on them are infeasible from day one.
2. **Constraints are hidden.** Mold or tool availability, press tonnage, material, changeover sequencing and operator limits live in spreadsheets, in people's heads, or in separate systems.
3. **Disruptions are constant.** Machine breakdowns, rush orders, material shortages and quality holds invalidate the plan. Re-planning is manual, slow and done in Excel.
4. **Plans are not stress-tested.** A plan may be "feasible" on paper but fragile. One breakdown cascades into missed due dates.

### 2.2 Why existing tools fall short
- Full APS suites (SAP IBP/PP-DS, Kinaxis, o9, Siemens Opcenter) are heavy, costly and slow to adapt. Planners still fall back to Excel.
- Generic "chat with your ERP" copilots are shallow. They answer questions but don't produce feasible, optimized, explainable plans.
- Black-box AI schedulers fail on trust. Planners won't act on a recommendation they can't trace to constraints.

### 2.3 The gap Cadence fills
A **trustworthy decision-support layer** that (a) fixes the inputs, (b) optimizes under real constraints, (c) tests robustness, and (d) explains itself, all through an interface planners already understand.

---

## 3. Target Users

| User | Pain today | What Cadence gives them |
|---|---|---|
| **Production planner / scheduler (primary)** | Spends hours in Excel re-sequencing after every disruption | Re-plan in minutes, with options and trade-offs |
| **Plant manager** | Can't see risk to on-time delivery until it's too late | Robustness scores, early bottleneck warnings |
| **Supply chain / demand planner** | Demand changes don't translate into capacity impact | Load-vs-capacity view under demand scenarios |
| **Industrial engineer / IT** | Bad master data, no feedback loop | Automated parameter drift reports |

**[ASSUMPTION]** The first target plant is a TE-like connector plant: injection molding and stamping presses feeding plating and assembly, with the press shop as the constrained bottleneck.

---

## 4. Solution Overview

Cadence is one vertical slice made of four modules that feed each other.

```
        ┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
 Data → │ 1.CALIBRATE│ →   │  2. PLAN   │ →   │3.STRESS-   │ →   │ 4. CONVERSE│ → Planner
        │ learn real │     │ constraint │     │   TEST     │     │ what-if    │   decision
        │ parameters │     │ scheduling │     │ simulation │     │ agent+XAI  │
        └─────▲──────┘     └────────────┘     └────────────┘     └─────┬──────┘
              └────────────── plan-vs-actual feedback loop ─────────────┘
```

### Module 1: Calibrate (data trust and learning)
- Ingests ERP-style exports, MES logs and Excel sheets through schema adapters.
- Runs a **data-quality pipeline**: missing values, unit mismatches, outliers, duplicate or orphan records.
- **Learns actual parameters** from history: cycle time distributions per part/mold/press, yield, setup duration by changeover pair, downtime patterns.
- Produces a **Parameter Drift Report**: "ERP says 12.0s cycle for PN-1043 on Press 4. Observed median is 14.6s (n=312, p90 17.1s)."
- Output: a calibrated parameter store with confidence intervals. Low-confidence parameters are flagged, not silently trusted.

### Module 2: Plan (finite-capacity optimizer)
- Constraint programming model (OR-Tools CP-SAT) covering:
  - Press and mold/tool compatibility and tonnage limits
  - Sequence-dependent changeovers
  - Due dates, priorities, order splitting and batching
  - Planned maintenance windows and shift calendars
  - Material availability (optional in v1)
- Configurable objectives: weighted lateness, makespan, changeover time, overtime and WIP.
- Warm-start and incremental re-solve for fast re-planning.

### Module 3: Stress-test (simulation-based robustness)
- Discrete-event simulation (SimPy) of the plant using the **calibrated stochastic parameters**.
- Monte Carlo runs score every plan for: expected on-time-delivery %, P90 lateness, bottleneck probability, schedule fragility.
- Core idea: **a plan is evaluated on how it survives, not just whether it is feasible.**
- Also serves as the "digital twin" for testing what-if scenarios safely.

### Module 4: Converse (agentic what-if copilot with explainability)
- Planner types: *"Press 4 is down for 2 days and order SO-8812 must ship Friday."*
- An LLM agent parses intent, translates it into a structured **scenario**, and calls tools (solver, simulator, KPI engine). **The LLM never computes the schedule itself.**
- Returns 2 to 3 ranked options with a KPI delta table and trade-offs, e.g. "Option B saves SO-8812 but delays 3 low-priority orders by 1 day (OTD 94.1% → 92.8%)."
- **Explainability layer:** each decision is traceable to binding constraints ("Job J-204 was moved to Press 2 because Mold M-17 is only compatible with Press 2 and 5, and Press 5 is booked for maintenance").
- **Human-in-the-loop:** nothing is published without planner approval. All actions go to an audit log.

### Feedback loop
Approved plans are compared with actuals. Deviations update Module 1 parameters, so the system improves with use.

---

## 5. Innovation (What Makes It Different)

| # | Innovation | Why it matters |
|---|---|---|
| 1 | **Self-calibrating parameters**: planning inputs are learned from actuals and drift is flagged | Fixes the root cause of bad plans, not just the symptom |
| 2 | **Robustness-scored plans**: every plan is simulated under uncertainty before being recommended | Moves from "feasible" to "dependable" |
| 3 | **Constraint-level explainability**: recommendations trace to binding constraints | Builds planner trust, the biggest adoption barrier |
| 4 | **LLM as orchestrator, not oracle**: the agent calls verified solvers and simulators, which limits hallucination risk | Safe agentic design for industrial use |
| 5 | **Data-quality-first design**: dirty data is handled as a feature, with confidence tags on every parameter | Realistic for real factories |
| 6 | **Excel-native wedge**: import and export plans in the planner's own format | Low-friction adoption, no rip-and-replace |

---

## 6. System Architecture

```
┌───────────────────────────────── Presentation ─────────────────────────────────┐
│ Web App (React/Next.js): Gantt, KPI dashboard, chat, scenario compare, approvals│
│ Excel import/export (+ optional Office add-in later)                           │
└──────────────────────────────────────▲─────────────────────────────────────────┘
                                       │ REST / WebSocket
┌──────────────────────────────────────┴─────────────────────────────────────────┐
│ API & Orchestration (FastAPI) | Auth (RBAC) | Audit log | Job queue (Celery/RQ) │
├───────────────┬───────────────┬────────────────┬────────────────────────────────┤
│ Agent Service │ Optimizer Svc │ Simulation Svc │ Calibration & Forecast Svc     │
│ LLM + tool    │ OR-Tools      │ SimPy +        │ pandas, scikit-learn,          │
│ calling,      │ CP-SAT        │ Monte Carlo    │ statsmodels/LightGBM,          │
│ guardrails    │               │                │ drift detection                │
├───────────────┴───────────────┴────────────────┴────────────────────────────────┤
│ Data Layer: PostgreSQL (+TimescaleDB optional) | Object store | Feature/param    │
│ store | Ingestion adapters (CSV/Excel/ERP-style/MES-style) | Validation (Great    │
│ Expectations / Pandera) | Synthetic Plant Generator                              │
├──────────────────────────────────────────────────────────────────────────────────┤
│ Platform: Docker | CI/CD (GitHub Actions) | Observability (Prometheus/Grafana,   │
│ structured logs) | Cloud-agnostic, on-prem capable (Docker Compose / K8s)        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Proposed stack (adjustable)
| Layer | Choice | Notes |
|---|---|---|
| Language | Python 3.11+, TypeScript | |
| Backend | FastAPI (Python), Pydantic, SQLAlchemy | Solver, simulator and calibration stay in Python |
| Optimization | OR-Tools CP-SAT | Free, strong for scheduling |
| Simulation | SimPy | |
| ML | scikit-learn, LightGBM, statsmodels, SciPy | Distribution fitting, drift tests |
| LLM | Gateway over OpenRouter (free models), Sarvam AI (Indic languages), local Ollama | See section 8.5. Vercel AI SDK in Next.js route handlers |
| Data | PostgreSQL, Parquet | |
| Frontend | Next.js (App Router) in **JSX**, Zod for runtime validation, JSDoc types, Gantt library, Recharts | Monorepo via Turborepo + pnpm |
| DevOps | Docker, GitHub Actions, Vercel (web), Cloud Run or equivalent (heavy solver) | Student credits; see section 6.1 |
| Quality | pytest, Pandera, Ruff, pre-commit | |

---

## 6.1 Hosting and Deployment Strategy (Fast by Design)

**Question:** can the Python solver API run on Vercel alongside Next.js?
**Answer:** yes for light work, but not as the only home for the solver. Vercel supports Python functions (including FastAPI), so the **web app and light endpoints** fit well. CP-SAT solves and Monte Carlo simulations are CPU-heavy and long-running, which conflicts with serverless limits (execution time, CPU per instance, bundle size, no background workers). Limits change, so measure them in the Week-1 spike below instead of assuming.

### Recommended hybrid topology

| Workload | Where | Why |
|---|---|---|
| Next.js UI, agent route handlers, auth | **Vercel** | Best-in-class Next.js hosting, edge delivery, preview deploys |
| Light Python endpoints (data validation, parameter lookup, KPI calc, small solves of about 5 to 10 s) | **Vercel Python functions** (same repo) | Zero extra infra, same deploy |
| Heavy solve and Monte Carlo simulation | **Containerized FastAPI on Google Cloud Run** (alternatives: Render, Railway, Fly.io) | Multi-vCPU, long request timeouts, can keep 1 warm instance, CP-SAT uses multiple workers |
| Database | Neon or Supabase Postgres | Free tier, serverless-friendly |
| Long jobs | Job queue + polling or streaming (SSE) | UI stays responsive while Monte Carlo runs |

### Speed tactics
1. **Region alignment:** place the Vercel functions and the solver container in the same region, close to the demo audience (e.g. Mumbai). This cuts round-trip latency.
2. **Keep one warm instance** of the solver container during demos and judging (min instances = 1) to avoid cold starts.
3. **Time-limited solves with best-so-far results:** return a feasible plan quickly, then stream improvements.
4. **Warm-start and incremental re-solve** from the current plan after a disruption instead of solving from scratch.
5. **Cache** deterministic results (scenario hash to plan and KPIs).
6. **Stream** progress to the UI (SSE) so the planner sees partial results within seconds.
7. **Right-size the problem** for the demo (a plant slice, a 1-week rolling horizon, frozen near-term jobs).
8. **Record and replay** LLM calls for the live demo (section 8.5).

### Week-1 decision spike (gate)
Deploy a minimal FastAPI function with OR-Tools to Vercel and the same code to Cloud Run. Measure cold start, bundle fit, and solve time on a demo-sized instance (say 30 presses and 200 jobs). **If Vercel meets the target (about 10 s end-to-end), use it for light solves; heavy runs always go to the container.** Document the result as an ADR.

### On-prem story
The same Docker images run via Docker Compose inside a plant network, with a local LLM, so the "factory data never leaves the site" claim is real.

---

## 7. Data Strategy (Biggest Risk, Turned into a Feature)

TE data may not be available early, and real data is dirty. The plan has three tiers.

### Tier 1: Synthetic Plant Generator (start in week 1)
A configurable generator that produces a realistic press shop:
- 10 to 30 presses (tonnage classes), 50 to 200 molds/dies, 200 to 1000 part numbers
- Cycle-time distributions (lognormal) with **deliberately stale "ERP" values** and different "true" values
- Sequence-dependent changeover matrix, planned and random downtime (Weibull/exponential), scrap rates
- Orders with realistic demand patterns, rush orders and seasonality
- **Injectable data defects**: missing values, unit errors, duplicates, outliers. These are used to test the quality pipeline.
- Ground truth is known, so calibration accuracy can be **measured objectively**.

### Tier 2: Public and benchmark data
- Job-shop and flexible job-shop scheduling benchmarks (Taillard, Brandimarte and similar) for solver validation
- Public predictive-maintenance and manufacturing datasets for the downtime and yield models

### Tier 3: TE sample data (if provided by mentors)
- Anonymized slice of orders, routings, cycle times and downtime logs
- Schema adapters are built so that swapping in real data is a configuration change, not a rewrite.

### Canonical data model (core entities)
`Plant, Press/Machine, Mold/Tool, PartNumber, Routing, Order, Job, ChangeoverMatrix, Calendar/Shift, MaintenanceWindow, MaterialStock, ActualRun (cycle, yield, downtime), Plan, PlanVersion, Scenario, KPIResult, AuditEvent`

---

## 8. AI / Agentic Design

### 8.1 Agent architecture
```
Planner message
   → Intent & entity extraction (LLM, JSON schema output)
   → Scenario object (validated by Pydantic; ambiguous inputs trigger a clarifying question)
   → Tool calls: get_current_plan | apply_disruption | solve | simulate | compare | explain
   → Result assembler (numbers come ONLY from tool outputs)
   → Narrative + KPI table + options → planner approves / edits / rejects
```

### 8.2 Tools exposed to the agent
| Tool | Purpose |
|---|---|
| `get_plan_state` | Read the current plan, jobs and KPIs |
| `apply_disruption` | Machine down, rush order, material delay, quality hold, demand change |
| `solve_schedule` | Run CP-SAT with specified objective weights and frozen jobs |
| `simulate_plan` | Monte Carlo robustness scoring |
| `compare_plans` | KPI deltas and affected-order list |
| `explain_decision` | Constraint trace for a job placement |
| `get_parameter_confidence` | Show how trustworthy a parameter is |

### 8.3 Guardrails
- **No LLM-generated numbers.** All KPIs come from the solver, simulator or database.
- **Schema-validated** tool calls. Invalid or ambiguous scenarios prompt a clarifying question.
- **Frozen horizon:** jobs already in progress or locked are not moved without explicit approval.
- **Approval gate and audit log** for every published plan change.
- **Evaluation harness** for the agent: a test set of 100+ disruption phrasings with expected structured scenarios. Track parse accuracy, tool-selection accuracy and refusal behaviour.
- **Privacy:** supports local/open-source models for sensitive environments. No raw data is sent to external APIs in on-prem mode.

### 8.4 Calibration and forecasting models
- Distribution fitting for cycle time and setup time (lognormal, gamma, empirical bootstrap), with Bayesian shrinkage for sparse parts
- Drift detection (KS test, CUSUM) comparing ERP parameters to observed
- Downtime and failure modelling (survival or Weibull fitting) feeding the simulator
- Demand forecasting (baseline: seasonal naive, ETS; advanced: LightGBM quantile models) for the load-vs-capacity view

### 8.5 LLM gateway (provider-agnostic)
- One gateway interface with three providers behind it: **OpenRouter** (free models, main dev and eval), **Sarvam AI** (Indic-language what-ifs such as Hindi or Marathi), and **local Ollama** (on-prem mode). Select with an environment variable.
- Use the **Vercel AI SDK** in Next.js route handlers; the agent calls the Python solver and simulator endpoints as tools.
- **Zod schemas** validate every scenario and tool input at runtime. This replaces the compile-time safety that TypeScript would give, since the project uses JSX.
- **Pin a primary and a backup model**, and run a small regression set (the 100+ phrasings) on every change so a rotated free model can't silently break parsing.
- Confirm tool-calling and structured-output support per model before depending on it.
- **Record and replay** LLM responses for rehearsed demo scenarios so rate limits can't break a live demo.
- Optional small paid-credit fallback for the final month.

---

## 9. Evaluation Plan (How We Prove It Works)

### Baselines
1. Manual-style heuristic: earliest due date (EDD) / FIFO dispatching
2. ERP-parameter-based schedule (uncalibrated)
3. Cadence (calibrated + optimized + robustness-scored)

### Metrics
| Area | Metric |
|---|---|
| Calibration | Parameter error vs ground truth (MAPE) before/after; drift detection precision/recall |
| Plan quality | On-time delivery %, total tardiness, changeover time, utilization, WIP |
| Robustness | OTD under Monte Carlo disruptions (mean, P10/P90) |
| Re-planning speed | Time to a validated option after a disruption (target: under 60 s for the demo plant) |
| Agent quality | Scenario parse accuracy (target ≥ 95%), tool-call correctness, zero hallucinated KPIs |
| Explainability | Planner-rated clarity (user study with mentors or peers) |
| Engineering | Test coverage, API latency, reproducible runs |

### Target outcomes (to be validated, not promised)
- Parameter error reduced by more than 50% after calibration on synthetic ground truth
- On-time delivery improvement of several points over baseline in disruption scenarios
- Re-planning time cut from hours (manual) to minutes
- Fewer changeover minutes per week through sequencing

---

## 10. Impact and Value

**Value to TE first (productizable later).**

| Impact | Mechanism |
|---|---|
| Higher on-time delivery | Robust plans, faster disruption response |
| Better capacity utilization | Realistic parameters expose true capacity |
| Lower changeover loss | Sequence-aware optimization |
| Lower expedite and overtime cost | Early bottleneck warning, scenario testing |
| Lower inventory / WIP | Plans that hold up reduce buffer padding |
| Better master data | Continuous parameter-drift detection |
| Planner productivity | Hours of manual re-sequencing become minutes |
| Scalability | Pattern replicable across TE plants and product families |

**Sustainability angle:** less scrap and idle time, less overtime and expedited freight.

---

## 11. Business Model

### Phase A: Value to TE (hackathon and pilot)
- Deliverable: a working decision-support tool and a pilot playbook for one plant/line.
- Value case: measured gains in OTD, utilization and planner hours, with an ROI calculator template.

### Phase B: Open-core / portfolio
- Open-source the calibration, synthetic generator and scheduling core (builds credibility and community).
- Keep enterprise connectors, advanced agent features and hosting as the commercial layer.

### Phase C: Productization (optional startup path)
- **Customers:** mid-size discrete manufacturers (10 to 500 plant staff) that outgrew Excel but can't afford or deploy a full APS.
- **Pricing options:** per-plant annual subscription; per-seat for planners; pilot-to-production fee.
- **Go-to-market:** pilot-led, a 6 to 8 week proof of value on one line, then expand.
- **Moat:** calibrated parameter store (data network effect per customer), trusted-explanation UX, integrations.

### Competitive positioning
| Competitor | Their strength | Our angle |
|---|---|---|
| SAP, Kinaxis, o9, Siemens | Full suites, enterprise footprint | We complement them. Lightweight, fast, explainable layer beside the system of record |
| Generic ERP chatbots | Easy Q&A | We produce optimized, validated plans, not just answers |
| In-house Excel | Familiar | We keep Excel as the interface but add intelligence |

---

## 12. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| No real TE data | High | Synthetic generator + adapters + public benchmarks; request a small anonymized sample early |
| Domain misfit (TE problem differs from our assumption) | Medium | Validate assumptions with mentors in month 1; keep the data model configurable |
| Solver too slow at scale | Medium | Rolling horizon, decomposition, warm starts, time-limited solves with best-found solution |
| LLM hallucination or parse errors | Medium | Tool-only numbers, schema validation, eval harness, clarifying questions |
| Scope creep | High | Hard "vertical slice" rule. Roadmap items stay in the backlog |
| Team skill gaps | Medium | Pair roles, early spikes, TE global training sessions |
| Virtual collaboration friction | Medium | Weekly sprint, ADRs, shared board, code review rules |
| Planner distrust | Medium | Explainability, approval gate, side-by-side comparison with baseline |
| Data security | Low-Med | On-prem option, local LLM mode, RBAC and audit logs |
| Serverless limits hit by solver (timeouts, CPU, bundle size) | Medium | Hybrid hosting (section 6.1), Week-1 spike, async jobs with streaming |
| Free LLM tiers rate-limited or rotated | Medium | LLM gateway, pinned backup model, regression set, record-and-replay demo |
| JSX has no compile-time type checks | Medium | Zod runtime schemas, JSDoc plus `@ts-check` on key files, contract tests against the OpenAPI spec |

---

## 13. Roadmap (Nov 2026 to Jun 2027)

> Adjust to TE's official milestones once confirmed.

| Phase | Timing | Goals | Deliverables |
|---|---|---|---|
| **0. Setup and alignment** | Nov 2026 | Mentor kickoff, validate assumptions, repo, CI, roles, data model v1 | Problem brief, backlog, architecture v0 |
| **1. Data foundation** | Dec 2026 | Synthetic Plant Generator, ingestion adapters, data-quality pipeline | Generator v1, validated dataset, DQ report |
| **2. Calibrate + Plan MVP** | Jan to Feb 2027 | Parameter learning and drift report; CP-SAT scheduler; Gantt UI | Calibrated store, baseline-vs-optimized results |
| **3. Simulate + Robustness** | Mar 2027 | SimPy twin, Monte Carlo scoring, plan comparison | Robustness metrics, scenario engine |
| **4. Agent + Explainability** | Apr 2027 | NL what-if agent, tool layer, constraint traces, approvals and audit log | Agent eval report, working chat demo |
| **5. Hardening and pilot-readiness** | May 2027 | Feedback loop, performance, security, docs, mentor user testing | Pilot playbook, deployment guide |
| **6. Final submission** | Jun 2027 | Polish, demo video, report, pitch | Final demo, report, open-source repo |

**Milestone rule:** the end-to-end skeleton (data → plan → UI) must work by end of Jan, then deepen each module rather than building them in isolation.

---

## 14. Team Roles (6 Members) **[ASSUMPTION: to be matched to actual skills]**

| Role | Owns |
|---|---|
| **1. Optimization / OR lead** | CP-SAT model, objectives, re-solve strategy |
| **2. Data & calibration lead (ML)** | Generator, DQ pipeline, parameter learning, drift detection, forecasting |
| **3. Simulation & analytics engineer** | SimPy twin, Monte Carlo, KPI engine, evaluation harness |
| **4. LLM / agent engineer** | Agent, tools, guardrails, NLP eval set, explainability narratives |
| **5. Backend & platform engineer** | FastAPI, DB, auth, audit, CI/CD, deployment |
| **6. Frontend & UX engineer** | Gantt, dashboard, chat UI, Excel import/export, planner usability |

Everyone also participates in: domain learning, testing, documentation and demo preparation. Rotate a "project manager and demo owner" role monthly.

---

## 15. Suggested Repository Structure (Monorepo: Turborepo + pnpm + uv)

```
cadence/
├── apps/
│   ├── web/                # Next.js App Router, JSX; agent route handlers
│   └── api/                # FastAPI (Python); package.json wrapper so turbo can run it
├── packages/
│   ├── ui/                 # shared React components (Gantt, KPI cards, chat)
│   ├── agent/              # LLM gateway, prompts, tools, Zod schemas
│   ├── api-client/         # client generated from FastAPI OpenAPI spec
│   └── config/             # eslint, prettier, jsconfig presets
├── services/               # Python libraries (uv workspace)
│   ├── optimizer/  simulator/  calibration/  synthetic_plant/
├── eval/                   # baselines, scenarios, agent regression set, reports
├── docs/                   # ADRs, architecture, data dictionary
├── infra/                  # Dockerfiles, Compose, CI, Cloud Run config
├── turbo.json  pnpm-workspace.yaml  pyproject.toml  Project.md  README.md
```

**Conventions**
- JSX everywhere in JS packages, with `jsconfig.json` path aliases and JSDoc types.
- The Python API exposes an OpenAPI spec; the JS client is generated from it in CI so the two never drift.
- `turbo dev | test | lint | build` run both JS and Python tasks.
- Preview deployments per pull request (Vercel for web, container build for the API).

---

## 16. Demo Script (Jury Story, about 5 Minutes)

1. **Hook:** "Your ERP says this part runs at 12 s. Reality is 14.6 s. Every plan built on that is already late."
2. **Calibrate:** upload messy plant data, show the DQ report and the Parameter Drift Report.
3. **Plan:** generate a week's schedule, show the Gantt view and KPIs against the EDD baseline.
4. **Disruption:** type "Press 4 is down 2 days, expedite SO-8812 for Friday."
5. **Options:** agent returns 3 options with KPI trade-offs and robustness scores.
6. **Explain:** click a moved job and show the constraint trace.
7. **Approve and export** to Excel, with the audit log entry.
8. **Close:** feedback loop, roadmap to multi-plant, and the measured results versus baseline.

---

## 17. Post-Hackathon Plan

1. **Immediately after:** open-source core modules, publish a technical write-up and demo video.
2. **0 to 3 months:** pilot with TE or a partner plant using real data. Harden connectors (SAP-style extracts, MES exports).
3. **3 to 6 months:** add maintenance-window integration (links to the Molding Presses Maintenance theme) and PN-to-machine clustering as an upstream input.
4. **6 to 12 months:** multi-plant mode, Office add-in, optional SaaS offering, research paper on calibration plus robustness-scored planning.

---

## 18. Open Questions to Resolve with TE Mentors (Month 1)

1. What does the TE brief for this theme specifically target (plant, process, planning horizon)?
2. Which manufacturing process (molding, stamping, assembly) is the intended focus?
3. Can anonymized sample data (orders, routings, cycle times, downtime) be shared?
4. What are the official milestones, deliverables and judging criteria?
5. What systems do planners use today (SAP, Excel, MES), and what does re-planning look like day to day?
6. Are there compute, cloud or LLM-use restrictions?

---

## 19. Glossary

**APS** Advanced Planning & Scheduling | **CP-SAT** Constraint Programming solver in OR-Tools | **OTD** On-Time Delivery | **WIP** Work in Progress | **PN** Part Number | **MES** Manufacturing Execution System | **DES** Discrete-Event Simulation | **HITL** Human-in-the-Loop