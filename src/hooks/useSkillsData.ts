
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SkillCategory, Skill } from "@/types/skills";

// Define our custom skills data
const customSkillCategories: SkillCategory[] = [
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
];

const customSkills: Skill[] = [
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
        
        // Try to fetch from Supabase first
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('skill_categories')
          .select('*');

        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*');

        // If there are errors or no data, use our custom data
        if (categoriesError || skillsError || !categoriesData?.length || !skillsData?.length) {
          console.log("Using custom skills data instead of database data");
          setCategories(customSkillCategories);
          setSkills(customSkills);
        } else {
          // If Supabase data exists, use that instead
          setCategories(categoriesData);
          setSkills(skillsData);
        }
      } catch (error) {
        console.error('Error fetching skills data:', error);
        // Fallback to custom data on error
        setCategories(customSkillCategories);
        setSkills(customSkills);
        
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load skills data from database. Using backup data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSkillsData();
  }, [toast]);

  return { categories, skills, loading };
};
