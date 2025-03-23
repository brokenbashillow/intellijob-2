
import { cn } from "@/lib/utils";

type Industry = "technology" | "agriculture" | "finance" | "healthcare" | "education" | "manufacturing" | "retail" | "other";

export const getIndustryColor = (industry?: string): string => {
  if (!industry) return "bg-muted"; // Default color

  const normalizedIndustry = industry.toLowerCase().trim();
  
  // Check if contains keywords rather than exact match for better coverage
  if (normalizedIndustry.includes("tech") || normalizedIndustry.includes("software") || normalizedIndustry.includes("it")) {
    return "bg-blue-100 text-blue-800"; // Technology
  } else if (normalizedIndustry.includes("agri") || normalizedIndustry.includes("farm") || normalizedIndustry.includes("food")) {
    return "bg-green-100 text-green-800"; // Agriculture
  } else if (normalizedIndustry.includes("financ") || normalizedIndustry.includes("bank") || normalizedIndustry.includes("invest")) {
    return "bg-yellow-100 text-yellow-800"; // Finance
  } else if (normalizedIndustry.includes("health") || normalizedIndustry.includes("medical") || normalizedIndustry.includes("care")) {
    return "bg-red-100 text-red-800"; // Healthcare
  } else if (normalizedIndustry.includes("edu") || normalizedIndustry.includes("school") || normalizedIndustry.includes("college")) {
    return "bg-purple-100 text-purple-800"; // Education
  } else if (normalizedIndustry.includes("manufact") || normalizedIndustry.includes("indust")) {
    return "bg-gray-100 text-gray-800"; // Manufacturing
  } else if (normalizedIndustry.includes("retail") || normalizedIndustry.includes("shop") || normalizedIndustry.includes("store")) {
    return "bg-orange-100 text-orange-800"; // Retail
  }
  
  return "bg-slate-100 text-slate-800"; // Default for other industries
};

// Wrapper function for use with Avatar component
export const getAvatarColors = (industry?: string): string => {
  return cn(
    getIndustryColor(industry),
    "flex h-full w-full items-center justify-center rounded-full"
  );
};
