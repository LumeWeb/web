export interface SubscriptionStatusResponse {
  is_subscribed: boolean;
  gateway_type?: string;
  plan_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export interface BillingPluginMeta {
  stripe_pricing_table_id?: string;
  stripe_publishable_key?: string;
}
