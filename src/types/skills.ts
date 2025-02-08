
export interface Skill {
  id: string;
  name: string;
  category_id: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  type: 'technical' | 'soft';
}
