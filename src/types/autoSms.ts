export type SmsRuleType = 'after_purchase' | 'before_expiry';
export type ApplyTo = 'all' | 'selected';
export type SmsRuleProductType = 'include' | 'exclude';

export interface ISmsRuleProduct {
  id: string;
  ruleId: string;
  productId?: string;
  comboProductId?: string;
  type: SmsRuleProductType;
  product?: {
    id: string;
    name: string;
  };
  comboProduct?: {
    id: string;
    name: string;
  };
}

export interface ISmsRule {
  id: string;
  name: string;
  type: SmsRuleType;
  durationDays: number;
  message: string;
  applyTo: ApplyTo;
  isActive: boolean;
  sendTime?: string;
  createdAt: string;
  updatedAt: string;
  products: ISmsRuleProduct[];
}

export interface ISmsRuleRequest {
  name: string;
  type: SmsRuleType;
  durationDays: number;
  message: string;
  applyTo: ApplyTo;
  isActive: boolean;
  sendTime?: string;
  products?: {
    productId?: string;
    comboProductId?: string;
    type: SmsRuleProductType;
  }[];
}
