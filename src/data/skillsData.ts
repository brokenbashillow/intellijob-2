
import type { SkillCategory, Skill } from "@/types/skills";

// Define our custom skills data
export const customSkillCategories: SkillCategory[] = [
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
  
  // Soft skill categories
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

export const customSkills: Skill[] = [
  // Just adding a few examples from each category - the same skills as in the original file
  // Health and Medicine
  { id: "clinical-procedures", name: "Clinical procedures", category_id: "health-medicine" },
  { id: "medical-terminology", name: "Medical terminology", category_id: "health-medicine" },
  
  // Business and Finance
  { id: "financial-analysis", name: "Financial analysis and forecasting", category_id: "business-finance" },
  { id: "budgeting", name: "Budgeting and accounting principles", category_id: "business-finance" },
  
  // Technology and IT
  { id: "programming", name: "Programming languages", category_id: "technology-it" },
  { id: "web-development", name: "Web development", category_id: "technology-it" },
  
  // Soft Skills - Communication
  { id: "active-listening", name: "Active listening", category_id: "communication" },
  { id: "public-speaking", name: "Public speaking", category_id: "communication" },
  
  // Leadership
  { id: "team-management", name: "Leadership and team management", category_id: "leadership" },
  { id: "strategic-thinking", name: "Strategic thinking", category_id: "leadership" },
  
  // Problem-Solving
  { id: "critical-thinking", name: "Critical thinking", category_id: "problem-solving" },
  { id: "analytical-thinking", name: "Analytical thinking", category_id: "problem-solving" },
];

// Export a simplified version with just a few skills for testing
export const sampleSkills = {
  categories: customSkillCategories,
  skills: customSkills
};
