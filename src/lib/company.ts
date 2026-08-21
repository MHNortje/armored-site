export const COMPANY = {
  name: "Armored Pangolin",
  registeredEntity: "Herda Investments CC",
  location: "Unit 2 Marvin Park, Industrial Area, Swakopmund, Namibia",
  region: "Swakopmund · Walvis Bay · Erongo · Namibia",
  industry: "Steel Engineering · Design · Fabrication",
  headline: "From concept to steel.",
  introduction:
    "Armored Pangolin combines engineering design, CAD modelling, CNC manufacturing and practical steel fabrication to take work from an initial idea through to a finished product.",
} as const;

export const SERVICES = [
  {
    name: "CNC Plasma Cutting",
    summary: "Precision profile cutting for brackets, base plates, gussets, flanges, structures, signage and production parts.",
    items: ["CNC-ready profiles", "Custom components", "Prototype and production quantities"],
  },
  {
    name: "CAD Design & Draughting",
    summary: "3D CAD, shop drawings, flat patterns and manufacturing logic developed around how the product will actually be made.",
    items: ["Autodesk Inventor", "Fabrication drawings", "Design-for-manufacture"],
  },
  {
    name: "Press Brake Bending",
    summary: "Repeatable sheet and plate forming for brackets, trays, covers, channels, enclosures and custom profiles.",
    items: ["Sheet-metal forming", "Folded components", "Manufactured from drawings"],
  },
  {
    name: "Welding & Fabrication",
    summary: "Frames, platforms, supports, equipment modifications, repairs and complete custom steel assemblies.",
    items: ["MIG welding", "Assembly and fit-up", "Industrial and custom work"],
  },
  {
    name: "Machining",
    summary: "Milling, drilling, hole preparation and component modification where required for fabricated engineering work.",
    items: ["Milling and drilling", "Machined features", "Fabrication-related machining"],
  },
  {
    name: "Custom Steelwork",
    summary: "One-off prototypes, guards, stands, tooling, furniture, vehicle-related components and unusual practical solutions.",
    items: ["No catalogue limitations", "Replacement components", "Ideas developed into products"],
  },
] as const;

export const PROCESS = [
  ["01", "Consult", "Understand the requirement and the real problem to solve."],
  ["02", "Design", "Develop the component, assembly or structure in CAD."],
  ["03", "Prepare", "Produce drawings, flat patterns, CNC files and material requirements."],
  ["04", "Cut", "Profile plate and sheet accurately using CNC plasma."],
  ["05", "Form", "Bend and form components where the design requires it."],
  ["06", "Machine", "Drill, mill or modify critical features as needed."],
  ["07", "Fabricate", "Fit, weld and assemble the finished structure or product."],
  ["08", "Inspect", "Check dimensions, function and overall workmanship."],
  ["09", "Deliver", "Prepare the completed work for collection or project delivery."],
] as const;

export const INDUSTRIES = [
  "Mining",
  "Construction",
  "Marine & Coastal",
  "Agriculture",
  "Hospitality & Lodges",
  "Automotive & 4×4",
  "Signage",
  "Private & Custom Projects",
] as const;

export const ADVANTAGES = [
  ["Design + manufacturing", "Work with one team from the first idea through to fabrication."],
  ["Practical engineering", "A drawing must become a product that works outside the computer."],
  ["CNC capability", "Computer-controlled production improves consistency and handles complex profiles efficiently."],
  ["Direct communication", "Discuss the work with the people responsible for designing and manufacturing it."],
] as const;
