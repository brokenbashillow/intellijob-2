import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { SkillCategory, Skill } from "@/types/skills";

const SKILL_CATEGORIES: SkillCategory[] = [
  // Technical skill categories
  { id: "tech-1", name: "Health and Medicine", type: "technical" },
  { id: "tech-2", name: "Business and Finance", type: "technical" },
  { id: "tech-3", name: "Education", type: "technical" },
  { id: "tech-4", name: "Technology and IT", type: "technical" },
  { id: "tech-5", name: "Engineering", type: "technical" },
  { id: "tech-6", name: "Architecture and Design", type: "technical" },
  { id: "tech-7", name: "Law and Political Science", type: "technical" },
  { id: "tech-8", name: "Maritime", type: "technical" },
  { id: "tech-9", name: "Arts and Communication", type: "technical" },
  { id: "tech-10", name: "Agriculture and Environmental Science", type: "technical" },
  { id: "tech-11", name: "Social Sciences and Humanities", type: "technical" },
  { id: "tech-12", name: "Sports and Recreation", type: "technical" },
  { id: "tech-13", name: "Aviation", type: "technical" },
  { id: "tech-14", name: "Hospitality and Tourism", type: "technical" },
  
  // Soft skill categories
  { id: "soft-1", name: "Communication", type: "soft" },
  { id: "soft-2", name: "Leadership", type: "soft" },
  { id: "soft-3", name: "Teamwork", type: "soft" },
  { id: "soft-4", name: "Problem Solving", type: "soft" },
  { id: "soft-5", name: "Adaptability", type: "soft" },
];

const SKILLS: Skill[] = [
  // Health and Medicine
  { id: "skill-101", name: "Clinical procedures", category_id: "tech-1" },
  { id: "skill-102", name: "Medical terminology", category_id: "tech-1" },
  { id: "skill-103", name: "Patient care and assessment", category_id: "tech-1" },
  { id: "skill-104", name: "Laboratory testing and analysis", category_id: "tech-1" },
  { id: "skill-105", name: "Pharmacology", category_id: "tech-1" },
  { id: "skill-106", name: "Diagnostic imaging", category_id: "tech-1" },
  { id: "skill-107", name: "Physical therapy techniques", category_id: "tech-1" },
  { id: "skill-108", name: "Medical coding and billing", category_id: "tech-1" },
  { id: "skill-109", name: "Nutrition planning", category_id: "tech-1" },
  { id: "skill-110", name: "Emergency response and first aid", category_id: "tech-1" },
  
  // Business and Finance
  { id: "skill-201", name: "Financial analysis and forecasting", category_id: "tech-2" },
  { id: "skill-202", name: "Budgeting and accounting", category_id: "tech-2" },
  { id: "skill-203", name: "Market research and analysis", category_id: "tech-2" },
  { id: "skill-204", name: "Business strategy development", category_id: "tech-2" },
  { id: "skill-205", name: "Financial reporting and auditing", category_id: "tech-2" },
  { id: "skill-206", name: "Investment management", category_id: "tech-2" },
  { id: "skill-207", name: "Project management", category_id: "tech-2" },
  { id: "skill-208", name: "Sales techniques", category_id: "tech-2" },
  { id: "skill-209", name: "Data analysis", category_id: "tech-2" },
  { id: "skill-210", name: "Customer relationship management", category_id: "tech-2" },
  
  // Education
  { id: "skill-301", name: "Curriculum development", category_id: "tech-3" },
  { id: "skill-302", name: "Lesson planning", category_id: "tech-3" },
  { id: "skill-303", name: "Classroom management", category_id: "tech-3" },
  { id: "skill-304", name: "Educational assessment", category_id: "tech-3" },
  { id: "skill-305", name: "Special education techniques", category_id: "tech-3" },
  { id: "skill-306", name: "Learning management systems", category_id: "tech-3" },
  { id: "skill-307", name: "Tutoring and mentoring", category_id: "tech-3" },
  { id: "skill-308", name: "Research and academic writing", category_id: "tech-3" },
  
  // Technology and IT
  { id: "skill-401", name: "Programming languages", category_id: "tech-4" },
  { id: "skill-402", name: "Web development", category_id: "tech-4" },
  { id: "skill-403", name: "Database management", category_id: "tech-4" },
  { id: "skill-404", name: "Cybersecurity practices", category_id: "tech-4" },
  { id: "skill-405", name: "Cloud computing", category_id: "tech-4" },
  { id: "skill-406", name: "Network configuration", category_id: "tech-4" },
  { id: "skill-407", name: "Software development", category_id: "tech-4" },
  { id: "skill-408", name: "Systems administration", category_id: "tech-4" },
  { id: "skill-409", name: "Machine learning", category_id: "tech-4" },
  { id: "skill-410", name: "Data visualization", category_id: "tech-4" },
  
  // Engineering
  { id: "skill-501", name: "Computer-aided design (CAD)", category_id: "tech-5" },
  { id: "skill-502", name: "Structural analysis", category_id: "tech-5" },
  { id: "skill-503", name: "Circuit design", category_id: "tech-5" },
  { id: "skill-504", name: "Mechanical systems analysis", category_id: "tech-5" },
  { id: "skill-505", name: "Thermodynamics", category_id: "tech-5" },
  { id: "skill-506", name: "Materials science", category_id: "tech-5" },
  { id: "skill-507", name: "Engineering project management", category_id: "tech-5" },
  { id: "skill-508", name: "Quality control", category_id: "tech-5" },
  { id: "skill-509", name: "Robotics and automation", category_id: "tech-5" },
  { id: "skill-510", name: "Environmental impact assessment", category_id: "tech-5" },
  
  // Architecture and Design
  { id: "skill-601", name: "Architectural drafting", category_id: "tech-6" },
  { id: "skill-602", name: "Building information modeling", category_id: "tech-6" },
  { id: "skill-603", name: "Architectural structural analysis", category_id: "tech-6" },
  { id: "skill-604", name: "Construction management", category_id: "tech-6" },
  { id: "skill-605", name: "Environmental design", category_id: "tech-6" },
  { id: "skill-606", name: "Urban planning", category_id: "tech-6" },
  { id: "skill-607", name: "3D modeling", category_id: "tech-6" },
  { id: "skill-608", name: "Design software", category_id: "tech-6" },
  { id: "skill-609", name: "Site analysis", category_id: "tech-6" },
  
  // Law and Political Science
  { id: "skill-701", name: "Legal research and analysis", category_id: "tech-7" },
  { id: "skill-702", name: "Contract drafting", category_id: "tech-7" },
  { id: "skill-703", name: "Case management", category_id: "tech-7" },
  { id: "skill-704", name: "Legal writing", category_id: "tech-7" },
  { id: "skill-705", name: "Constitutional law", category_id: "tech-7" },
  { id: "skill-706", name: "Public policy analysis", category_id: "tech-7" },
  { id: "skill-707", name: "Litigation procedures", category_id: "tech-7" },
  { id: "skill-708", name: "Legal documentation", category_id: "tech-7" },
  { id: "skill-709", name: "Client advocacy", category_id: "tech-7" },
  
  // Maritime
  { id: "skill-801", name: "Ship navigation", category_id: "tech-8" },
  { id: "skill-802", name: "Maritime safety protocols", category_id: "tech-8" },
  { id: "skill-803", name: "Vessel maintenance", category_id: "tech-8" },
  { id: "skill-804", name: "Cargo handling", category_id: "tech-8" },
  { id: "skill-805", name: "Marine engineering", category_id: "tech-8" },
  { id: "skill-806", name: "Naval architecture", category_id: "tech-8" },
  { id: "skill-807", name: "Emergency response at sea", category_id: "tech-8" },
  { id: "skill-808", name: "Maritime communication", category_id: "tech-8" },
  
  // Arts and Communication
  { id: "skill-901", name: "Graphic design", category_id: "tech-9" },
  { id: "skill-902", name: "Video editing", category_id: "tech-9" },
  { id: "skill-903", name: "Public speaking", category_id: "tech-9" },
  { id: "skill-904", name: "Writing and storytelling", category_id: "tech-9" },
  { id: "skill-905", name: "Audio production", category_id: "tech-9" },
  { id: "skill-906", name: "Photography", category_id: "tech-9" },
  { id: "skill-907", name: "Media analysis", category_id: "tech-9" },
  { id: "skill-908", name: "Social media management", category_id: "tech-9" },
  { id: "skill-909", name: "Branding and marketing", category_id: "tech-9" },
  
  // Agriculture and Environmental Science
  { id: "skill-1001", name: "Crop and soil management", category_id: "tech-10" },
  { id: "skill-1002", name: "Agricultural machinery operation", category_id: "tech-10" },
  { id: "skill-1003", name: "Pest control and management", category_id: "tech-10" },
  { id: "skill-1004", name: "Environmental impact analysis", category_id: "tech-10" },
  { id: "skill-1005", name: "Sustainable farming", category_id: "tech-10" },
  { id: "skill-1006", name: "Irrigation system design", category_id: "tech-10" },
  { id: "skill-1007", name: "Waste management", category_id: "tech-10" },
  
  // Social Sciences and Humanities
  { id: "skill-1101", name: "Research methodology", category_id: "tech-11" },
  { id: "skill-1102", name: "Data analysis (SPSS)", category_id: "tech-11" },
  { id: "skill-1103", name: "Cultural analysis", category_id: "tech-11" },
  { id: "skill-1104", name: "Statistical analysis", category_id: "tech-11" },
  { id: "skill-1105", name: "Survey design", category_id: "tech-11" },
  { id: "skill-1106", name: "Behavioral analysis", category_id: "tech-11" },
  { id: "skill-1107", name: "Conflict resolution", category_id: "tech-11" },
  
  // Sports and Recreation
  { id: "skill-1201", name: "Athletic training", category_id: "tech-12" },
  { id: "skill-1202", name: "Sports injury management", category_id: "tech-12" },
  { id: "skill-1203", name: "Exercise programming", category_id: "tech-12" },
  { id: "skill-1204", name: "Team management", category_id: "tech-12" },
  { id: "skill-1205", name: "Sports psychology", category_id: "tech-12" },
  { id: "skill-1206", name: "Event coordination", category_id: "tech-12" },
  { id: "skill-1207", name: "Fitness assessment", category_id: "tech-12" },
  
  // Aviation
  { id: "skill-1301", name: "Flight navigation", category_id: "tech-13" },
  { id: "skill-1302", name: "Aircraft maintenance", category_id: "tech-13" },
  { id: "skill-1303", name: "Aviation safety protocols", category_id: "tech-13" },
  { id: "skill-1304", name: "Air traffic communication", category_id: "tech-13" },
  { id: "skill-1305", name: "Aviation meteorology", category_id: "tech-13" },
  { id: "skill-1306", name: "Flight simulation training", category_id: "tech-13" },
  
  // Hospitality and Tourism
  { id: "skill-1401", name: "Event planning", category_id: "tech-14" },
  { id: "skill-1402", name: "Customer service", category_id: "tech-14" },
  { id: "skill-1403", name: "Hospitality management software", category_id: "tech-14" },
  { id: "skill-1404", name: "Tourism marketing", category_id: "tech-14" },
  { id: "skill-1405", name: "Hotel and restaurant operations", category_id: "tech-14" },
  { id: "skill-1406", name: "Travel coordination", category_id: "tech-14" },
  
  // Soft Skills - Communication
  { id: "soft-skill-101", name: "Verbal communication", category_id: "soft-1" },
  { id: "soft-skill-102", name: "Written communication", category_id: "soft-1" },
  { id: "soft-skill-103", name: "Active listening", category_id: "soft-1" },
  { id: "soft-skill-104", name: "Presentation skills", category_id: "soft-1" },
  { id: "soft-skill-105", name: "Negotiation", category_id: "soft-1" },
  
  // Soft Skills - Leadership
  { id: "soft-skill-201", name: "Decision making", category_id: "soft-2" },
  { id: "soft-skill-202", name: "Delegation", category_id: "soft-2" },
  { id: "soft-skill-203", name: "Motivation", category_id: "soft-2" },
  { id: "soft-skill-204", name: "Strategic thinking", category_id: "soft-2" },
  { id: "soft-skill-205", name: "Mentoring", category_id: "soft-2" },
  
  // Soft Skills - Teamwork
  { id: "soft-skill-301", name: "Collaboration", category_id: "soft-3" },
  { id: "soft-skill-302", name: "Conflict resolution", category_id: "soft-3" },
  { id: "soft-skill-303", name: "Relationship building", category_id: "soft-3" },
  { id: "soft-skill-304", name: "Empathy", category_id: "soft-3" },
  { id: "soft-skill-305", name: "Cultural awareness", category_id: "soft-3" },
  
  // Soft Skills - Problem Solving
  { id: "soft-skill-401", name: "Critical thinking", category_id: "soft-4" },
  { id: "soft-skill-402", name: "Analytical skills", category_id: "soft-4" },
  { id: "soft-skill-403", name: "Creativity", category_id: "soft-4" },
  { id: "soft-skill-404", name: "Research", category_id: "soft-4" },
  { id: "soft-skill-405", name: "Troubleshooting", category_id: "soft-4" },
  
  // Soft Skills - Adaptability
  { id: "soft-skill-501", name: "Flexibility", category_id: "soft-5" },
  { id: "soft-skill-502", name: "Learning agility", category_id: "soft-5" },
  { id: "soft-skill-503", name: "Resilience", category_id: "soft-5" },
  { id: "soft-skill-504", name: "Time management", category_id: "soft-5" },
  { id: "soft-skill-505", name: "Stress management", category_id: "soft-5" },
];

export const useSkillsData = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<SkillCategory[]>(SKILL_CATEGORIES);
  const [skills, setSkills] = useState<Skill[]>(SKILLS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        setLoading(true);
        
        // We're now using the hardcoded data for reliability
        // but we'll still try to fetch from the database in case there are updates
        
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('skill_categories')
          .select('*');

        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*');

        // If we successfully got data from the database, use it
        // Otherwise, we'll use our hardcoded data
        if (!categoriesError && categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
        
        if (!skillsError && skillsData && skillsData.length > 0) {
          setSkills(skillsData);
        }
        
        console.log(`Loaded ${categories.length} categories and ${skills.length} skills`);
      } catch (error) {
        console.error('Error fetching skills data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Using fallback skills data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSkillsData();
  }, [toast]);

  return { categories, skills, loading };
};

