export type ZoneId =
  | "overview"
  | "cnc"
  | "drafting"
  | "signage"
  | "showcase"
  | "contact";

export type Zone = {
  id: ZoneId;
  index: string;
  label: string;
  keyword: "Engineering" | "Steel Fabrication" | "Design" | "Perfection";
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  camera: [number, number, number];
  target: [number, number, number];
};

export const ZONES: Zone[] = [
  {
    id: "overview",
    index: "00",
    label: "Overview",
    keyword: "Engineering",
    eyebrow: "Swakopmund · Namibia",
    title: "Namibian ideas, engineered for the real world.",
    description:
      "Between the Namib and the Atlantic, we turn difficult industrial briefs into precise, buildable outcomes — designed, detailed and fabricated by one Swakopmund team.",
    detail: "Mining · Marine · Commercial · Industrial",
    camera: [11, 6.8, 14.2],
    target: [0, 1.55, 0],
  },
  {
    id: "cnc",
    index: "01",
    label: "CNC Fabrication",
    keyword: "Steel Fabrication",
    eyebrow: "CNC plasma · Heavy steel",
    title: "Precision that survives the site.",
    description:
      "Production-ready plate cutting and custom fabrication for Namibia’s mines, plants, vessels and commercial projects — clean geometry, disciplined fit-up and dependable turnaround.",
    detail: "Plate cutting · Profiles · Assemblies",
    camera: [-0.8, 4.6, 7.9],
    target: [-6.9, 1.55, 0],
  },
  {
    id: "drafting",
    index: "02",
    label: "3D Drafting",
    keyword: "Engineering",
    eyebrow: "Digital certainty before steel",
    title: "Resolve it in 3D before steel is touched.",
    description:
      "Production-ready models, shop drawings and fabrication logic that make scope visible, eliminate ambiguity and reduce expensive rework on site.",
    detail: "CAD · Shop drawings · Technical visualisation",
    camera: [6.8, 4.9, -0.8],
    target: [0, 2.05, -7],
  },
  {
    id: "signage",
    index: "03",
    label: "Signage",
    keyword: "Design",
    eyebrow: "Built visibility",
    title: "Identity, fabricated into the architecture.",
    description:
      "Dimensional letters, illuminated identities, wayfinding and sign structures designed as engineered objects — distinctive by day, unmistakable after dark.",
    detail: "3D signage · Wayfinding · Brand structures",
    camera: [13.6, 4.5, 6.5],
    target: [7.1, 2.35, 0],
  },
  {
    id: "showcase",
    index: "04",
    label: "Selected Work",
    keyword: "Perfection",
    eyebrow: "From brief to built",
    title: "The standard is visible in the finish.",
    description:
      "A live wall of recent Armored Pangolin work. New images uploaded by the team appear here automatically.",
    detail: "Portfolio · Process · Results",
    camera: [-0.2, 3.7, 14.7],
    target: [0, 2.1, 8.2],
  },
  {
    id: "contact",
    index: "05",
    label: "Start a Project",
    keyword: "Perfection",
    eyebrow: "Local access · Serious capability",
    title: "Bring us the brief nobody wants to simplify.",
    description:
      "Meet the people who will design and build it at Unit 2 Marvin Park, Swakopmund — or send the scope and let’s engineer the next move together.",
    detail: "Unit 2 Marvin Park · Swakopmund",
    camera: [13.8, 4.9, -1],
    target: [8.1, 1.9, -7],
  },
];

export const zoneById = (id: ZoneId) =>
  ZONES.find((zone) => zone.id === id) ?? ZONES[0];
