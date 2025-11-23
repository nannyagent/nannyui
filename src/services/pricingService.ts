import { supabase } from '@/lib/supabase';

export interface PricingPlan {
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
  features: any;
  created_at: string;
}

/**
 * Fetch all pricing plans from Supabase
 */
export const getPricingPlans = async (): Promise<PricingPlan[]> => {
  try {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('monthly_price_cents', { ascending: true });

    if (error) {
      console.error('Error fetching pricing plans:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching pricing plans:', error);
    return [];
  }
};
