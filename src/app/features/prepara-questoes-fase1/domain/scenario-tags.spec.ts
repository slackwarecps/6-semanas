import { Tag } from '../../flashcard/domain/value-objects/tag.value-object';
import {
  applyClassificationTags,
  applyScenarioTag,
  hasScenarioTag,
  isScenarioTag,
} from './scenario-tags';

describe('scenario-tags', () => {
  describe('isScenarioTag', () => {
    it('reconhece tags de cenário e ForaDoCenario', () => {
      expect(isScenarioTag('Scenario_1::Customer_Support_Agent')).toBe(true);
      expect(isScenarioTag('ForaDoCenario')).toBe(true);
      expect(isScenarioTag('Domain_1::Agentic_Architecture_Orchestration')).toBe(false);
      expect(isScenarioTag('Tags:')).toBe(false);
    });
  });

  describe('hasScenarioTag', () => {
    it('detecta presença de tag de cenário no array', () => {
      const semCenario = [new Tag('Domain_1::Agentic_Architecture_Orchestration')];
      const comCenario = [...semCenario, new Tag('Scenario_3::Multi_Agent_Research')];

      expect(hasScenarioTag(semCenario)).toBe(false);
      expect(hasScenarioTag(comCenario)).toBe(true);
    });
  });

  describe('applyScenarioTag', () => {
    it('adiciona a tag de cenário preservando as demais tags', () => {
      const tags = [new Tag('Tags:'), new Tag('Domain_2::Tool_Design_MCP_Integration')];

      const result = applyScenarioTag(tags, 'Scenario_5::Claude_Code_CI_CD');

      expect(result.map((t) => t.name)).toEqual([
        'Tags:',
        'Domain_2::Tool_Design_MCP_Integration',
        'Scenario_5::Claude_Code_CI_CD',
      ]);
    });

    it('substitui tag de cenário anterior, mantendo exatamente uma (idempotência)', () => {
      const tags = [
        new Tag('Domain_4::Prompt_Engineering_Structured_Output'),
        new Tag('ForaDoCenario'),
      ];

      const result = applyScenarioTag(tags, 'Scenario_6::Structured_Data_Extraction');

      expect(result.filter((t) => isScenarioTag(t.name)).length).toBe(1);
      expect(result.map((t) => t.name)).toEqual([
        'Domain_4::Prompt_Engineering_Structured_Output',
        'Scenario_6::Structured_Data_Extraction',
      ]);
    });

    it('não modifica o array original', () => {
      const tags = [new Tag('Domain_1::Agentic_Architecture_Orchestration')];

      applyScenarioTag(tags, 'ForaDoCenario');

      expect(tags.length).toBe(1);
    });
  });

  describe('applyClassificationTags', () => {
    it('substitui cenário e domínios antigos, preservando as demais tags', () => {
      const tags = [
        new Tag('Tags:'),
        new Tag('Domain_1::Agentic_Architecture_Orchestration'),
        new Tag('Domain_5::Context_Management_Reliability'),
        new Tag('ForaDoCenario'),
      ];

      const result = applyClassificationTags(tags, 'Scenario_5::Claude_Code_CI_CD', [
        'Domain_3::Claude_Code_Configuration_Workflows',
        'Domain_4::Prompt_Engineering_Structured_Output',
      ]);

      expect(result.map((t) => t.name)).toEqual([
        'Tags:',
        'Domain_3::Claude_Code_Configuration_Workflows',
        'Domain_4::Prompt_Engineering_Structured_Output',
        'Scenario_5::Claude_Code_CI_CD',
      ]);
    });

    it('remove tag ForaDosDominios anterior ao reclassificar', () => {
      const tags = [new Tag('ForaDosDominios')];

      const result = applyClassificationTags(tags, 'ForaDoCenario', [
        'Domain_2::Tool_Design_MCP_Integration',
      ]);

      expect(result.map((t) => t.name)).toEqual([
        'Domain_2::Tool_Design_MCP_Integration',
        'ForaDoCenario',
      ]);
    });

    it('adiciona tag ForaDosDominios se a lista de dominios fornecida for vazia', () => {
      const tags = [new Tag('Tags:')];

      const result = applyClassificationTags(tags, 'Scenario_1::Customer_Support_Agent', []);

      expect(result.map((t) => t.name)).toEqual([
        'Tags:',
        'ForaDosDominios',
        'Scenario_1::Customer_Support_Agent',
      ]);
    });
  });
});
