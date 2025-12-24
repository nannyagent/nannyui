import { pb } from '@/lib/pocketbase';

export interface PricingPlan {
  id: string;
  plan_id: string;
  name: string;
  slug: string;
  agent_limit: number;
  max_agents: number;
  monthly_price_cents: number;
  api_calls_per_min: number;
  api_calls_per_day: number;
  tokens_per_day: number;
  data_retention_days: number;
  core_api_access: boolean;
  monitoring: string;
  support: string;
  advanced_security: boolean;
  priority_support: boolean;
  custom_agents: boolean;
  features: Record<string, any>;
  created_at: string;
}

/**
 * Fetch all pricing plans
 */
export const getPricingPlans = async (): Promise<PricingPlan[]> => {
  try {
    const records = await pb.collection('pricing_plans').getFullList({
      sort: 'monthly_price_cents',
    });

    return records.map((record: any) => ({
      ...record,
      created_at: record.created,
    })) as unknown as PricingPlan[];
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return [];
  }
};
