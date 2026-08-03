import { queryOptions } from "@tanstack/react-query";

import type { AiDraft, AiPrompt, BusinessIdea, DataSource, PotentialLead, ViabilityAnalysis } from "@/lib/demo-data";
import {
  getIdeaDetail,
  getLeadDetail,
  listIdeas,
  listLeads,
  listPrompts,
  listSources,
} from "@/lib/marketing.functions";

export type LeadEvent = {
  id: string;
  action: string;
  previous_status: string;
  new_status: string;
  actor: string;
  created_at: string;
};

export const ideasQuery = queryOptions({
  queryKey: ["ideas"],
  queryFn: async () => (await listIdeas()) as unknown as BusinessIdea[],
});

export const ideaDetailQuery = (ideaId: string) =>
  queryOptions({
    queryKey: ["idea", ideaId],
    queryFn: async () => {
      const result = await getIdeaDetail({ data: { ideaId } });
      return result as unknown as {
        idea: BusinessIdea | null;
        analysis: ViabilityAnalysis | null;
        leadCount: number;
      };
    },
  });

export const leadsQuery = queryOptions({
  queryKey: ["leads"],
  queryFn: async () => (await listLeads()) as unknown as PotentialLead[],
});

export const leadDetailQuery = (leadId: string) =>
  queryOptions({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      const result = await getLeadDetail({ data: { leadId } });
      return result as unknown as { lead: PotentialLead | null; drafts: AiDraft[]; events: LeadEvent[] };
    },
  });

export const promptsQuery = queryOptions({
  queryKey: ["prompts"],
  queryFn: async () => (await listPrompts()) as unknown as AiPrompt[],
});

export const sourcesQuery = queryOptions({
  queryKey: ["sources"],
  queryFn: async () => (await listSources()) as unknown as DataSource[],
});
