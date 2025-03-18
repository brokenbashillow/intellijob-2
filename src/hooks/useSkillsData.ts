import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SkillCategory, Skill } from "@/types/skills";

// Define our custom skills data
const customSkillCategories: SkillCategory[] = [
  // Technical skill categories
  { id: "health-medicine", name: "Health and Medicine", type: "technical" },
  { id: "business-finance", name: "Business and Finance", type: "technical" },
  { id: "education", name: "Education", type: "technical" },
  { id: "technology-it", name: "Technology and IT", type: "technical" },
  { id: "engineering", name: "Engineering", type: "technical" },
  { id: "architecture-design", name: "Architecture and Design", type: "technical" },
  { id: "law-political-science", name: "Law and Political Science", type: "technical" },
  { id: "maritime", name: "Maritime", type: "technical" },
  { id: "arts-communication", name: "Arts and Communication", type: "technical" },
  { id: "agriculture-environment", name: "Agriculture and Environmental Science", type: "technical" },
  { id: "social-sciences", name: "Social Sciences and Humanities", type: "technical" },
  { id: "sports-recreation", name: "Sports and Recreation", type: "technical" },
  { id: "aviation", name: "Aviation", type: "technical" },
  { id: "hospitality-tourism", name: "Hospitality and Tourism", type: "technical" },
  
  // Soft skill categories - Updated with the user's new categories
  { id: "communication", name: "Communication", type: "soft" },
  { id: "teamwork-collaboration", name: "Teamwork and Collaboration", type: "soft" },
  { id: "leadership", name: "Leadership", type: "soft" },
  { id: "problem-solving", name: "Problem-Solving and Critical Thinking", type: "soft" },
  { id: "adaptability", name: "Adaptability and Flexibility", type: "soft" },
  { id: "emotional-intelligence", name: "Emotional Intelligence and Interpersonal Skills", type: "soft" },
  { id: "creativity", name: "Creativity and Innovation", type: "soft" },
  { id: "attention-to-detail", name: "Attention to Detail", type: "soft" },
  { id: "time-management", name: "Time Management and Organization", type: "soft" },
  { id: "professionalism", name: "Professionalism and Work Ethic", type: "soft" },
];

const customSkills: Skill[] = [
  // Technical Skills - keeping the existing ones
  // Health and Medicine
  { id: "clinical-procedures", name: "Clinical procedures (e.g., venipuncture, catheterization)", category_id: "health-medicine" },
  { id: "medical-terminology", name: "Medical terminology", category_id: "health-medicine" },
  { id: "patient-care", name: "Patient care and assessment", category_id: "health-medicine" },
  { id: "lab-testing", name: "Laboratory testing and analysis", category_id: "health-medicine" },
  { id: "pharmacology", name: "Pharmacology and drug administration", category_id: "health-medicine" },
  { id: "diagnostic-imaging", name: "Diagnostic imaging (e.g., X-ray, ultrasound)", category_id: "health-medicine" },
  { id: "physical-therapy", name: "Physical therapy techniques", category_id: "health-medicine" },
  { id: "medical-coding", name: "Medical coding and billing", category_id: "health-medicine" },
  { id: "nutrition-planning", name: "Nutrition planning", category_id: "health-medicine" },
  { id: "emergency-response", name: "Emergency response and first aid", category_id: "health-medicine" },

  // Business and Finance
  { id: "financial-analysis", name: "Financial analysis and forecasting", category_id: "business-finance" },
  { id: "budgeting", name: "Budgeting and accounting principles", category_id: "business-finance" },
  { id: "market-research", name: "Market research and analysis", category_id: "business-finance" },
  { id: "business-strategy", name: "Business strategy development", category_id: "business-finance" },
  { id: "financial-reporting", name: "Financial reporting and auditing", category_id: "business-finance" },
  { id: "investment-management", name: "Investment management", category_id: "business-finance" },
  { id: "project-management-biz", name: "Project management", category_id: "business-finance" },
  { id: "sales-techniques", name: "Sales techniques", category_id: "business-finance" },
  { id: "data-analysis-biz", name: "Data analysis (e.g., Excel, Tableau)", category_id: "business-finance" },
  { id: "crm", name: "Customer relationship management (CRM)", category_id: "business-finance" },

  // Education
  { id: "curriculum-development", name: "Curriculum development", category_id: "education" },
  { id: "lesson-planning", name: "Lesson planning", category_id: "education" },
  { id: "classroom-management", name: "Classroom management", category_id: "education" },
  { id: "educational-assessment", name: "Educational assessment and evaluation", category_id: "education" },
  { id: "special-education", name: "Special education techniques", category_id: "education" },
  { id: "lms", name: "Learning management systems (LMS)", category_id: "education" },
  { id: "tutoring", name: "Tutoring and mentoring", category_id: "education" },
  { id: "academic-writing", name: "Research and academic writing", category_id: "education" },

  // Technology and IT
  { id: "programming", name: "Programming languages (e.g., Python, Java, C++)", category_id: "technology-it" },
  { id: "web-development", name: "Web development (HTML, CSS, JavaScript)", category_id: "technology-it" },
  { id: "database-management", name: "Database management (SQL, MongoDB)", category_id: "technology-it" },
  { id: "cybersecurity", name: "Cybersecurity practices", category_id: "technology-it" },
  { id: "cloud-computing", name: "Cloud computing (e.g., AWS, Azure)", category_id: "technology-it" },
  { id: "network-config", name: "Network configuration and troubleshooting", category_id: "technology-it" },
  { id: "software-development", name: "Software development and debugging", category_id: "technology-it" },
  { id: "systems-admin", name: "Systems administration", category_id: "technology-it" },
  { id: "machine-learning", name: "Machine learning and artificial intelligence", category_id: "technology-it" },
  { id: "data-visualization", name: "Data analysis and visualization", category_id: "technology-it" },

  // Engineering
  { id: "cad", name: "Computer-aided design (CAD)", category_id: "engineering" },
  { id: "structural-analysis", name: "Structural analysis", category_id: "engineering" },
  { id: "circuit-design", name: "Circuit design and troubleshooting", category_id: "engineering" },
  { id: "mechanical-systems", name: "Mechanical systems analysis", category_id: "engineering" },
  { id: "thermodynamics", name: "Thermodynamics and fluid mechanics", category_id: "engineering" },
  { id: "materials-science", name: "Materials science", category_id: "engineering" },
  { id: "project-management-eng", name: "Project management", category_id: "engineering" },
  { id: "quality-control", name: "Quality control and testing", category_id: "engineering" },
  { id: "robotics", name: "Robotics and automation", category_id: "engineering" },
  { id: "environmental-impact", name: "Environmental impact assessment", category_id: "engineering" },

  // Architecture and Design
  { id: "architectural-drafting", name: "Architectural drafting and drawing", category_id: "architecture-design" },
  { id: "bim", name: "Building information modeling (BIM)", category_id: "architecture-design" },
  { id: "struct-analysis-arch", name: "Structural analysis", category_id: "architecture-design" },
  { id: "construction-management", name: "Construction management", category_id: "architecture-design" },
  { id: "environmental-design", name: "Environmental design principles", category_id: "architecture-design" },
  { id: "urban-planning", name: "Urban planning", category_id: "architecture-design" },
  { id: "3d-modeling", name: "3D modeling (e.g., AutoCAD, SketchUp)", category_id: "architecture-design" },
  { id: "design-software", name: "Design software (e.g., Adobe Creative Suite)", category_id: "architecture-design" },
  { id: "site-analysis", name: "Site analysis", category_id: "architecture-design" },

  // Law and Political Science
  { id: "legal-research", name: "Legal research and analysis", category_id: "law-political-science" },
  { id: "contract-drafting", name: "Contract drafting", category_id: "law-political-science" },
  { id: "case-management", name: "Case management", category_id: "law-political-science" },
  { id: "legal-writing", name: "Legal writing", category_id: "law-political-science" },
  { id: "constitutional-law", name: "Understanding of constitutional law", category_id: "law-political-science" },
  { id: "public-policy", name: "Public policy analysis", category_id: "law-political-science" },
  { id: "litigation", name: "Litigation procedures", category_id: "law-political-science" },
  { id: "legal-documentation", name: "Legal documentation and filing", category_id: "law-political-science" },
  { id: "client-advocacy", name: "Client advocacy", category_id: "law-political-science" },

  // Maritime
  { id: "ship-navigation", name: "Ship navigation and operation", category_id: "maritime" },
  { id: "maritime-safety", name: "Maritime safety protocols", category_id: "maritime" },
  { id: "vessel-maintenance", name: "Vessel maintenance and repair", category_id: "maritime" },
  { id: "cargo-handling", name: "Cargo handling and logistics", category_id: "maritime" },
  { id: "marine-engineering", name: "Marine engineering systems", category_id: "maritime" },
  { id: "naval-architecture", name: "Naval architecture", category_id: "maritime" },
  { id: "maritime-emergency", name: "Emergency response at sea", category_id: "maritime" },
  { id: "maritime-communication", name: "Communication with maritime authorities", category_id: "maritime" },

  // Arts and Communication
  { id: "graphic-design", name: "Graphic design (e.g., Photoshop, Illustrator)", category_id: "arts-communication" },
  { id: "video-editing", name: "Video editing (e.g., Premiere Pro, After Effects)", category_id: "arts-communication" },
  { id: "public-speaking", name: "Public speaking", category_id: "arts-communication" },
  { id: "writing-storytelling", name: "Writing and storytelling", category_id: "arts-communication" },
  { id: "audio-production", name: "Audio production", category_id: "arts-communication" },
  { id: "photography", name: "Photography and videography", category_id: "arts-communication" },
  { id: "media-analysis", name: "Media analysis", category_id: "arts-communication" },
  { id: "social-media", name: "Social media management", category_id: "arts-communication" },
  { id: "branding", name: "Branding and marketing", category_id: "arts-communication" },

  // Agriculture and Environmental Science
  { id: "crop-management", name: "Crop and soil management", category_id: "agriculture-environment" },
  { id: "ag-machinery", name: "Agricultural machinery operation", category_id: "agriculture-environment" },
  { id: "pest-control", name: "Pest control and management", category_id: "agriculture-environment" },
  { id: "env-impact-analysis", name: "Environmental impact analysis", category_id: "agriculture-environment" },
  { id: "sustainable-farming", name: "Sustainable farming techniques", category_id: "agriculture-environment" },
  { id: "irrigation", name: "Irrigation system design", category_id: "agriculture-environment" },
  { id: "waste-management", name: "Waste management", category_id: "agriculture-environment" },

  // Social Sciences and Humanities
  { id: "research-methodology", name: "Research methodology", category_id: "social-sciences" },
  { id: "data-analysis-social", name: "Data analysis (e.g., SPSS)", category_id: "social-sciences" },
  { id: "cultural-analysis", name: "Cultural analysis", category_id: "social-sciences" },
  { id: "statistical-analysis", name: "Statistical analysis", category_id: "social-sciences" },
  { id: "survey-design", name: "Survey design", category_id: "social-sciences" },
  { id: "behavioral-analysis", name: "Behavioral analysis", category_id: "social-sciences" },
  { id: "conflict-resolution", name: "Conflict resolution", category_id: "social-sciences" },

  // Sports and Recreation
  { id: "athletic-training", name: "Athletic training techniques", category_id: "sports-recreation" },
  { id: "sports-injury", name: "Sports injury management", category_id: "sports-recreation" },
  { id: "exercise-programming", name: "Exercise programming", category_id: "sports-recreation" },
  { id: "team-management", name: "Team management", category_id: "sports-recreation" },
  { id: "sports-psychology", name: "Sports psychology", category_id: "sports-recreation" },
  { id: "event-coordination", name: "Event coordination", category_id: "sports-recreation" },
  { id: "fitness-assessment", name: "Fitness assessment", category_id: "sports-recreation" },

  // Aviation
  { id: "flight-navigation", name: "Flight navigation and control", category_id: "aviation" },
  { id: "aircraft-maintenance", name: "Aircraft maintenance", category_id: "aviation" },
  { id: "aviation-safety", name: "Aviation safety protocols", category_id: "aviation" },
  { id: "air-traffic", name: "Air traffic communication", category_id: "aviation" },
  { id: "aviation-meteorology", name: "Meteorology for aviation", category_id: "aviation" },
  { id: "flight-simulation", name: "Flight simulation training", category_id: "aviation" },

  // Hospitality and Tourism
  { id: "event-planning", name: "Event planning", category_id: "hospitality-tourism" },
  { id: "customer-service", name: "Customer service", category_id: "hospitality-tourism" },
  { id: "hospitality-software", name: "Hospitality management software", category_id: "hospitality-tourism" },
  { id: "tourism-marketing", name: "Tourism marketing strategies", category_id: "hospitality-tourism" },
  { id: "hotel-operations", name: "Hotel and restaurant operations", category_id: "hospitality-tourism" },
  { id: "travel-coordination", name: "Travel coordination", category_id: "hospitality-tourism" },
  
  // Soft Skills - Updated with the user's new list
  // Communication
  { id: "patient-communication", name: "Communication with patients and families", category_id: "communication" },
  { id: "active-listening", name: "Active listening", category_id: "communication" },
  { id: "public-speaking", name: "Public speaking", category_id: "communication" },
  { id: "non-technical-communication", name: "Communication with non-technical stakeholders", category_id: "communication" },
  { id: "client-communication", name: "Client communication", category_id: "communication" },
  { id: "crew-communication", name: "Communication with crew and authorities", category_id: "communication" },
  { id: "storytelling", name: "Storytelling", category_id: "communication" },
  { id: "cross-cultural-communication", name: "Cross-cultural communication", category_id: "communication" },
  { id: "atc-communication", name: "Communication with air traffic control", category_id: "communication" },
  { id: "diverse-clients-communication", name: "Communication with diverse clients", category_id: "communication" },
  { id: "professional-networking-comm", name: "Professional networking", category_id: "communication" },
  
  // Teamwork and Collaboration
  { id: "high-stress-teamwork", name: "Teamwork in high-stress environments", category_id: "teamwork-collaboration" },
  { id: "cross-functional", name: "Cross-functional collaboration", category_id: "teamwork-collaboration" },
  { id: "team-projects", name: "Collaboration in team projects", category_id: "teamwork-collaboration" },
  { id: "engineer-client-collab", name: "Collaboration with engineers and clients", category_id: "teamwork-collaboration" },
  { id: "confined-teamwork", name: "Teamwork in confined spaces", category_id: "teamwork-collaboration" },
  { id: "creative-collaboration", name: "Collaboration with creative teams", category_id: "teamwork-collaboration" },
  { id: "community-collaboration", name: "Collaboration with local communities", category_id: "teamwork-collaboration" },
  { id: "research-collaboration", name: "Collaboration in research projects", category_id: "teamwork-collaboration" },
  { id: "sports-teamwork", name: "Teamwork with teammates and coaches", category_id: "teamwork-collaboration" },
  { id: "flight-crew-collaboration", name: "Collaboration with flight crew", category_id: "teamwork-collaboration" },
  
  // Leadership
  { id: "team-management", name: "Leadership and team management", category_id: "leadership" },
  { id: "professional-integrity-lead", name: "Professional integrity", category_id: "leadership" },
  { id: "strategic-thinking", name: "Strategic thinking", category_id: "leadership" },
  { id: "sustainability-leadership", name: "Leading in sustainability", category_id: "leadership" },
  { id: "motivation", name: "Motivation and inspiration", category_id: "leadership" },
  { id: "crisis-management", name: "Crisis management", category_id: "leadership" },
  { id: "high-stress-leadership", name: "Leadership in high-stress environments", category_id: "leadership" },
  { id: "situational-awareness", name: "Situational awareness", category_id: "leadership" },
  { id: "inspiring-creative-teams", name: "Inspiring creative teams", category_id: "leadership" },
  
  // Problem-Solving and Critical Thinking
  { id: "critical-thinking", name: "Critical thinking", category_id: "problem-solving" },
  { id: "troubleshooting-skill", name: "Troubleshooting", category_id: "problem-solving" },
  { id: "analytical-thinking", name: "Analytical thinking", category_id: "problem-solving" },
  { id: "pressure-decision-making", name: "Decision-making under pressure", category_id: "problem-solving" },
  { id: "technical-problem-solving", name: "Problem-solving in technical settings", category_id: "problem-solving" },
  { id: "creative-problem-solving", name: "Creative problem-solving", category_id: "problem-solving" },
  { id: "ethical-decision-making-ps", name: "Ethical decision-making", category_id: "problem-solving" },
  { id: "conflict-resolution-ps", name: "Conflict resolution", category_id: "problem-solving" },
  { id: "research-analytical", name: "Research and analytical thinking", category_id: "problem-solving" },
  
  // Adaptability and Flexibility
  { id: "tech-adaptability", name: "Adaptability to new technologies", category_id: "adaptability" },
  { id: "design-adaptability", name: "Adaptability to design changes", category_id: "adaptability" },
  { id: "environmental-adaptability", name: "Adaptability to environmental changes", category_id: "adaptability" },
  { id: "high-stress-flexibility", name: "Flexibility in high-stress environments", category_id: "adaptability" },
  { id: "cultural-adaptability", name: "Adjusting to different cultural settings", category_id: "adaptability" },
  { id: "industry-adaptability", name: "Adaptability to industry trends", category_id: "adaptability" },
  
  // Emotional Intelligence and Interpersonal Skills
  { id: "empathy", name: "Empathy and compassion", category_id: "emotional-intelligence" },
  { id: "emotional-resilience", name: "Emotional resilience", category_id: "emotional-intelligence" },
  { id: "professional-integrity-ei", name: "Professional integrity", category_id: "emotional-intelligence" },
  { id: "stress-management", name: "Stress management", category_id: "emotional-intelligence" },
  { id: "patience", name: "Patience", category_id: "emotional-intelligence" },
  { id: "motivational-skills", name: "Motivational skills", category_id: "emotional-intelligence" },
  { id: "cultural-sensitivity", name: "Cultural sensitivity", category_id: "emotional-intelligence" },
  { id: "conflict-resolution-ei", name: "Conflict resolution", category_id: "emotional-intelligence" },
  { id: "persuasion-negotiation", name: "Persuasion and negotiation", category_id: "emotional-intelligence" },
  
  // Creativity and Innovation
  { id: "creativity-innovation", name: "Creativity and innovation", category_id: "creativity" },
  { id: "storytelling-creativity", name: "Storytelling", category_id: "creativity" },
  { id: "aesthetic-sense", name: "Aesthetic sense", category_id: "creativity" },
  { id: "out-of-box-thinking", name: "Out-of-the-box thinking", category_id: "creativity" },
  { id: "design-flexibility", name: "Design flexibility", category_id: "creativity" },
  { id: "creative-problem-solving-cr", name: "Creative problem-solving", category_id: "creativity" },
  
  // Attention to Detail
  { id: "technical-detail", name: "Attention to detail in technical tasks", category_id: "attention-to-detail" },
  { id: "financial-accuracy", name: "Financial analysis accuracy", category_id: "attention-to-detail" },
  { id: "patient-care-precision", name: "Patient care precision", category_id: "attention-to-detail" },
  { id: "architectural-precision", name: "Architectural and design precision", category_id: "attention-to-detail" },
  { id: "legal-documentation", name: "Legal documentation review", category_id: "attention-to-detail" },
  { id: "aviation-precision", name: "Precision in aviation control", category_id: "attention-to-detail" },
  
  // Time Management and Organization
  { id: "professional-time-management", name: "Time management in professional settings", category_id: "time-management" },
  { id: "planning-scheduling", name: "Planning and scheduling", category_id: "time-management" },
  { id: "task-prioritization", name: "Task prioritization", category_id: "time-management" },
  { id: "deadline-pressure", name: "Meeting deadlines under pressure", category_id: "time-management" },
  { id: "complex-logistics", name: "Handling complex logistics", category_id: "time-management" },
  
  // Professionalism and Work Ethic
  { id: "professional-demeanor", name: "Professional demeanor", category_id: "professionalism" },
  { id: "ethical-decision-making-prof", name: "Ethical decision-making", category_id: "professionalism" },
  { id: "accountability", name: "Accountability and reliability", category_id: "professionalism" },
  { id: "industry-standards", name: "Upholding industry standards", category_id: "professionalism" },
  { id: "professional-networking", name: "Professional networking and relationship building", category_id: "professionalism" },
];

export const useSkillsData = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        setLoading(true);
        
        // Use custom data directly instead of fetching from Supabase
        setCategories(customSkillCategories);
        setSkills(customSkills);
        
      } catch (error) {
        console.error('Error with skills data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load skills data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSkillsData();
  }, [toast]);

  return { categories, skills, loading };
};

