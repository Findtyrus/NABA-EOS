export type AssessmentTypeId = "org_checkup" | "culture_checkup"

export type Question = { id: string; category: string; text: string; description: string }
export type Category = { name: string; description: string; emoji: string }

export type AssessmentConfig = {
  id: AssessmentTypeId
  slug: string
  label: string
  intro: string
  categories: Category[]
  questions: Question[]
}

export const LIKERT_OPTIONS = [
  { value: 1, emoji: "😞" },
  { value: 2, emoji: "😐" },
  { value: 3, emoji: "🙂" },
  { value: 4, emoji: "😊" },
  { value: 5, emoji: "😍" },
] as const

export const ASSESSMENT_CONFIGS: Record<AssessmentTypeId, AssessmentConfig> = {
  culture_checkup: {
    id: "culture_checkup",
    slug: "culture-checkup",
    label: "Culture Checkup",
    intro: "Assess the intentionality and healthiness of your organizational culture",
    categories: [
      {
        name: "Intentionality",
        description: "How purposeful and structured your culture is",
        emoji: "🎯",
      },
      {
        name: "Healthiness",
        description: "How positive and engaging your culture feels",
        emoji: "❤️",
      },
    ],
    questions: [
      {
        id: "culture_1",
        category: "Intentionality",
        text: "Our team consistently demonstrates our core values in daily actions and decisions.",
        description: "Assesses how well team members embody organizational values",
      },
      {
        id: "culture_2",
        category: "Intentionality",
        text: "New members are clearly introduced to our core values and expectations.",
        description: "Assesses onboarding around culture",
      },
      {
        id: "culture_3",
        category: "Intentionality",
        text: "We recognize and celebrate behavior that reflects our values.",
        description: "Assesses reinforcement of desired behavior",
      },
      {
        id: "culture_4",
        category: "Intentionality",
        text: "Leadership models the culture we want the rest of the chapter to have.",
        description: "Assesses leadership consistency with stated values",
      },
      {
        id: "culture_5",
        category: "Intentionality",
        text: "It is clear what behavior is and isn't acceptable in our chapter.",
        description: "Assesses clarity of cultural standards",
      },
      {
        id: "culture_6",
        category: "Healthiness",
        text: "I feel comfortable sharing my honest opinion in meetings.",
        description: "Assesses psychological safety",
      },
      {
        id: "culture_7",
        category: "Healthiness",
        text: "Members genuinely support and look out for one another.",
        description: "Assesses camaraderie and mutual support",
      },
      {
        id: "culture_8",
        category: "Healthiness",
        text: "I look forward to chapter meetings and events.",
        description: "Assesses overall engagement",
      },
      {
        id: "culture_9",
        category: "Healthiness",
        text: "Conflicts within the chapter are resolved in a healthy, direct way.",
        description: "Assesses conflict resolution",
      },
      {
        id: "culture_10",
        category: "Healthiness",
        text: "I would recommend joining this chapter to a friend.",
        description: "Assesses overall satisfaction",
      },
    ],
  },
  org_checkup: {
    id: "org_checkup",
    slug: "org-checkup",
    label: "Org Checkup",
    intro: "Assess how clearly your chapter's leadership, communication, and execution are running",
    categories: [
      {
        name: "Leadership & Direction",
        description: "How clear the chapter's direction and priorities are",
        emoji: "🧭",
      },
      {
        name: "Execution & Accountability",
        description: "How reliably the chapter follows through on commitments",
        emoji: "✅",
      },
    ],
    questions: [
      {
        id: "org_1",
        category: "Leadership & Direction",
        text: "Every officer knows the chapter's top priorities for this semester.",
        description: "Assesses clarity of direction",
      },
      {
        id: "org_2",
        category: "Leadership & Direction",
        text: "Decisions are made and communicated in a timely way.",
        description: "Assesses decision-making speed",
      },
      {
        id: "org_3",
        category: "Leadership & Direction",
        text: "It's clear who owns each area of chapter operations.",
        description: "Assesses clarity of ownership",
      },
      {
        id: "org_4",
        category: "Leadership & Direction",
        text: "Officers get the support they need from chapter leadership.",
        description: "Assesses leadership support",
      },
      {
        id: "org_5",
        category: "Leadership & Direction",
        text: "Meetings are productive and stay on schedule.",
        description: "Assesses meeting effectiveness",
      },
      {
        id: "org_6",
        category: "Execution & Accountability",
        text: "Commitments made in meetings are actually followed through on.",
        description: "Assesses follow-through",
      },
      {
        id: "org_7",
        category: "Execution & Accountability",
        text: "Issues get raised and resolved rather than lingering.",
        description: "Assesses issue resolution",
      },
      {
        id: "org_8",
        category: "Execution & Accountability",
        text: "We track our progress toward chapter goals regularly.",
        description: "Assesses progress tracking",
      },
      {
        id: "org_9",
        category: "Execution & Accountability",
        text: "Underperformance is addressed directly rather than ignored.",
        description: "Assesses accountability",
      },
      {
        id: "org_10",
        category: "Execution & Accountability",
        text: "Our processes make it easy for new officers to pick up their role.",
        description: "Assesses process documentation",
      },
    ],
  },
}

export function getAssessmentConfig(slug: string): AssessmentConfig | undefined {
  return Object.values(ASSESSMENT_CONFIGS).find((c) => c.slug === slug)
}

export function categoryAverages(
  config: AssessmentConfig,
  responses: { answers: Record<string, number> }[],
) {
  return config.categories.map((cat) => {
    const questionIds = config.questions.filter((q) => q.category === cat.name).map((q) => q.id)
    const scores: number[] = []
    for (const response of responses) {
      for (const qId of questionIds) {
        const score = response.answers[qId]
        if (typeof score === "number") scores.push(score)
      }
    }
    const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
    return { category: cat, average, count: scores.length }
  })
}
