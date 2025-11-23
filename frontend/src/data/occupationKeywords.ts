/**
 * Comprehensive Occupation Keyword Mapping
 *
 * Maps common job search terms and synonyms to all BLS occupation codes.
 * This helps users find the right occupation category using natural language.
 */

export interface OccupationKeywordMapping {
  occupation_code: string
  keywords: string[]
  aliases: string[]
}

export const occupationKeywords: OccupationKeywordMapping[] = [
  // BUSINESS AND FINANCIAL OPERATIONS
  {
    occupation_code: "132011",
    keywords: ["accountant", "auditor", "cpa", "accounting", "tax", "financial reporting", "audit", "bookkeeping"],
    aliases: ["Accountant", "Auditor", "CPA", "Certified Public Accountant", "Staff Accountant", "Senior Accountant", "Tax Accountant", "Public Accountant"]
  },
  {
    occupation_code: "131199",
    keywords: ["business analyst", "operations specialist", "business operations", "process analyst", "operations analyst", "business systems"],
    aliases: ["Business Analyst", "Business Operations Specialist", "Operations Analyst", "Process Analyst", "Business Systems Analyst", "Operations Specialist"]
  },
  {
    occupation_code: "131031",
    keywords: ["claims adjuster", "claims examiner", "insurance claims", "claims investigator", "adjuster"],
    aliases: ["Claims Adjuster", "Claims Examiner", "Insurance Claims Adjuster", "Claims Investigator"]
  },
  {
    occupation_code: "131041",
    keywords: ["compliance", "compliance officer", "regulatory", "risk compliance", "compliance analyst"],
    aliases: ["Compliance Officer", "Compliance Analyst", "Regulatory Compliance Officer", "Risk Compliance Officer"]
  },
  {
    occupation_code: "132053",
    keywords: ["underwriter", "insurance underwriter", "risk assessment", "underwriting"],
    aliases: ["Insurance Underwriter", "Underwriter", "Risk Underwriter", "Commercial Underwriter"]
  },
  {
    occupation_code: "132072",
    keywords: ["loan officer", "mortgage", "lending", "loan processor", "mortgage loan officer"],
    aliases: ["Loan Officer", "Mortgage Loan Officer", "Commercial Loan Officer", "Lending Officer"]
  },
  {
    occupation_code: "131161",
    keywords: ["market research", "marketing analyst", "market analyst", "consumer insights", "market researcher", "marketing specialist", "marketing data"],
    aliases: ["Market Research Analyst", "Marketing Analyst", "Market Analyst", "Consumer Insights Analyst", "Marketing Specialist", "Market Researcher"]
  },
  {
    occupation_code: "131151",
    keywords: ["training", "learning development", "training specialist", "corporate trainer", "instructional designer", "learning and development"],
    aliases: ["Training Specialist", "Training and Development Specialist", "Corporate Trainer", "L&D Specialist", "Instructional Designer"]
  },

  // COMPUTER AND MATHEMATICAL
  {
    occupation_code: "151211",
    keywords: ["computer systems analyst", "systems analyst", "it analyst", "business systems analyst", "technical analyst", "systems"],
    aliases: ["Computer Systems Analyst", "Systems Analyst", "IT Systems Analyst", "Business Systems Analyst", "Technical Analyst"]
  },
  {
    occupation_code: "151212",
    keywords: ["information security", "cybersecurity", "security analyst", "infosec", "cyber security", "security engineer", "information assurance", "penetration tester", "ethical hacker", "security operations"],
    aliases: ["Information Security Analyst", "Cybersecurity Analyst", "Security Analyst", "InfoSec Analyst", "Cyber Security Analyst", "Security Engineer"]
  },
  {
    occupation_code: "151252",
    keywords: ["software developer", "database", "dba", "database administrator", "sql developer", "database engineer", "data engineer"],
    aliases: ["Database Administrator", "DBA", "Database Developer", "SQL Developer", "Database Engineer", "Data Engineer"]
  },
  {
    occupation_code: "151256",
    keywords: ["software developer", "software engineer", "programmer", "developer", "coder", "application developer", "web developer", "mobile developer", "frontend", "backend", "full stack", "fullstack", "software qa", "quality assurance", "test engineer", "qa engineer", "sdet", "automation engineer"],
    aliases: ["Software Developer", "Software Engineer", "Web Developer", "Application Developer", "Mobile Developer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Programmer", "QA Engineer", "Test Engineer", "SDET", "Quality Assurance Analyst"]
  },
  {
    occupation_code: "151133",
    keywords: ["systems software", "software developer", "systems engineer", "platform engineer", "kernel developer", "embedded systems", "systems programming", "infrastructure engineer"],
    aliases: ["Systems Software Developer", "Systems Engineer", "Platform Engineer", "Kernel Developer", "Embedded Systems Engineer", "Systems Programmer"]
  },
  {
    occupation_code: "151199",
    keywords: ["computer", "it specialist", "tech specialist", "technology", "data scientist", "machine learning", "ml engineer", "ai engineer", "artificial intelligence"],
    aliases: ["Computer Specialist", "IT Specialist", "Data Scientist", "ML Engineer", "Machine Learning Engineer", "AI Engineer", "AI Specialist"]
  },

  // ARCHITECTURE AND ENGINEERING
  {
    occupation_code: "172011",
    keywords: ["aerospace engineer", "aeronautical", "flight engineer", "aviation engineer"],
    aliases: ["Aerospace Engineer", "Aeronautical Engineer", "Flight Engineer", "Aviation Engineer"]
  },
  {
    occupation_code: "172051",
    keywords: ["civil engineer", "structural engineer", "construction engineer", "civil engineering", "infrastructure"],
    aliases: ["Civil Engineer", "Structural Engineer", "Construction Engineer", "Infrastructure Engineer"]
  },

  // SOCIAL SERVICES
  {
    occupation_code: "211021",
    keywords: ["social worker", "child family social worker", "school social worker", "family services", "child welfare"],
    aliases: ["Social Worker", "Child Social Worker", "Family Social Worker", "School Social Worker", "Child and Family Social Worker"]
  },
  {
    occupation_code: "211012",
    keywords: ["counselor", "guidance counselor", "school counselor", "career counselor", "vocational counselor", "academic advisor"],
    aliases: ["School Counselor", "Guidance Counselor", "Career Counselor", "Vocational Counselor", "Academic Advisor", "Educational Counselor"]
  },

  // EDUCATION
  {
    occupation_code: "259031",
    keywords: ["instructional coordinator", "curriculum", "curriculum developer", "educational coordinator", "learning coordinator"],
    aliases: ["Instructional Coordinator", "Curriculum Coordinator", "Curriculum Developer", "Educational Coordinator"]
  },

  // ARTS, DESIGN, AND MEDIA
  {
    occupation_code: "271024",
    keywords: ["graphic designer", "visual designer", "designer", "brand designer", "creative designer", "ui designer", "ux designer", "user experience", "user interface"],
    aliases: ["Graphic Designer", "Visual Designer", "Brand Designer", "Creative Designer", "UI Designer", "UX Designer", "UI/UX Designer"]
  },

  // OFFICE AND ADMINISTRATIVE SUPPORT
  {
    occupation_code: "433031",
    keywords: ["bookkeeper", "bookkeeping", "accounting clerk", "accounts payable", "accounts receivable", "payroll clerk"],
    aliases: ["Bookkeeper", "Bookkeeping Clerk", "Accounting Clerk", "Accounts Payable Clerk", "Accounts Receivable Clerk"]
  },
  {
    occupation_code: "434011",
    keywords: ["brokerage clerk", "securities clerk", "stock clerk", "trading clerk"],
    aliases: ["Brokerage Clerk", "Securities Clerk", "Stock Clerk"]
  },
  {
    occupation_code: "436011",
    keywords: ["executive secretary", "executive assistant", "administrative assistant", "executive admin", "ea"],
    aliases: ["Executive Secretary", "Executive Assistant", "Executive Administrative Assistant", "EA", "Senior Administrative Assistant"]
  },
  {
    occupation_code: "433099",
    keywords: ["financial clerk", "billing clerk", "invoice clerk", "financial assistant"],
    aliases: ["Financial Clerk", "Billing Clerk", "Invoice Clerk", "Financial Assistant"]
  },
  {
    occupation_code: "434051",
    keywords: ["customer service", "customer support", "call center", "customer service representative", "csr", "support representative", "customer care", "client services"],
    aliases: ["Customer Service Representative", "Customer Support Representative", "CSR", "Call Center Representative", "Support Agent", "Customer Care Representative"]
  },
  {
    occupation_code: "434131",
    keywords: ["loan clerk", "loan interviewer", "loan processor", "mortgage processor"],
    aliases: ["Loan Clerk", "Loan Interviewer", "Loan Processor", "Mortgage Processor"]
  },
  {
    occupation_code: "439041",
    keywords: ["insurance clerk", "claims clerk", "policy processing", "insurance processor"],
    aliases: ["Insurance Claims Clerk", "Insurance Policy Processing Clerk", "Claims Processor"]
  },
  {
    occupation_code: "435061",
    keywords: ["production planning", "expediting clerk", "production coordinator", "planning clerk", "materials coordinator"],
    aliases: ["Production Planning Clerk", "Expediting Clerk", "Production Coordinator", "Materials Coordinator"]
  },
  {
    occupation_code: "435071",
    keywords: ["shipping", "receiving", "inventory clerk", "warehouse clerk", "shipping clerk", "receiving clerk", "stock clerk"],
    aliases: ["Shipping Clerk", "Receiving Clerk", "Inventory Clerk", "Warehouse Clerk", "Stock Clerk", "Shipping and Receiving Clerk"]
  },

  // SALES
  {
    occupation_code: "414011",
    keywords: ["sales representative", "sales rep", "account executive", "sales", "technical sales", "wholesale sales", "manufacturing sales", "b2b sales"],
    aliases: ["Sales Representative", "Sales Rep", "Account Executive", "Technical Sales Representative", "Wholesale Sales Rep", "B2B Sales Rep"]
  },
  {
    occupation_code: "413091",
    keywords: ["sales representative", "services sales", "sales rep", "account manager", "sales executive"],
    aliases: ["Sales Representative", "Services Sales Rep", "Account Manager", "Sales Executive"]
  },

  // CONSTRUCTION AND EXTRACTION
  {
    occupation_code: "472061",
    keywords: ["construction laborer", "construction worker", "laborer", "general laborer", "construction helper"],
    aliases: ["Construction Laborer", "Construction Worker", "General Laborer", "Construction Helper"]
  },
  {
    occupation_code: "471011",
    keywords: ["construction supervisor", "foreman", "construction foreman", "site supervisor", "trades supervisor"],
    aliases: ["Construction Supervisor", "Construction Foreman", "Site Supervisor", "Trades Supervisor", "First-Line Supervisor"]
  },

  // INSTALLATION, MAINTENANCE, AND REPAIR
  {
    occupation_code: "499071",
    keywords: ["maintenance", "repair worker", "maintenance technician", "facilities maintenance", "general maintenance", "building maintenance"],
    aliases: ["Maintenance Worker", "Maintenance Technician", "Repair Worker", "Facilities Maintenance Worker", "General Maintenance Worker"]
  },

  // PRODUCTION
  {
    occupation_code: "512028",
    keywords: ["assembler", "electrical assembler", "electronic assembler", "electromechanical assembler", "assembly worker"],
    aliases: ["Electrical Assembler", "Electronic Assembler", "Electromechanical Assembler", "Assembly Technician"]
  },
  {
    occupation_code: "519061",
    keywords: ["inspector", "tester", "quality inspector", "quality control", "qc inspector", "sorter", "sampler", "weigher"],
    aliases: ["Inspector", "Quality Inspector", "QC Inspector", "Tester", "Quality Control Inspector", "Production Inspector"]
  },
  {
    occupation_code: "515112",
    keywords: ["printing press operator", "press operator", "printer", "printing machine operator"],
    aliases: ["Printing Press Operator", "Press Operator", "Printer Operator"]
  },
  {
    occupation_code: "512090",
    keywords: ["assembler", "fabricator", "production assembler", "manufacturing assembler", "assembly worker"],
    aliases: ["Assembler", "Fabricator", "Production Assembler", "Manufacturing Assembler", "Assembly Worker"]
  },
  {
    occupation_code: "514121",
    keywords: ["welder", "cutter", "solderer", "brazer", "welding", "metal fabricator"],
    aliases: ["Welder", "Cutter", "Solderer", "Brazer", "Welding Technician", "Metal Fabricator"]
  },

  // TRANSPORTATION AND MATERIAL MOVING
  {
    occupation_code: "533033",
    keywords: ["delivery driver", "light truck driver", "delivery", "courier", "van driver", "package delivery"],
    aliases: ["Delivery Driver", "Light Truck Driver", "Courier", "Van Driver", "Package Delivery Driver"]
  },
  {
    occupation_code: "537065",
    keywords: ["stocker", "order filler", "warehouse worker", "stock clerk", "inventory stocker"],
    aliases: ["Stocker", "Order Filler", "Warehouse Stocker", "Stock Clerk", "Inventory Stocker"]
  },

  // BUILDING AND GROUNDS MAINTENANCE
  {
    occupation_code: "373011",
    keywords: ["landscaping", "groundskeeper", "grounds maintenance", "landscape worker", "gardener", "lawn care"],
    aliases: ["Landscaping Worker", "Groundskeeper", "Grounds Maintenance Worker", "Landscape Technician", "Gardener"]
  },

  // BROAD OCCUPATIONAL CATEGORIES (for general searches)
  {
    occupation_code: "130000",
    keywords: ["business operations", "financial operations", "business", "finance"],
    aliases: ["Business and Financial Operations"]
  },
  {
    occupation_code: "150000",
    keywords: ["computer", "it", "technology", "tech", "software", "programming", "mathematical"],
    aliases: ["Computer and Mathematical Occupations", "IT", "Technology"]
  },
  {
    occupation_code: "170000",
    keywords: ["architecture", "engineering", "engineer"],
    aliases: ["Architecture and Engineering"]
  },
  {
    occupation_code: "250000",
    keywords: ["education", "teaching", "teacher", "training", "library", "instructor"],
    aliases: ["Education, Training, and Library"]
  },
  {
    occupation_code: "290000",
    keywords: ["healthcare", "medical", "health", "clinical", "nurse", "practitioner"],
    aliases: ["Healthcare Practitioners and Technical"]
  },
  {
    occupation_code: "430000",
    keywords: ["office", "administrative", "admin", "clerical", "secretary", "clerk"],
    aliases: ["Office and Administrative Support"]
  },
  {
    occupation_code: "470000",
    keywords: ["construction", "building", "trades", "contractor", "extraction"],
    aliases: ["Construction and Extraction"]
  },
  {
    occupation_code: "490000",
    keywords: ["installation", "maintenance", "repair", "technician", "mechanic"],
    aliases: ["Installation, Maintenance, and Repair"]
  },
  {
    occupation_code: "510000",
    keywords: ["production", "manufacturing", "assembly", "factory", "plant"],
    aliases: ["Production"]
  },
  {
    occupation_code: "410000",
    keywords: ["sales", "selling", "retail", "sales representative"],
    aliases: ["Sales and Related"]
  },
  {
    occupation_code: "530000",
    keywords: ["transportation", "driving", "driver", "logistics", "material moving", "warehouse"],
    aliases: ["Transportation and Material Moving"]
  },
  {
    occupation_code: "330000",
    keywords: ["protective service", "security", "police", "firefighter", "law enforcement", "corrections"],
    aliases: ["Protective Service"]
  },
  {
    occupation_code: "190000",
    keywords: ["science", "scientist", "research", "laboratory", "physical science", "social science"],
    aliases: ["Life, Physical, and Social Science"]
  },
  {
    occupation_code: "110000",
    keywords: ["management", "manager", "director", "executive", "supervisor", "chief", "president", "ceo", "cfo", "cto", "vp", "vice president"],
    aliases: ["Management"]
  }
]

/**
 * Get keywords for a specific occupation code
 */
export function getKeywordsForOccupation(occupationCode: string): string[] {
  const mapping = occupationKeywords.find(m => m.occupation_code === occupationCode)
  if (!mapping) return []
  return [...mapping.keywords, ...mapping.aliases]
}

/**
 * Find occupation codes that match keywords (simple matching)
 */
export function findOccupationsByKeyword(searchTerm: string): string[] {
  const normalizedSearch = searchTerm.toLowerCase().trim()

  return occupationKeywords
    .filter(mapping =>
      mapping.keywords.some(kw => kw.includes(normalizedSearch)) ||
      mapping.aliases.some(alias => alias.toLowerCase().includes(normalizedSearch))
    )
    .map(m => m.occupation_code)
}
