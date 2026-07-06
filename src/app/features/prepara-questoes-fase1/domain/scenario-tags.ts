import { Tag } from '../../flashcard/domain/value-objects/tag.value-object';

export const SCENARIO_TAGS = [
  'Scenario_1::Customer_Support_Agent',
  'Scenario_2::Code_Generation_Claude_Code',
  'Scenario_3::Multi_Agent_Research',
  'Scenario_4::Developer_Productivity',
  'Scenario_5::Claude_Code_CI_CD',
  'Scenario_6::Structured_Data_Extraction',
  'ForaDoCenario',
] as const;

export type ScenarioTag = (typeof SCENARIO_TAGS)[number];

export const DOMAIN_TAGS = [
  'Domain_1::Agentic_Architecture_Orchestration',
  'Domain_2::Tool_Design_MCP_Integration',
  'Domain_3::Claude_Code_Configuration_Workflows',
  'Domain_4::Prompt_Engineering_Structured_Output',
  'Domain_5::Context_Management_Reliability',
  'ForaDosDominios',
] as const;

export type DomainTag = (typeof DOMAIN_TAGS)[number];

export function isScenarioTag(name: string): boolean {
  return name.startsWith('Scenario_') || name === 'ForaDoCenario';
}

export function isDomainTag(name: string): boolean {
  return name.startsWith('Domain_') || name === 'ForaDosDominios';
}

export function hasScenarioTag(tags: Tag[]): boolean {
  return tags.some((tag) => isScenarioTag(tag.name));
}

/**
 * Devolve um novo array de tags com exatamente uma tag de cenário: remove a
 * anterior (se houver) e adiciona a nova ao final, preservando as demais tags.
 */
export function applyScenarioTag(tags: Tag[], cenario: string): Tag[] {
  return [...tags.filter((tag) => !isScenarioTag(tag.name)), new Tag(cenario)];
}

/**
 * Aplica a classificação completa: substitui as tags de cenário e de domínio
 * anteriores pelas novas, preservando as demais tags (ex.: resíduos do seed).
 * Caso a lista de domínios venha vazia, mapeia automaticamente para ForaDosDominios.
 */
export function applyClassificationTags(tags: Tag[], cenario: string, dominios: string[]): Tag[] {
  const kept = tags.filter((tag) => !isScenarioTag(tag.name) && !isDomainTag(tag.name));
  let filteredDominios = (dominios || []).filter((d) => d && d.trim().length > 0);
  if (filteredDominios.length === 0) {
    filteredDominios = ['ForaDosDominios'];
  }
  return [...kept, ...filteredDominios.map((dominio) => new Tag(dominio)), new Tag(cenario)];
}
