
## Note

**Note:** This section outlines our plan. Remember to always use `global.css` for consistent styling across the application.


Trade Job Management System![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.001.png)

Complete System Specification![ref1]

Version: 1.0

Date: January 2026

Status: Ready for Development![ref2]

Table of Contents![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.004.png)

1. Overview
1. Problem Statement
1. Solution
1. Tech Stack
1. User Roles & Permissions
1. Data Models
1. User Flows
1. Screen Wireframes
1. API Specification
1. API Access Matrix
1. Job Status Flow
1. MVP Scope
1. Future Enhancements![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.005.png)
1. Overview![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.006.png)

A centralised digital system to replace manual job reporting processes (Google Drive, WhatsApp, ad-hoc reports) for trade maintenance services.

System Components

┌─────────────────────────────────────────────────────────────────┐ │                        SYSTEM ARCHITECTURE                       │ ├─────────────────────────────────────────────────────────────────┤ │                                                                 │ │   WEB ADMIN PANEL              MOBILE APP                       │ │   (React + Vite)               (Expo/React Native)              │ │   │                            │                                │ │   │ Used by:                   │ Used by:                       │ │   │ • Super Admin              │ • Engineers                    │ │   │ • Trade Managers           │                                │ │   │                            │                                │ │   └────────────┬───────────────┴────────────┐                  │ │                │                            │                   │ │                ▼                            ▼                   │ │   ┌─────────────────────────────────────────────────────────┐  │ │   │                    FASTAPI BACKEND                       │  │ │   │                    (Python)                              │  │ │   └─────────────────────────┬───────────────────────────────┘  │ │                             │                                   │ │            ┌────────────────┼────────────────┐                 │ │            ▼                ▼                ▼                  │ │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.007.png)

│   │ PostgreSQL  │  │ Azure Blob  │  │ (Future)    │           │

│   │ Database    │  │ Storage     │  │ PDF Gen     │           │

│   │             │  │ (Images)    │  │             │           │

│   └─────────────┘  └─────────────┘  └─────────────┘           │

│                                                                 │ └─────────────────────────────────────────────────────────────────┘![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.008.png)

2. Problem Statement![ref1]

Current Pain Points

- Engineers take multiple photos on-site and send them manually via WhatsApp
- Trade managers download images from Google Drive or messages
- Reports are created manually using hit-and-trial methods
- No structured way to:
  - Ensure consistent photo coverage
  - Track what was done previously at the same site
  - Reuse job formats or templates
- When a new engineer visits the same location later, they have no visibility into past work![ref3]
3. Solution![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.010.png)

Build a system where: Trade Managers can:

- Define job templates (what areas need photographing)
- Create sites (client locations)
- Create and assign jobs to engineers
- Review submitted work in a structured format
- Approve or reject work with feedback

Engineers can:

- View assigned jobs on their mobile phone
- See previous work done at the same site (historical reference)
- Follow predefined templates
- Capture pre-work and post-work images
- Submit completed work for review

Key Feature: Historical visibility - when an engineer visits a site, they can see photos from the most recent previous visit, regardless of which engineer did it.![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.011.png)

4. Tech Stack![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.012.png)![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.013.png)



|Layer|Technology|Reason|
| - | - | - |
|Backend|FastAPI (Python)|Fast, modern, auto-generates docs, Python familiarity|
|Database|PostgreSQL|Industry standard, relational, handles complex queries|
|Image Storage|Azure Blob Storage|Scalable, CDN delivery, cost-effective|
|Admin Panel|React + Vite|Most popular, large ecosystem, standard for web apps|
|Mobile App|Expo (React Native)|Simplified React Native, camera access, no Mac needed for iOS builds|
|Authentication|JWT Tokens|Stateless, works across web and mobile|

5. User Roles & Permissions![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.014.png)

Role Hierarchy

SUPER ADMIN (1 person - IT/System Owner)     │![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.015.png)

`    `├── Full system access

`    `├── Creates Trade Managers

`    `├── Creates Engineers

`    `└── Emergency access to everything

TRADE MANAGER (3 people)

`    `│

`    `├── Creates Engineers (not other TMs)     ├── Creates Sites

`    `├── Creates Templates

`    `├── Creates & Assigns Jobs

`    `└── Reviews & Approves Work

ENGINEER (30+ people)

`    `│

`    `├── Views own assigned jobs only     ├── Captures pre/post photos

`    `└── Submits work for review

Permission Matrix



|Action|Super Admin|Trade Manager|Engineer|
| - | - | :- | - |
|User Management||||
|Create Super Admin||||
|Create Trade Manager||||
|Create Engineer||||
|Deactivate any user||||
|Deactivate engineers||||
|Reset any password||||
|Reset engineer password||||
|Content Management||||
|Create templates||||
|Create sites||||
|Create jobs||||
|Assign/reassign jobs||||
|Review jobs||||
|Approve/reject jobs||||
|Work Execution||||
|View all jobs||||
|View assigned jobs|||` `(own only)|
|Start job||||
|Capture photos||||
|||||
Submit job![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.016.png)

~~Action~~ Super Trade ~~Engineer~~

Admin Manager

6. Data Models![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.017.png)

Entity Relationship Diagram

┌─────────────┐       ┌─────────────┐       ┌─────────────────┐ │    USER     │       │    SITE     │       │    TEMPLATE     │ ├─────────────┤       ├─────────────┤       ├─────────────────┤ │ id          │       │ id          │       │ id              │ │ email       │       │ client\_name │       │ name            │ │ password    │       │ site\_name   │       │ description     │ │ full\_name   │       │ address\_1   │       │ is\_active       │ │ role        │       │ address\_2   │       │ created\_by → User│ │ is\_active   │       │ city        │       │ created\_at      │ │ created\_by  │       │ postcode    │       └────────┬────────┘ │ created\_at  │       │ contact\_\*   │                │ └──────┬──────┘       │ created\_at  │                │![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.018.png)

`       `│              └──────┬──────┘                │

`       `│                     │                       │

`       `│                     │ 1:many                │ 1:many        │                     │                       │

`       `│              ┌──────▼───────────────────────▼──────┐        │              │                JOB                   │        │              ├─────────────────────────────────────┤        │ 1:many       │ id                                  │        └──────────────▶ reference (JOB-20260131-A3F2)       │                       │ title                               │                       │ description                         │                       │ site\_id → Site                      │                       │ template\_id → Template              │                       │ engineer\_id → User (nullable)       │                       │ created\_by → User                   │                       │ status                              │                       │ scheduled\_date                      │                       │ started\_at                          │                       │ submitted\_at                        │                       │ reviewed\_at                         │                       │ review\_notes                        │                       │ created\_at                          │                       └──────────────────┬──────────────────┘                                          │

`                                         `│ 1:many

`                                         `│ ┌─────────────────┐               ┌──────▼──────────┐

│  TEMPLATE\_AREA  │               │  WORK\_CAPTURE   │ ├─────────────────┤               ├─────────────────┤

│ id              │               │ id              │

│ template\_id     │◀──────────────│ job\_id          │

│ name            │   references  │ template\_area\_id│

│ order\_index     │               │ pre\_image\_url   │

│ photo\_guidance  │               │ pre\_thumbnail   │

│ created\_at      │               │ pre\_captured\_at │ └─────────────────┘               │ post\_image\_url  │

`                                  `│ post\_thumbnail  │

`                                  `│ post\_captured\_at│

`                                  `│ notes           │

`                                  `└─────────────────┘

Key Relationships



|Relationship|Description|
| - | - |
|Site → Jobs|One site has many jobs (visits over time)|
|Template → Jobs|One template used by many jobs (reusable)|
|Template → Areas|One template has many areas to photograph|
|Job → Captures|One job has many work captures (one per area)|
|User → Jobs|Engineer assigned to jobs; Manager creates jobs|

User Model

USER![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.019.png)

────

id              : Integer, Primary Key

email           : String, Unique, Not Null

password\_hash   : String, Not Null

full\_name       : String, Not Null

role : Enum (super\_admin, trade\_manager, engineer)

is\_active : Boolean, Default true

created\_by : Foreign Key → User (nullable for first super\_admin)

created\_at : Timestamp

updated\_at      : Timestamp

Site Model

SITE![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.020.png)

────

id              : Integer, Primary Key

client\_name : String, Not Null (e.g., "Big Easy")

site\_name : String, Nullable (e.g., "Canary Wharf")

address\_line\_1 : String, Not Null

address\_line\_2  : String, Nullable

city            : String, Not Null

postcode        : String, Not Null

contact\_name    : String, Nullable

contact\_phone   : String, Nullable

contact\_email   : String, Nullable

notes           : Text, Nullable

created\_at      : Timestamp

updated\_at      : Timestamp

Template Model

TEMPLATE![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.021.png)

────────

id              : Integer, Primary Key

name : String, Not Null (e.g., "Kitchen Extract Clean")

description : Text, Nullable

is\_active       : Boolean, Default true

created\_by      : Foreign Key → User

created\_at      : Timestamp

updated\_at      : Timestamp

TEMPLATE\_AREA

─────────────

id              : Integer, Primary Key

template\_id     : Foreign Key → Template

name : String, Not Null (e.g., "Main Canopy")

description : Text, Nullable

order\_index : Integer, Not Null (for ordering)

photo\_guidance : Text, Nullable (instructions for engineer)

created\_at : Timestamp

Job Model

JOB![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.022.png)

───

id              : Integer, Primary Key

reference       : String, Unique (e.g., "JOB-20260131-A3F2")

title           : String, Not Null

description     : Text, Nullable

site\_id         : Foreign Key → Site

template\_id     : Foreign Key → Template

engineer\_id     : Foreign Key → User, Nullable

created\_by      : Foreign Key → User

status : Enum (draft, assigned, in\_progress, submitted, approved, rejected)

scheduled\_date : Date, Nullable

started\_at      : Timestamp, Nullable

submitted\_at    : Timestamp, Nullable

reviewed\_at     : Timestamp, Nullable

review\_notes    : Text, Nullable

created\_at      : Timestamp

updated\_at      : Timestamp

Work Capture Model

WORK\_CAPTURE![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.023.png)

────────────

id : Integer, Primary Key

job\_id : Foreign Key → Job

template\_area\_id : Foreign Key → Template\_Area

pre\_image\_url : String, Nullable

pre\_thumbnail\_url : String, Nullable

pre\_captured\_at : Timestamp, Nullable

post\_image\_url : String, Nullable

post\_thumbnail\_url : String, Nullable

post\_captured\_at : Timestamp, Nullable

notes               : Text, Nullable

created\_at          : Timestamp

updated\_at          : Timestamp![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.024.png)

7. User Flows![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.025.png)

Flow 1: Initial System Setup

1. Deploy system![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.026.png)
1. First person accesses /api/v1/auth/setup
1. Creates Super Admin account (only works once)
1. Super Admin logs into Web Admin Panel
1. Super Admin creates Trade Managers
1. Trade Managers create Engineers

Flow 2: Trade Manager - Preparation

TRADE MANAGER logs into Web Admin Panel     │![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.027.png)

`    `├─→ Creates Sites

`    `│     • Big Easy - Canary Wharf

`    `│     • Nando's - Stratford

`    `│

`    `└─→ Creates Templates

• Kitchen Extract Clean

`            `├── Main Canopy

`            `├── Open Plenum

`            `├── Header Duct

`            `└── ... (12 areas)

Flow 3: Trade Manager - Job Assignment

TRADE MANAGER![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.028.png)

`    `│

`    `└─→ Creates Job

`          `│

`          `├── Selects Site: "Big Easy - Canary Wharf"           ├── Selects Template: "Kitchen Extract Clean"           ├── Selects Engineer: "John Smith"

`          `└── Sets Date: "15 Feb 2026"

System generates reference: JOB-20260215-X7Y8 Status: ASSIGNED

(Future: Push notification to John's phone)

Flow 4: Engineer - Work Execution

ENGINEER (John) opens Mobile App![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.029.png)

`    `│

`    `├─→ Sees: "1 New Job Assigned"

`    `│

`    `├─→ Taps job, sees:

`    `│     • Site: Big Easy, Canary Wharf

`    `│     • Address: Crossrail Place, E14 5AR

`    `│     • Template: Kitchen Extract Clean (12 areas)

`    `│     • Previous Visit: 21 Jan 2026 by Ahmed (photos visible)     │

`    `├─→ Taps "START JOB"

`    `│     Status: ASSIGNED → IN\_PROGRESS

`    `│

`    `├─→ For each area:

`    `│     │

`    `│     ├── View previous visit photos (reference)

`    `│     ├── Take PRE photo  

`    `│     ├── Do the actual work  

`    `│     └── Take POST photo  

`    `│

`    `└─→ All 12 areas complete → Taps "SUBMIT"

`          `Status: IN\_PROGRESS → SUBMITTED

Flow 5: Trade Manager - Review

TRADE MANAGER sees: "1 Job Pending Review"![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.030.png)

`    `│

`    `├─→ Opens job

`    `│     • Views all 12 areas

`    `│     • Each area shows PRE and POST side by side     │

`    `└─→ Decision:

`          `│

`          `├── APPROVE  

`          `│     Status: SUBMITTED → APPROVED

`          `│     Job complete!

`          `│

`          `└── REJECT  

`                `Status: SUBMITTED → REJECTED

`                `Adds note: "Area 3 photos are blurry"

Engineer sees rejection + notes Engineer fixes photos

Engineer resubmits

(Back to review)![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.031.png)

8. Screen Wireframes![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.032.png)

Web Admin Panel - Dashboard

┌─────────────────────────────────────────────────────────────────┐ │  TRADE JOB SYSTEM                    Welcome, Sarah  [Logout]   │ ├─────────────────────────────────────────────────────────────────┤ │                                                                 │ │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │ │  │     12       │ │      5       │ │      3       │            │ │  │ Active Jobs  │ │   Pending    │ │  Completed   │            │ │  │              │ │   Review     │ │    Today     │            │ │  └──────────────┘ └──────────────┘ └──────────────┘            │ │                                                                 │ │  Pending Review                           [View All]            │ │  ┌─────────────────────────────────────────────────────────┐   │ │  │ JOB-20260131-A3F2 │ Big Easy    │ John Smith │ 2h ago   │   │ │  │ JOB-20260130-B1C4 │ Nando's     │ Ahmed Khan │ 1d ago   │   │ │  └─────────────────────────────────────────────────────────┘   │ │                                                                 │ │  Quick Actions                                                  │ │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.029.png)

│  │ + New Job  │ │ + New Site │ │ + Template │ │ + Engineer │  │ │  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │ │                                                                 │ └─────────────────────────────────────────────────────────────────┘

Web Admin Panel - Create Job

┌─────────────────────────────────────────────────────────────────┐ │  ← Back                              CREATE NEW JOB             │ ├─────────────────────────────────────────────────────────────────┤ │                                                                 │![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.033.png)

│  Job Title \*                                                    │ │  ┌─────────────────────────────────────────────────────────┐   │ │  │ Kitchen Extract Clean - February                        │   │ │  └─────────────────────────────────────────────────────────┘   │ │                                                                 │ │  Site \*                                                         │ │  ┌─────────────────────────────────────────────────────────┐   │ │  │ Big Easy - Canary Wharf                              ▼  │   │ │  └─────────────────────────────────────────────────────────┘   │ │                                                                 │ │  Template \*                                                     │ │  ┌─────────────────────────────────────────────────────────┐   │ │  │ Kitchen Extract Clean (12 areas)                     ▼  │   │ │  └─────────────────────────────────────────────────────────┘   │ │                                                                 │ │  Assign to Engineer                                             │ │  ┌─────────────────────────────────────────────────────────┐   │ │  │ John Smith                                           ▼  │   │ │  └─────────────────────────────────────────────────────────┘   │ │                                                                 │ │  Scheduled Date                                                 │ │  ┌─────────────────────────────────────────────────────────┐   │ │  │ 15/02/2026                                             │   │ │  └─────────────────────────────────────────────────────────┘   │ │                                                                 │ │                               [Cancel]  [Create & Assign Job]   │ │                                                                 │ └─────────────────────────────────────────────────────────────────┘

Web Admin Panel - Review Job

┌─────────────────────────────────────────────────────────────────┐ │  ← Back to Jobs                              JOB-20260131-A3F2  │ ├─────────────────────────────────────────────────────────────────┤ │                                                                 │ │  Kitchen Extract Clean                                          │ │  Site: Big Easy - Canary Wharf        Engineer: John Smith      │ │  Submitted: 31 Jan 2026, 14:32        Status:   Pending Review │ │                                                                 │ │  ┌─────────────────────────────────────────────────────────┐   │ │  │ AREA 1: Main Canopy                                Done │   │ │  │                                                         │   │ │  │  PRE-WORK              POST-WORK                        │   │ │  │ ┌─────────────┐      ┌─────────────┐                   │   │ │  │ │             │      │             │                   │   │ │  │ │   [IMAGE]   │      │   [IMAGE]   │                   │   │ │  │ │             │      │             │                   │   │ │  │ └─────────────┘      └─────────────┘                   │   │ │  │ 10:30 AM              14:15 PM                          │   │ │  └─────────────────────────────────────────────────────────┘   │ │                                                                 │ │  ┌─────────────────────────────────────────────────────────┐   │ │  │ AREA 2: Open Plenum                                Done │   │ │  │ ... (similar layout)                                    │   │ │  └─────────────────────────────────────────────────────────┘   │ │                                                                 │ │  Review Notes (optional)                                        │ │  ┌─────────────────────────────────────────────────────────┐   │ │  │                                                         │   │ │  └─────────────────────────────────────────────────────────┘   │ │                                                                 │ │                                 [  Reject]    [  Approve]     │ │                                                                 │ └─────────────────────────────────────────────────────────────────┘![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.034.png)

Mobile App - Job List

┌─────────────────────────┐ │ ≡  My Jobs              │ ├─────────────────────────┤ │                         │ │  Assigned (2)           │ │ ┌─────────────────────┐ │ │ │   Kitchen Extract  │ │ │ │    Clean            │ │ │ │                     │ │ │ │ Big Easy            │ │ │ │ Canary Wharf        │ │ │ │                     │ │ │ │ Due: 15 Feb 2026    │ │ │ └─────────────────────┘ │ │ ┌─────────────────────┐ │ │ │   Kitchen Extract  │ │ │ │    Clean            │ │ │ │                     │ │ │ │ Pret A Manger       │ │ │ │ Liverpool Street    │ │ │ │                     │ │ │ │ Due: 18 Feb 2026    │ │ │ └─────────────────────┘ │ │                         │ │  Completed (5)          │ │ ┌─────────────────────┐ │ │ │   Kitchen Extract  │ │ │ │ Nando's Stratford   │ │ │ │ 28 Jan 2026         │ │ │ └─────────────────────┘ │ │                         │ └─────────────────────────┘![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.035.png)

Mobile App - Job Details

┌─────────────────────────┐ │ ←  Job Details          │ ├─────────────────────────┤ │                         │ │ Kitchen Extract Clean   │ │                         │ │   Big Easy             │ │    Canary Wharf         │ │    Crossrail Place      │ │    E14 5AR              │ │                         │ │   Due: 15 Feb 2026     │ │                         │ │   Contact: John        │ │    07123 456789         │ │                         │ │ ─────────────────────── │ │                         │ │   Areas (12)           │ │                         │ │ ┌─────────────────────┐ │ │ │ 1. Main Canopy      │ │ │ │    ○ Pre  ○ Post    │ │ │ └─────────────────────┘ │ │ ┌─────────────────────┐ │ │ │ 2. Open Plenum      │ │ │ │    ○ Pre  ○ Post    │ │ │ └─────────────────────┘ │ │ ┌─────────────────────┐ │ │ │ 3. Header Duct      │ │ │ │    ○ Pre  ○ Post    │ │ │ └─────────────────────┘ │ │                         │ │ [    ![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.036.png)▶ START JOB    ]   │ │                         │ └─────────────────────────┘

Mobile App - Capture Area

┌─────────────────────────┐ │ ←  Main Canopy          │ ├─────────────────────────┤ │                         │ │ ┌─────────────────────┐ │ │ │   PREVIOUS VISIT   │ │ │ │ 21 Jan 2026 (Ahmed) │ │ │ │                     │ │ │ │ ┌───────┐ ┌───────┐ │ │ │ │ │ PRE   │ │ POST  │ │ │ │ │ │[thumb]│ │[thumb]│ │ │ │ │ └───────┘ └───────┘ │ │ │ │                     │ │ │ │ [Tap to view full]  │ │ │ └─────────────────────┘ │ │                         │ │ ─────────────────────── │ │                         │ │ YOUR WORK               │ │                         │ │ PRE-WORK                │ │ ┌─────────────────────┐ │ │ │                     │ │ │ │    [  TAKE PHOTO]  │ │ │ │                     │ │ │ └─────────────────────┘ │ │                         │ │ POST-WORK               │ │ ┌─────────────────────┐ │ │ │                     │ │ │ │  (Complete pre      │ │ │ │   photo first)      │ │ │ │                     │ │ │ └─────────────────────┘ │ │                         │ │ [← Previous] [Next →]   │ │                         │ └─────────────────────────┘![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.037.png)![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.038.png)

9. API Specification![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.039.png)

Base URL

Production: https://api.yourapp.com/api/v1 Development: http://localhost:8000/api/v1![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.040.png)

Authentication

All endpoints (except login and setup) require:

Header: Authorization: Bearer <jwt\_token>![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.041.png)![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.042.png)

1. Authentication Endpoints

POST /auth/login

Get access token for user.

Access: Public (no auth required) Used by: Web App, Mobile App

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.029.png)

{

`  `"email": "john@aspect.co.uk",   "password": "secret123"

}

Response (200):

{

`  `"access\_token": "eyJhbGciOiJIUzI1NiIs...",   "token\_type": "bearer",

`  `"user": {

`    `"id": 1,

`    `"email": "john@aspect.co.uk",

`    `"full\_name": "John Smith",

`    `"role": "trade\_manager"

`  `}

}

Response (401):

{

`  `"detail": "Incorrect email or password" }

GET /auth/me

Get current authenticated user.

Access: Any authenticated user Used by: Web App, Mobile App

Response (200):![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.043.png)

{

`  `"id": 1,

`  `"email": "john@aspect.co.uk",

`  `"full\_name": "John Smith",

`  `"role": "trade\_manager",

`  `"is\_active": true,

`  `"created\_at": "2026-01-15T10:30:00Z" }

POST /auth/setup

Create first super admin (only works when no users exist).

Access: Public (one-time only) Used by: Web App (initial setup)

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.044.png)

{

`  `"email": "admin@aspect.co.uk",   "password": "securepassword",   "full\_name": "System Admin"

}

Response (201):

{

`  `"id": 1,

`  `"email": "admin@aspect.co.uk",   "full\_name": "System Admin",   "role": "super\_admin"

}

Response (403):

{

`  `"detail": "Setup already completed" }![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.045.png)

2. User Management Endpoints

GET /users

List users (filtered by role permissions).

Access: Super Admin, Trade Manager Used by: Web App only

Query Parameters:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.046.png)

- role: filter by role (optional)
- is\_active: filter by active status (optional, default: true)

Response (200):

{

`  `"users": [

`    `{

`      `"id": 1,

`      `"email": "john@aspect.co.uk",

`      `"full\_name": "John Smith",

`      `"role": "engineer",

`      `"is\_active": true,

`      `"created\_at": "2026-01-15T10:30:00Z"     }

`  `],

`  `"total": 10

}

Notes:

- Super Admin sees all users
- Trade Manager sees only engineers

POST /users

Create new user.

Access: Super Admin, Trade Manager Used by: Web App only

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.047.png)

{

`  `"email": "new@aspect.co.uk",   "password": "temppassword",   "full\_name": "New Engineer",   "role": "engineer"

}

Response (201):

{

`  `"id": 5,

`  `"email": "new@aspect.co.uk",   "full\_name": "New Engineer",   "role": "engineer",

`  `"is\_active": true

}

Response (403):

{

`  `"detail": "Trade managers can only create engineers" }

Notes:

- Super Admin can create any role
- Trade Manager can only create engineers

GET /users/{user\_id}

Get single user details.

Access: Super Admin, Trade Manager (engineers only) Used by: Web App only

PATCH /users/{user\_id}

Update user details.

Access: Super Admin, Trade Manager (engineers only) Used by: Web App only

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.048.png)

{

`  `"full\_name": "Updated Name",   "is\_active": false

}

Response (200):

{

`  `"id": 5,

`  `"full\_name": "Updated Name",   "is\_active": false,

...

}

POST /users/{user\_id}/reset-password

Reset user password.

Access: Super Admin (any), Trade Manager (engineers only) Used by: Web App only

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.049.png)

{

`  `"new\_password": "newpassword123"

}

Response (200):

{

`  `"message": "Password reset successfully" }![ref2]

3. Site Endpoints

GET /sites

List all sites.

Access: Super Admin, Trade Manager Used by: Web App only

Query Parameters:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.050.png)

- search: search by name/postcode (optional)

Response (200):

{

`  `"sites": [

`    `{

`      `"id": 1,

`      `"client\_name": "Big Easy",       "site\_name": "Canary Wharf",       "city": "London",

`      `"postcode": "E14 5AR",

`      `"job\_count": 5

`    `}

`  `],

`  `"total": 12

}

POST /sites

Create new site.

Access: Super Admin, Trade Manager Used by: Web App only

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.051.png)

{

`  `"client\_name": "Big Easy",

`  `"site\_name": "Canary Wharf",

`  `"address\_line\_1": "Crossrail Place",   "address\_line\_2": null,

`  `"city": "London",

`  `"postcode": "E14 5AR",

`  `"contact\_name": "John Manager",

`  `"contact\_phone": "07123456789",

`  `"contact\_email": "john@bigeasy.com" }

Response (201):

{

`  `"id": 1,

...all fields... }

GET /sites/{site\_id}

Get site details.

Access: Super Admin, Trade Manager, Engineer (if has job at site) Used by: Web App, Mobile App

PATCH /sites/{site\_id}

Update site.

Access: Super Admin, Trade Manager Used by: Web App only

GET /sites/{site\_id}/history

Get job history for a site.

Access: Super Admin, Trade Manager, Engineer (if has job at site) Used by: Web App, Mobile App

Query Parameters:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.052.png)

- limit: number of jobs (default: 5)
- status: filter by status (optional, default: approved)

Response (200):

{

`  `"jobs": [

`    `{

`      `"id": 98,

`      `"reference": "JOB-20260121-X1Y2",

`      `"completed\_at": "2026-01-21T16:00:00Z",       "engineer\_name": "Ahmed Khan",

`      `"status": "approved"

`    `}

`  `]

}![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.053.png)

4. Template Endpoints

GET /templates

List all templates.

Access: Super Admin, Trade Manager Used by: Web App only

Query Parameters:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.054.png)

- is\_active: filter by active status (optional)

Response (200):

{

`  `"templates": [

`    `{

`      `"id": 1,

`      `"name": "Kitchen Extract Clean",

`      `"description": "TR19 compliant kitchen extract system cleaning",       "area\_count": 12,

`      `"is\_active": true,

`      `"created\_at": "2026-01-10T09:00:00Z"

`    `}

`  `]

}

POST /templates

Create new template with areas.

Access: Super Admin, Trade Manager Used by: Web App only

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.055.png)

{

`  `"name": "Kitchen Extract Clean",

`  `"description": "TR19 compliant...",

`  `"areas": [

`    `{

`      `"name": "Main Canopy",

`      `"order\_index": 1,

`      `"photo\_guidance": "Photograph from below, capture full width"     },

`    `{

`      `"name": "Open Plenum",

`      `"order\_index": 2,

`      `"photo\_guidance": "Include filter housing"

`    `}

`  `]

}

Response (201):

{

`  `"id": 1,

`  `"name": "Kitchen Extract Clean",   "areas": [

`    `{

`      `"id": 1,

`      `"name": "Main Canopy",

`      `"order\_index": 1,

...

`    `}

`  `]

}

GET /templates/{template\_id}

Get template with all areas.

Access: Super Admin, Trade Manager, Engineer (if assigned job uses it) Used by: Web App, Mobile App

Response (200):![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.056.png)

{

`  `"id": 1,

`  `"name": "Kitchen Extract Clean",   "description": "...",

`  `"is\_active": true,

`  `"areas": [

`    `{

`      `"id": 1,

`      `"name": "Main Canopy",

`      `"order\_index": 1,

`      `"photo\_guidance": "..."

`    `},

`    `{

`      `"id": 2,

`      `"name": "Open Plenum",

`      `"order\_index": 2,

`      `"photo\_guidance": "..."

`    `}

`  `]

}

PATCH /templates/{template\_id}

Update template (name, description, active status). Access: Super Admin, Trade Manager

Used by: Web App only

POST /templates/{template\_id}/areas

Add area to template.

Access: Super Admin, Trade Manager Used by: Web App only

PATCH /templates/{template\_id}/areas/{area\_id}

Update area.

Access: Super Admin, Trade Manager Used by: Web App only

DELETE /templates/{template\_id}/areas/{area\_id}

Remove area (only if no jobs use it).

Access: Super Admin, Trade Manager Used by: Web App only![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.057.png)

5. Job Endpoints

GET /jobs

List jobs (filtered by role).

Access: Super Admin, Trade Manager, Engineer (own only) Used by: Web App, Mobile App

Query Parameters:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.058.png)

- status: filter by status (optional)
- site\_id: filter by site (optional)
- engineer\_id: filter by engineer (optional, admin/TM only)

Response (200):

{

`  `"jobs": [

`    `{

`      `"id": 123,

`      `"reference": "JOB-20260131-A3F2",

`      `"title": "Kitchen Extract Clean",

`      `"status": "in\_progress",

`      `"site": {

`        `"id": 1,

`        `"client\_name": "Big Easy",

`        `"site\_name": "Canary Wharf",

`        `"postcode": "E14 5AR"

`      `},

`      `"engineer": {

`        `"id": 5,

`        `"full\_name": "John Smith"

`      `},

`      `"scheduled\_date": "2026-02-15",

`      `"completion\_percentage": 45.5,

`      `"created\_at": "2026-01-30T10:00:00Z"     }

`  `],

`  `"total": 25

}

Notes:

- Super Admin/Trade Manager see all jobs
- Engineer sees only jobs assigned to them

POST /jobs

Create new job.

Access: Super Admin, Trade Manager Used by: Web App only

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.059.png)

{

`  `"title": "Kitchen Extract Clean - February",

`  `"description": "Regular 4-monthly clean",

`  `"site\_id": 1,

`  `"template\_id": 1,

`  `"engineer\_id": 5,        // optional - can assign later   "scheduled\_date": "2026-02-15"

}

Response (201):

{

`  `"id": 123,

`  `"reference": "JOB-20260215-X7Y8",

`  `"title": "Kitchen Extract Clean - February",

`  `"status": "assigned",    // "draft" if no engineer assigned   "site": { ... },

`  `"template": { ... },

`  `"engineer": { ... },

...

}

GET /jobs/{job\_id}

Get full job details with site, template, captures, and previous job reference.

Access: Super Admin, Trade Manager, Engineer (own only) Used by: Web App, Mobile App

Response (200):![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.060.png)

{

`  `"id": 123,

`  `"reference": "JOB-20260215-X7Y8",

`  `"title": "Kitchen Extract Clean - February",   "description": "...",

`  `"status": "in\_progress",

`  `"site": {

`    `"id": 1,

`    `"client\_name": "Big Easy",

`    `"site\_name": "Canary Wharf",

`    `"address\_line\_1": "Crossrail Place",     "city": "London",

`    `"postcode": "E14 5AR",

`    `"contact\_name": "John",

`    `"contact\_phone": "07123456789"

`  `},

`  `"template": {

`    `"id": 1,

`    `"name": "Kitchen Extract Clean",     "areas": [

`      `{

`        `"id": 1,

`        `"name": "Main Canopy",

`        `"order\_index": 1,

`        `"photo\_guidance": "..."

`      `},

...

`    `]

`  `},

`  `"engineer": {![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.061.png)

`    `"id": 5,

`    `"full\_name": "John Smith"   },

`  `"captures": [

`    `{

`      `"area\_id": 1,

`      `"area\_name": "Main Canopy",

`      `"order\_index": 1,

`      `"pre\_image\_url": "https://blob.../pre\_123\_1.jpg",

`      `"pre\_thumbnail\_url": "https://blob.../pre\_123\_1\_thumb.jpg",       "pre\_captured\_at": "2026-02-15T10:30:00Z",

`      `"post\_image\_url": null,

`      `"post\_thumbnail\_url": null,

`      `"post\_captured\_at": null,

`      `"is\_complete": false

`    `},

...

`  `],

`  `"previous\_job": {                    // ← Historical reference!     "id": 98,

`    `"reference": "JOB-20260121-X1Y2",

`    `"completed\_at": "2026-01-21T16:00:00Z",

`    `"engineer\_name": "Ahmed Khan",

`    `"captures": [

`      `{

`        `"area\_id": 1,

`        `"pre\_image\_url": "https://blob.../pre\_98\_1.jpg",

`        `"post\_image\_url": "https://blob.../post\_98\_1.jpg"

`      `},

...

`    `]

`  `},

`  `"scheduled\_date": "2026-02-15",

`  `"started\_at": "2026-02-15T09:00:00Z",   "submitted\_at": null,

`  `"completion\_percentage": 8.3,

`  `"is\_complete": false

}

PATCH /jobs/{job\_id}

Update job (title, description, date, reassign engineer).

Access: Super Admin, Trade Manager Used by: Web App only

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.062.png)

{

`  `"engineer\_id": 8,          // Reassign to different engineer   "scheduled\_date": "2026-02-20"

}

Response (200):

{

...updated job... }![ref3]

6. Job Status Endpoints

POST /jobs/{job\_id}/start

Engineer starts working on job.

Access: Engineer (assigned to this job only) Used by: Mobile App only

Response (200):![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.063.png)

{

...job with status: "in\_progress"...   "started\_at": "2026-02-15T09:00:00Z" }

Notes:

- Creates empty capture records for each template area
- Status: assigned → in\_progress

POST /jobs/{job\_id}/submit

Engineer submits completed work for review.

Access: Engineer (assigned to this job only) Used by: Mobile App only

Response (200):![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.064.png)

{

...job with status: "submitted"...

`  `"submitted\_at": "2026-02-15T15:30:00Z" }

Response (400):

{

`  `"detail": "Cannot submit. 3 areas incomplete." }

Notes:

- Validates ALL areas have both pre AND post images
- Status: in\_progress → submitted

POST /jobs/{job\_id}/approve

Manager approves submitted work.

Access: Super Admin, Trade Manager Used by: Web App only

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.065.png)

{

`  `"notes": "Good work, all photos clear."  // optional }

Response (200):

{

...job with status: "approved"...

`  `"reviewed\_at": "2026-02-15T16:00:00Z" }

Notes:

- Status: submitted → approved

POST /jobs/{job\_id}/reject

Manager rejects submitted work.

Access: Super Admin, Trade Manager Used by: Web App only

Request:![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.066.png)

{

`  `"reason": "Area 3 photos are blurry. Please retake."  // required }

Response (200):

{

...job with status: "rejected"...

`  `"review\_notes": "Area 3 photos are blurry..." }

Notes:

- Status: submitted → rejected
- Engineer can then fix and resubmit![ref2]
7. Work Capture Endpoints

GET /jobs/{job\_id}/captures

Get all captures for a job.

Access: Super Admin, Trade Manager, Engineer (own job only) Used by: Web App, Mobile App

Response (200):![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.067.png)

{

`  `"captures": [

`    `{

`      `"area\_id": 1,

`      `"area\_name": "Main Canopy",

`      `"order\_index": 1,

`      `"pre\_image\_url": "https://...",

`      `"pre\_thumbnail\_url": "https://...",

`      `"pre\_captured\_at": "2026-02-15T10:30:00Z",       "post\_image\_url": "https://...",

`      `"post\_thumbnail\_url": "https://...",

`      `"post\_captured\_at": "2026-02-15T14:45:00Z",       "is\_complete": true

`    `},

...

`  `],

`  `"total\_areas": 12,

`  `"completed\_areas": 5,

`  `"completion\_percentage": 41.6

}

POST /jobs/{job\_id}/captures/{area\_id}/pre

Upload pre-work photo.

Access: Engineer (assigned to this job only) Used by: Mobile App only

Request: multipart/form-data {![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.068.png)

`  `"image": <file>

}

Response (201):

{

`  `"image\_url": "https://blob.../pre\_123\_1\_20260215\_103045.jpg",

`  `"thumbnail\_url": "https://blob.../pre\_123\_1\_20260215\_103045\_thumb.jpg",   "captured\_at": "2026-02-15T10:30:45Z"

}

Notes:

- Image is compressed automatically
- Thumbnail is generated automatically
- Both uploaded to Azure Blob Storage

POST /jobs/{job\_id}/captures/{area\_id}/post

Upload post-work photo.

Access: Engineer (assigned to this job only) Used by: Mobile App only

Request: multipart/form-data {![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.069.png)

`  `"image": <file>

}

Response (201):

{

`  `"image\_url": "https://...",

`  `"thumbnail\_url": "https://...",

`  `"captured\_at": "2026-02-15T14:45:30Z" }

Response (400):

{

`  `"detail": "Must upload pre-work image before post-work image" }

Notes:

- Pre-work photo MUST exist first![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.070.png)
10. API Access Matrix![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.071.png)

By Application



|Endpoint|Web App (Admin)|Mobile App (Engineer)|
| - | - | - |
|Auth|||
|POST /auth/login|||
|GET /auth/me|||
|POST /auth/setup|||
|Users|||
|GET /users|||
|POST /users|||
||||
|EGnEdTp/ouinsetrs/{id}|Web App (Admin)|Mobile App (Engineer)|
|PATCH /users/{id}|||
|POST /users/{id}/reset-password|||
|Sites|||
|GET /sites|||
|POST /sites|||
|GET /sites/{id}||` `(if has job there)|
|PATCH /sites/{id}|||
|GET /sites/{id}/history||` `(if has job there)|
|Templates|||
|GET /templates|||
|POST /templates|||
|GET /templates/{id}||` `(if job uses it)|
|PATCH /templates/{id}|||
|POST /templates/{id}/areas|||
|PATCH /templates/{id}/areas/{id}|||
|DELETE /templates/{id}/areas/{id}|||
|Jobs|||
|GET /jobs|` `(all)|` `(own only)|
|POST /jobs|||
|GET /jobs/{id}||` `(own only)|
|PATCH /jobs/{id}|||
|POST /jobs/{id}/start|||
|POST /jobs/{id}/submit|||
|POST /jobs/{id}/approve|||
|POST /jobs/{id}/reject|||
|Captures|||
|GET /jobs/{id}/captures||` `(own job only)|
|POST /jobs/{id}/captures/{id}/pre|||
|POST /jobs/{id}/captures/{id}/post|||
By Role



|Endpoint|Super Admin|Trade Manager|Engineer|
| - | - | :- | - |
|Auth||||
|||||


|POST /auth/login Endpoint|Super Admin|Trade Manager|Engineer|
| :- | - | :- | - |
|GET /auth/me||||
|||||
|POST /auth/setup|\*|||
|Users||||
|GET /users|` `(all)|` `(engineers)||
|POST /users|` `(any role)|` `(engineers)||
|GET /users/{id}||` `(engineers)||
|PATCH /users/{id}||` `(engineers)||
|POST /users/{id}/reset-password|` `(any)|` `(engineers)||
|Sites||||
|GET /sites||||
|POST /sites||||
|GET /sites/{id}|||\*\*|
|PATCH /sites/{id}||||
|GET /sites/{id}/history|||\*\*|
|Templates||||
|GET /templates||||
|POST /templates||||
|GET /templates/{id}|||\*\*\*|
|PATCH /templates/{id}||||
|Template area endpoints||||
|Jobs||||
|GET /jobs|` `(all)|` `(all)|` `(own)|
|POST /jobs||||
|GET /jobs/{id}|||` `(own)|
|PATCH /jobs/{id}||||
|POST /jobs/{id}/start|||` `(own)|
|POST /jobs/{id}/submit|||` `(own)|
|POST /jobs/{id}/approve||||
|POST /jobs/{id}/reject||||
|Captures||||
|GET /jobs/{id}/captures|||` `(own)|
|POST captures|||` `(own)|

\* Only works when no users exist

\*\* Only if engineer has a job at that site

\*\*\* Only if engineer has a job using that template

11. Job Status Flow![ref3]![ref4]

`                    `┌─────────┐![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.073.png)

`                    `│  DRAFT  │

`                    `│         │

`                    `│ No      │

`                    `│ engineer│

`                    `│ assigned│

`                    `└────┬────┘

`                         `│

`                         `│ Assign engineer                          ▼

`                    `┌─────────┐

`                    `│ASSIGNED │

`                    `│         │

`                    `│ Waiting │

`                    `│ for     │

`                    `│ engineer│

`                    `└────┬────┘

`                         `│

`                         `│ Engineer taps "Start Job"                          ▼

`                    `┌─────────┐

`        `┌──────────│   IN    │

`        `│          │PROGRESS │

`        `│          │         │

`        `│          │Engineer │

`        `│          │ working │

`        `│          └────┬────┘

`        `│               │

`        `│               │ Engineer taps "Submit"

`        `│               │ (all areas must be complete)         │               ▼

`        `│          ┌─────────┐

`        `│          │SUBMITTED│

`        `│          │         │

`        `│          │ Waiting │

`        `│          │ review  │

`        `│          └────┬────┘

`        `│               │

`        `│       ┌───────┴───────┐

`        `│       │               │

`        `│       ▼               ▼

`        `│  ┌─────────┐    ┌─────────┐

`        `│  │APPROVED │    │REJECTED │

`        `│  │        │    │        │

`        `│  │         │    │         │

`        `│  │  Done!  │    │ Needs   │

`        `│  │         │    │ fixing  │

`        `│  └─────────┘    └────┬────┘

`        `│                      │

`        `│                      │ Engineer fixes issues         └──────────────────────┘

`          `(Back to IN\_PROGRESS)

Status Descriptions



|Status|Description|Who triggers|Next states|
| - | - | - | - |
|DRAFT|Job created, no engineer assigned|TM creates job without engineer|ASSIGNED|
|||||


|||||
| :- | :- | :- | :- |
|ASSIGNED Status|Engineer assigned, waiting for start Description|TM assigns engineer Who triggers|IN\_PROGRESS Next states|
|||||
|IN\_PROGRESS|Engineer actively working|Engineer starts job|SUBMITTED|
|SUBMITTED|Work complete, awaiting review|Engineer submits|APPROVED, REJECTED|
|APPROVED|Work approved, job complete|TM approves|(final)|
|REJECTED|Work rejected, needs fixes|TM rejects|IN\_PROGRESS|

12. MVP Scope![ref2]![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.074.png)

Included in MVP 

- User authentication (login/logout)
- Role-based access control (Super Admin, Trade Manager, Engineer)
- User management (create, deactivate, reset password)
- Site management (CRUD)
- Template management (CRUD with areas)
- Job management (create, assign, reassign)
- Job workflow (start, capture photos, submit)
- Job review (approve/reject with notes)
- Pre/post image capture with timestamps
- Image compression and thumbnail generation
- Azure Blob Storage integration
- Historical job visibility (previous visit photos)
- Web admin panel for TM
- Mobile app for engineers

Excluded from MVP  (Phase 2+)

- PDF report generation (matching current TR19 format)
- Push notifications
- Offline mode with sync
- WFTT (Wet Film Thickness Test) readings
- Advanced analytics and dashboards
- Email notifications
- Multi-system sites (multiple extract systems per site)
- Audit logging
- Bulk job creation
- Job scheduling/calendar view![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.075.png)
13. Future Enhancements![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.076.png)

Phase 2: PDF Reports

- Generate PDF reports matching existing TR19 format
- Include all pre/post images in side-by-side layout
- Include WFTT readings
- Add certificates and COSHH data
- Export/share functionality

Phase 3: Offline Mode

- Service worker for app caching
- IndexedDB for local data storage
- Background sync when connection restored
- Queued image uploads

Phase 4: Notifications

- Push notifications for new job assignments
- Notifications for job status changes
- Email notifications for managers

Phase 5: Analytics

- Dashboard with job statistics
- Engineer performance metrics
- Site visit frequency tracking
- Compliance reporting

Appendix A: Error Responses![ref3]![ref4]

All API errors follow this format:

{![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.077.png)

`  `"detail": "Human-readable error message" }

Common HTTP Status Codes![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.078.png)



|Code|Meaning|Example|
| - | - | - |
|200|Success|Request completed|
|201|Created|New resource created|
|400|Bad Request|Invalid data, business rule violation|
|401|Unauthorized|Missing or invalid token|
|403|Forbidden|Valid token but insufficient permissions|
|404|Not Found|Resource doesn't exist|
|422|Validation Error|Request data failed validation|
|500|Server Error|Unexpected server error|

Appendix B: Image Handling![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.079.png)

Upload Flow

┌────────────────┐     ┌────────────────┐     ┌────────────────┐ │ Engineer takes │     │   Backend      │     │  Azure Blob    │ │ photo          │     │   processes    │     │  Storage       │ └───────┬────────┘     └───────┬────────┘     └───────┬────────┘         │                      │                      │![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.080.png)

`        `│  Upload image        │                      │

`        `│ (multipart/form)     │                      │

`        `│─────────────────────▶│                      │

`        `│                      │                      │

`        `│                      │  1. Validate format  │

`        `│                      │  2. Compress image   │

`        `│                      │  3. Generate thumb   │

`        `│                      │                      │

`        `│                      │  Upload both         │

`        `│                      │─────────────────────▶│

`        `│                      │                      │

`        `│                      │  Return URLs         │

`        `│                      │◀─────────────────────│

`        `│                      │                      │

`        `│  Return URLs +       │                      │

`        `│  timestamp           │                      │

`        `│◀─────────────────────│                      │

Image Specifications



|Property|Value|
| - | - |
|Max upload size|10 MB|
|Compression quality|85%|
|Max dimensions|1920 x 1920 (maintains aspect ratio)|
|Thumbnail size|300 x 300|
|Allowed formats|JPEG, PNG, WebP|
|Storage format|JPEG (converted from any input)|

Blob Storage Structure

job-images/![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.081.png)

├── jobs/

│   ├── 123/

│   │   ├── areas/

│   │   │   ├── 1/

│   │   │   │   ├── pre\_20260215\_103045\_a1b2c3.jpg

│   │   │   │   ├── pre\_20260215\_103045\_a1b2c3\_thumb.jpg │   │   │   │   ├── post\_20260215\_144530\_d4e5f6.jpg

│   │   │   │   └── post\_20260215\_144530\_d4e5f6\_thumb.jpg │   │   │   ├── 2/

│   │   │   │   └── ...![](Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.082.png)

*Document Version: 1.0*

*Last Updated: January 2026 Status: Approved for Development*

[ref1]: Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.002.png
[ref2]: Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.003.png
[ref3]: Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.009.png
[ref4]: Aspose.Words.f648323c-7404-4cde-81c6-45dce71b06f6.072.png
