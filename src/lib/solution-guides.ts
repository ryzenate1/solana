export const solutionGuides = {
  residential: {
    label: 'RESIDENTIAL SOLAR', title: 'A home powered by possibility.',
    description: 'Start with your electricity use and a roof assessment. Build a solar plan around the way your household actually uses energy.',
    mode: 'home', property: 'residential',
    considerations: [
      ['Your electricity use', 'Bring a recent bill and its billing period. Daytime appliances and occupancy help determine how much solar energy you could use directly.'],
      ['Your roof', 'Usable space, shade, orientation, waterproofing, safe access and structural condition all shape the design.'],
      ['Your priorities', 'Compare bill reduction, future load growth and backup requirements. Battery backup is a separate design decision.'],
    ],
    documents: ['A recent electricity bill', 'Approximate usable roof area', 'Property location and roof access details', 'Any known shading or roof-condition concerns'],
    faqs: [
      ['How much capacity do I need?', 'A starting estimate balances energy demand and available roof area. The final design needs a site survey, electrical assessment and suitable generation modelling.'],
      ['Does solar provide power during an outage?', 'Conventional grid-connected solar generally stops during a grid outage. Backup requires compatible equipment and a design for essential loads.'],
      ['Is a subsidy included in the estimate?', 'No. Verify current eligibility through the official government portal. Our preliminary calculator excludes subsidy.'],
    ],
  },
  commercial: {
    label: 'COMMERCIAL & INDUSTRIAL SOLAR', title: 'Give your roof a business case.',
    description: 'Evaluate an installation against your operating schedule, energy demand and investment requirements, with assumptions that your decision-makers can review.',
    mode: 'business', property: 'commercial',
    considerations: [
      ['Energy before equipment', 'Review consumption, tariff components, daytime activity and contract demand. Interval data supports more precise load matching.'],
      ['An investment you can inspect', 'Compare capital cost, operating costs, self-consumption, export assumptions, degradation and financing. Stress-test lower generation.'],
      ['A practical delivery plan', 'Assess roof condition, structure, electrical capacity, work access and operational constraints before agreeing the installation scope.'],
    ],
    documents: ['Recent bills and tariff details', 'Operating days and hours', 'Roof dimensions, drawings or survey information', 'Available interval consumption and contract-demand information'],
    faqs: [
      ['Will solar reduce demand charges?', 'Do not assume it will. Demand charges depend on tariff rules and coincident peak demand. Our preliminary model does not include demand-charge savings.'],
      ['Do you offer financing or a PPA?', 'The finance tool is a comparison scenario. Available products, partners, approval requirements and commercial terms must be confirmed with the team. No lease or PPA offer is implied.'],
      ['What does an investment assessment need?', 'A site survey, actual consumption and tariffs, equipment specifications, realistic generation, maintenance and replacement costs, and an agreed tax/financing treatment.'],
    ],
  },
} as const;
export type SolutionSlug = keyof typeof solutionGuides;
