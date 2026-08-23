export type ServicePage = {
  slug: string;
  name: string;
  eyebrow: string;
  title: string;
  metaTitle: string;
  description: string;
  introduction: string;
  image: string;
  imageAlt: string;
  capabilities: readonly string[];
  applications: readonly string[];
  outcomes: readonly string[];
  questions: readonly { question: string; answer: string }[];
};

export const SERVICE_PAGES: readonly ServicePage[] = [
  {
    slug: "steel-fabrication-swakopmund",
    name: "Steel Fabrication",
    eyebrow: "Swakopmund · Namibia",
    title: "Steel fabrication built around the real job.",
    metaTitle: "Steel Fabrication Swakopmund, Namibia",
    description: "Custom steel fabrication in Swakopmund for industrial, mining, commercial and private projects across Namibia.",
    introduction: "Armored Pangolin turns practical requirements into accurately prepared steel assemblies. Design, cutting, forming, fit-up and welding stay connected in one Swakopmund workshop, giving clients a clear route from an early idea to a dependable finished product.",
    image: "/brand/concept-steel-frame-hd.webp",
    imageAlt: "Precision fabricated structural steel frame in an Armored Pangolin workshop setting",
    capabilities: ["Custom frames and supports", "Platforms, guards and equipment modifications", "One-off prototypes and replacement parts", "Production-ready assemblies from drawings"],
    applications: ["Mining and industrial operations", "Commercial property and hospitality", "Marine and coastal installations", "Agricultural and private engineering projects"],
    outcomes: ["A practical design prepared for fabrication", "Accurate components cut and formed in-house", "Considered fit-up, welding and inspection"],
    questions: [
      { question: "Can you work from a sketch or existing part?", answer: "Yes. We can develop a sketch, photograph, sample or problem statement into a manufacturable CAD model and drawing set." },
      { question: "Do you take on one-off work?", answer: "Yes. One-off components, prototypes, repairs and custom assemblies are a core part of the workshop capability." },
    ],
  },
  {
    slug: "cnc-plasma-cutting-swakopmund",
    name: "CNC Plasma Cutting",
    eyebrow: "Precision profile cutting",
    title: "Accurate profiles. Production-ready parts.",
    metaTitle: "CNC Plasma Cutting Swakopmund",
    description: "CNC plasma cutting in Swakopmund for steel plate, custom profiles, brackets, gussets, flanges, signage and production parts.",
    introduction: "Our CNC plasma workflow combines clean digital preparation with practical workshop experience. Parts are nested and cut to suit the next manufacturing step—whether they will be bent, drilled, machined, welded or supplied as finished profiles.",
    image: "/brand/workshop-hero-4k-v6.webp",
    imageAlt: "CNC plasma cutter profiling steel plate in the Armored Pangolin workshop in Swakopmund",
    capabilities: ["Brackets, gussets and base plates", "Flanges, profiles and structural components", "Custom signage and decorative steelwork", "Prototype and repeat production quantities"],
    applications: ["Industrial maintenance", "Mining equipment and support work", "Construction and structural fabrication", "Commercial signage and custom products"],
    outcomes: ["CAD-checked cut geometry", "Efficient material nesting", "Profiles prepared for downstream manufacturing"],
    questions: [
      { question: "Which files can I send?", answer: "DXF files are ideal, but we can also work from CAD models, drawings, sketches or measured samples." },
      { question: "Can you cut and fabricate the complete assembly?", answer: "Yes. Cutting can flow directly into bending, machining, welding and final assembly in the same workshop." },
    ],
  },
  {
    slug: "press-brake-bending",
    name: "Press Brake Bending",
    eyebrow: "Controlled sheet and plate forming",
    title: "Repeatable bends. Practical geometry.",
    metaTitle: "Press Brake Bending Namibia",
    description: "Press brake bending and sheet-metal forming in Swakopmund for brackets, trays, channels, covers, enclosures and custom profiles.",
    introduction: "Accurate bending starts in the design. We account for material, tooling, bend sequence and the way the finished component must assemble, then form the part with repeatable geometry and a clear manufacturing logic.",
    image: "/brand/press-brake-workshop-v2-hd.webp",
    imageAlt: "Industrial press brake with precision bending tooling in a Namibian fabrication workshop",
    capabilities: ["Sheet and plate folding", "Channels, trays and enclosures", "Brackets and custom profiles", "Components manufactured from drawings"],
    applications: ["Machine guards and covers", "Electrical and equipment enclosures", "Vehicle and trailer components", "Architectural and commercial metalwork"],
    outcomes: ["Bend-ready flat patterns", "Controlled bend sequences", "Components checked against the design"],
    questions: [
      { question: "Can you help design the folded part?", answer: "Yes. We can develop the 3D sheet-metal model, flat pattern and fabrication drawing before manufacture." },
      { question: "Can bending be combined with plasma cutting?", answer: "Yes. Cut and formed components can be produced as one connected workflow." },
    ],
  },
  {
    slug: "welding-fabrication",
    name: "Welding & Fabrication",
    eyebrow: "Fit-up · Assembly · Welding",
    title: "Fabricated carefully. Built to endure.",
    metaTitle: "Welding & Fabrication Swakopmund",
    description: "Professional welding and steel fabrication in Swakopmund for frames, supports, repairs, modifications and complete custom assemblies.",
    introduction: "Good welding begins with accurate preparation and disciplined fit-up. Our team carries the drawing into the workshop, controls the assembly and produces dependable fabricated work for Namibia's industrial, commercial and custom sectors.",
    image: "/brand/welding-workshop-v2-hd.webp",
    imageAlt: "Professional welding and steel fit-up inside the Armored Pangolin fabrication workshop",
    capabilities: ["MIG welding and steel assembly", "Frames, platforms and supports", "Equipment repairs and modifications", "Complete custom fabricated products"],
    applications: ["Industrial equipment and maintenance", "Mining and construction support", "Hospitality, lodge and signage work", "Vehicle, trailer and private projects"],
    outcomes: ["Accurately prepared components", "Controlled fit-up before welding", "Finished assemblies inspected for function and workmanship"],
    questions: [
      { question: "Do you handle repairs and modifications?", answer: "Yes. We assess existing equipment and develop practical repair or modification solutions where fabrication is appropriate." },
      { question: "Can you fabricate directly from client drawings?", answer: "Yes. We can work from supplied drawings or review and develop them before production." },
    ],
  },
  {
    slug: "cad-engineering-design",
    name: "CAD Engineering & Design",
    eyebrow: "From requirement to production data",
    title: "Resolve it in 3D before steel is cut.",
    metaTitle: "CAD Engineering Design Namibia",
    description: "3D CAD design, technical draughting, shop drawings and design-for-manufacture services from Swakopmund, Namibia.",
    introduction: "Armored Pangolin develops practical digital designs around how a product will actually be made. Autodesk Inventor models, assemblies, flat patterns and shop drawings connect the client requirement to CNC cutting and workshop production.",
    image: "/brand/cad-engineering-workstation-v1-hd.webp",
    imageAlt: "CAD engineering workstation displaying a production-ready folded steel assembly",
    capabilities: ["3D parts and assemblies", "Fabrication and shop drawings", "Sheet-metal flat patterns", "Design-for-manufacture development"],
    applications: ["New products and prototypes", "Reverse-engineered replacement components", "Fabricated structures and assemblies", "Manufacturing documentation"],
    outcomes: ["A clear 3D definition of the work", "Production-ready drawings and files", "Fewer uncertainties on the workshop floor"],
    questions: [
      { question: "Can you design from a photograph or sample?", answer: "Yes. Where suitable, we can measure and model an existing component or develop a concept from reference material." },
      { question: "Do you only provide drawings?", answer: "Design can be supplied as a standalone service or carried through to cutting, forming and fabrication." },
    ],
  },
  {
    slug: "machining",
    name: "Machining",
    eyebrow: "Milling · Drilling · Preparation",
    title: "Critical features finished with control.",
    metaTitle: "Machining Services Swakopmund",
    description: "Machining support in Swakopmund for milling, drilling, hole preparation and fabricated component modification.",
    introduction: "Fabricated engineering often depends on accurately prepared holes, faces and interfaces. Our machining capability supports the wider manufacturing workflow so critical features are considered together with cutting, bending and welding.",
    image: "/brand/concept-ibeam-warehouse-hd.webp",
    imageAlt: "Precision steel components prepared for industrial fabrication and machining",
    capabilities: ["Milling and drilling", "Hole preparation and finishing", "Component modification", "Fabrication-related machined features"],
    applications: ["Fabricated brackets and frames", "Replacement and modified components", "Equipment interfaces and mounting points", "Prototype and repair work"],
    outcomes: ["Features coordinated with the CAD design", "Machining integrated into the fabrication sequence", "Components prepared for accurate assembly"],
    questions: [
      { question: "Is machining available as part of a fabricated project?", answer: "Yes. That is its primary role: completing critical features within a connected fabrication workflow." },
      { question: "Can you assess an existing component?", answer: "Yes. Bring the part or suitable measurements and we can discuss the most practical route." },
    ],
  },
] as const;

export function getServicePage(slug: string) {
  return SERVICE_PAGES.find((service) => service.slug === slug);
}
