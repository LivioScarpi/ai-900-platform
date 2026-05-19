export interface CertConfig {
  id: string;
  name: string;
  fullName: string;
  provider: string;
  description: string;
  color: string;
  examQuestions: number;
  examDurationMin: number;
  passmarkPct: number;
  hasMicrosoftQuestions: boolean;
}

import ai900Config from "../../data/certifications/ai900/config.json";

const REGISTRY: Record<string, CertConfig> = {
  ai900: ai900Config as CertConfig,
};

export function getCertConfig(certId: string): CertConfig | null {
  return REGISTRY[certId] ?? null;
}

export function getAllCertConfigs(): CertConfig[] {
  return Object.values(REGISTRY);
}
