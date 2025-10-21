import { z } from "zod";

// =================================================================
// 1. Core Position Details
// =================================================================

// Enum Definitions
const SeniorityLevelEnum = z.enum([
  "Internship",
  "Entry-Level/Graduate",
  "Junior",
  "Mid-Level (Medior)",
  "Senior",
  "Lead",
  "Manager",
  "Director/Executive",
]);

// *** EXPANDED ENUM (50 Categories) ***
const JobFunctionEnum = z.enum([
  // IT - Software Engineering
  "Software Engineering - Backend",
  "Software Engineering - Frontend",
  "Software Engineering - Fullstack",
  "Software Engineering - Mobile (Native)",
  "Software Engineering - Mobile (Cross-Platform)",
  "Software Engineering - Embedded/IoT",
  "Software Architecture",
  "Game Development",
  // IT - QA/Testing
  "QA/Testing - Automation (SDET)",
  "QA/Testing - Manual",
  "QA/Testing - Performance/Security",
  // IT - Infrastructure & Operations
  "DevOps/SRE/Platform Engineering",
  "Cloud Engineering/Architecture",
  "System Administration (Linux/Unix)",
  "System Administration (Windows)",
  "Network Engineering/Architecture",
  "IT Support/Helpdesk (L1/L2)",
  "Application Support (L3)",
  "Database Administration (DBA)",
  "Virtualization/Storage Engineering",
  // IT - Cybersecurity
  "Cybersecurity - Engineering/Architecture",
  "Cybersecurity - GRC/Audit",
  "Cybersecurity - Operations/SOC/Analyst",
  "Cybersecurity - Penetration Testing",
  // IT - Data
  "Data Science/Machine Learning",
  "Data Engineering",
  "Data Analysis/Business Intelligence (BI)",
  "Data Architecture",
  "AI/NLP Engineering",
  // IT - Product & Project
  "IT Consulting",
  "Business Analysis",
  "Project Management",
  "Product Management",
  "Agile Leadership/Scrum Master",
  "UX/UI Design",
  "UX Research",
  "Technical Writing",
  "ERP/CRM Systems Specialist",
  // Management
  "IT Management (Team Lead/Director)",
  "Executive Leadership (C-Level)",
  // Business Functions
  "Sales/Pre-sales Engineering",
  "Account Management/Customer Success",
  "Marketing/Communications",
  "HR/Recruiting/Talent Acquisition",
  "Finance/Accounting/Controlling",
  "Legal/Compliance",
  "Operations/Logistics",
  // Other Engineering
  "Engineering - Hardware/Electrical",
  "Engineering - Industrial/Automation (PLC/SCADA)",
  "Other",
]);

// *** EXPANDED ENUM (50+ Categories) ***
const IndustryVerticalEnum = z.enum([
  // Technology & IT
  "IT Services/Consulting/Integration",
  "Software/SaaS (Product Companies)",
  "Hardware/Electronics Manufacturing",
  "Cybersecurity (Vendors/Services)",
  "Cloud Services/Hosting",
  "Telecommunications/ISP",
  "Semiconductors",
  "Artificial Intelligence/Robotics",
  // Finance & Business Services
  "Banking/Financial Services",
  "Fintech/Payments",
  "Insurance/Insurtech",
  "Investment/Venture Capital",
  "Accounting/Audit",
  "Management Consulting (Non-IT)",
  "Legal Services",
  "Human Resources/Recruiting Services",
  // Manufacturing & Engineering
  "Manufacturing - Industrial/Machinery",
  "Manufacturing - Consumer Goods (FMCG)",
  "Automotive/Mobility",
  "Aerospace/Defense",
  "Chemical Industry",
  "Engineering Services",
  // Energy & Environment
  "Energy - Oil/Gas",
  "Energy - Renewables/Green Tech",
  "Utilities (Water/Electricity)",
  "Mining/Natural Resources",
  // Healthcare & Life Sciences
  "Healthcare Providers (Hospitals/Clinics)",
  "MedTech/Medical Devices",
  "Pharmaceutical/Biotech",
  "Scientific Research",
  // Logistics & Property
  "Logistics/Transportation",
  "Supply Chain/Warehousing",
  "Construction/Infrastructure",
  "Real Estate/Property Management",
  // Public Sector & Education
  "Government/Public Administration",
  "Education (K-12/Higher Ed)",
  "EdTech",
  "Non-Profit/NGO/Humanitarian",
  // Consumer & Media
  "E-commerce/Online Marketplace",
  "Retail (Brick and Mortar)",
  "Marketing/Advertising/AdTech",
  "Media/Broadcasting",
  "Entertainment/Film/Music",
  "Gaming/Esports",
  "Hospitality/Hotels",
  "Travel/Tourism",
  "Food & Beverage Production (e.g., Breweries)",
  "Agriculture/AgriTech",
  "Fashion/Textiles",
  "Other",
]);

// *** EXPANDED ENUM (50 Categories) ***
const ApplicationDomainEnum = z.enum([
  // Application Layer
  "Web - Frontend (Browser-based)",
  "Web - Backend (Server-side logic, APIs)",
  "Web - Fullstack",
  "Mobile - Native (iOS/Android)",
  "Mobile - Cross-Platform (RN/Flutter)",
  "Desktop - Windows",
  "Desktop - macOS/Linux",
  "API/Integration Platforms (MuleSoft/etc.)",
  // Cloud & Infrastructure
  "Cloud - Public (AWS/Azure/GCP)",
  "Cloud - Private/Hybrid",
  "Cloud - Native Application Development (Serverless)",
  "Infrastructure - On-Premise Servers",
  "Infrastructure - Networking (LAN/WAN/SD-WAN)",
  "Infrastructure - Virtualization (VMware/Hyper-V)",
  "Infrastructure - Containerization (Docker/K8s)",
  "Operating System Administration/Development",
  // Data & AI
  "Data - Relational Databases (SQL)",
  "Data - NoSQL Databases",
  "Data - Warehousing/ETL",
  "Data - Big Data Platforms (Spark/Databricks)",
  "Data - Visualization/BI Tools (PowerBI/Tableau)",
  "AI - Machine Learning/Deep Learning",
  "AI - NLP/Conversational (LLMs)",
  "AI - Computer Vision",
  // Security
  "Security - Network Security (Firewalls/VPN)",
  "Security - Application Security (AppSec)",
  "Security - Identity/Access Management (IAM/AD)",
  "Security - SIEM/Monitoring (Splunk/Sentinel)",
  "Security - Endpoint Protection (EDR/XDR)",
  // Enterprise Systems
  "ERP Systems (SAP/Dynamics/etc.)",
  "CRM Systems (Salesforce/etc.)",
  "HR Information Systems (HRIS)",
  "Content Management Systems (CMS)",
  "E-commerce Platforms (Magento/Shopify/Custom)",
  "Financial/Trading Systems",
  // Specialized & Industrial
  "Embedded Systems/Firmware",
  "Internet of Things (IoT)",
  "Industrial Control Systems (PLC/SCADA)",
  "Telecommunications/VoIP/Contact Center",
  "Mainframe",
  // Specific Platforms/Domains
  "Game Development",
  "DevOps Tooling/CI/CD Pipelines",
  "Blockchain/Web3",
  "Scientific/High-Performance Computing (HPC)",
  "CAD/CAM Software",
  "Logistics/Warehouse Management Systems (WMS)",
  "Low-Code/No-Code Platforms",
  "Automation/RPA",
  "GIS/Geospatial Systems",
  "Other",
]);

// Schema Definition
export const CorePositionDetailsSchema = z.object({
  jobTitle: z
    .string()
    .min(1)
    .describe(
      "Definition: The official title of the position. Inference Guide: Extract directly from the advertisement headline or introduction. Normalize by removing extraneous information like (m/f/d) or location if embedded in the title. This field is REQUIRED.",
    ),

  seniorityLevel: SeniorityLevelEnum.nullable()
    .default(null)
    .describe(
      "Definition: The required experience level. Inference Guide: Infer from keywords ('Junior', 'Medior', 'Senior'). Map years of experience: (0-1yr -> Entry-Level/Graduate), (2-4yrs -> Mid-Level), (5+yrs -> Senior/Lead). 'Suitable for graduates' ('vhodné pro absolventy') implies Entry-Level. If multiple levels listed (e.g., Junior/Medior), select the highest (Medior).",
    ),

  // *** UPDATED WITH EXPANDED ENUM ***
  jobFunction: JobFunctionEnum.nullable()
    .default(null)
    .describe(
      "Definition: The primary functional area or department. Inference Guide: Analyze the title and responsibilities to determine the main purpose of the role. CRITICAL: NORMALIZE the inference to the closest matching Enum value from the extensive list. E.g., 'C# Developer' -> 'Software Engineering - Backend'; 'Security Engineer' -> 'Cybersecurity - Engineering/Architecture'. If no clear match, use 'Other'.",
    ),

  // *** UPDATED WITH EXPANDED ENUM ***
  industryVertical: IndustryVerticalEnum.nullable()
    .default(null)
    .describe(
      "Definition: The industry sector the company operates in. Inference Guide: Infer from the company description or the nature of the work. CRITICAL: NORMALIZE the inference to the closest matching Enum value from the extensive list. E.g., banking software -> 'Fintech/Payments' or 'Banking/Financial Services'; 'průmyslová automatizace' -> 'Industrial Automation/Robotics'. Integrators -> 'IT Services/Consulting/Integration'. If no clear match, use 'Other'.",
    ),

  // *** UPDATED WITH EXPANDED ENUM ***
  applicationDomain: ApplicationDomainEnum.nullable()
    .default(null)
    .describe(
      "Definition: The technical domain or platform the role focuses on. Inference Guide: Infer from the job duties and tech stack. CRITICAL: NORMALIZE the inference to the closest matching Enum value. E.g., React/Vue -> 'Web - Frontend (...)'; Azure/AWS infrastructure -> 'Cloud - Public (...)'; SAP/Dynamics -> 'ERP Systems (...)'. SIEM/EDR -> 'Security - SIEM/Monitoring (...)'. If no clear match, use 'Other'.",
    ),

  managementResponsibility: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if the role involves managing people. Inference Guide: Set to TRUE if the title includes 'Manager', 'Lead', or if responsibilities explicitly state 'vedení týmu' (team leadership) or managing direct reports. Default to FALSE if not mentioned.",
    ),

  suitableForGraduates: z
    .boolean()
    .default(false)
    .describe(
      "Definition: Indicates if the position is suitable for recent graduates. Inference Guide: Set to TRUE if the ad explicitly states 'vhodné pro absolventy' (suitable for graduates) or if the seniority level is inferred as 'Entry-Level/Graduate/Junior'.",
    ),
});
