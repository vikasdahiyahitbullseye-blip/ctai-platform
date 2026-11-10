// Teaching resources (original). `ch` keys use "<class>-<part>-<chapter>"; omit for class-wide resources.
type Res = { title: string; kind: string; audience: "TEACHER" | "STUDENT" | "BOTH"; classLevel: number; ch?: string; description: string; body: string };

export const RESOURCES: Res[] = [
  {
    title: "Lesson plan: Secret codes and number names", kind: "LESSON_PLAN", audience: "TEACHER", classLevel: 3, ch: "3-CT-1",
    description: "One 40-minute period that adds CT thinking to the Maths chapter 'What's in a Name?'.",
    body: `## Learning outcomes
- Recognise and continue simple patterns in number names (Pattern Recognition)
- Follow a step-by-step rule to encode and decode a word (Algorithmic Thinking)

## Flow (40 minutes)
| Time | Activity |
|---|---|
| 5 min | Hook: write a coded word on the board (shift of 1). Who can crack it? |
| 10 min | Explore: pairs count letters in number names ONE–TEN and record in a table |
| 15 min | Practise: 5 questions from the Hitbullseye practice set (projector or tablets) |
| 10 min | Discuss: 'Is our code safe for a bank PIN? Why not?' |

## Watch for
- Children counting repeated letters only once (e.g. SEVEN has two Es)
- Confusing 'backwards spelling' with 'reverse alphabet order'

## Evidence for the observation journal
- Can the child explain the rule in their own words?`,
  },
  {
    title: "Activity card: Programme the Robot", kind: "ACTIVITY_CARD", audience: "BOTH", classLevel: 3, ch: "3-CT-14",
    description: "Unplugged playground game for directions and algorithms.",
    body: `## You need
Chalk grid (5 × 5) on the ground, direction cards: ⬆ Forward, ↪ Turn right, ↩ Turn left

## How to play
1. One child is the **robot** and stands on the START square facing North.
2. The team places cards in a line to reach the TREASURE square.
3. The robot follows the cards **exactly**.
4. If the robot misses, find the **bug** and fix one card.

## Talk about it
- Which card was the bug?
- Can you reach the treasure with fewer cards?`,
  },
  {
    title: "Weather data table (template)", kind: "TEMPLATE", audience: "STUDENT", classLevel: 6,
    description: "Printable table for the Weather Watchers project.",
    body: `## Weather Watchers — data table
Team: ________________ Week: ______

| Date | State | Max °C | Min °C | Rain (mm) | Sky (☀️ ⛅ ☁️ 🌧️) | Source |
|---|---|---|---|---|---|---|
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |
| | | | | | | |

**Checker's initials:** ______`,
  },
  {
    title: "Teacher guide: Running a 20-hour interdisciplinary project", kind: "GUIDE", audience: "TEACHER", classLevel: 6,
    description: "How to plan, schedule and assess the CBSE CT & AI projects in Classes 6–8.",
    body: `## Planning
- CBSE allocates **40 hours** a year to interdisciplinary projects in Classes 6–8: **two projects of 20 hours**.
- The Computer teacher anchors the project and assesses it; subject teachers contribute (e.g. Geography for weather).
- Schedule about 2 periods a week for 10 weeks per project.

## Teams
- 3–5 students per team; give each a role (recorder, checker, designer, presenter) and rotate.

## Using the platform
1. **Projects → Launch** a kit for your class and create teams.
2. Students submit work for each **milestone**; you approve or return it with feedback.
3. Score the team on the **rubric** (4 levels per criterion). Each student adds an individual reflection.
4. Mark great work as **Showcase** — it appears in the class gallery.

## Assessment tips
- Assess the process (milestones) as well as the final product.
- Use the observation journal for individual contributions.`,
  },
  {
    title: "Parent consent note for project data collection", kind: "TEMPLATE", audience: "TEACHER", classLevel: 8,
    description: "Editable consent note for surveys and measurements in projects.",
    body: `Dear Parent/Guardian,

As part of the CBSE Computational Thinking & AI curriculum, your child's class will collect **anonymous** survey answers and simple fitness measurements for a school project.

- No names or photos of faces will be stored in the project data.
- Data will be used only for this class project and deleted at the end of term.

Please tick: ☐ I agree ☐ I do not agree

Parent name and signature: ______________________`,
  },
];
