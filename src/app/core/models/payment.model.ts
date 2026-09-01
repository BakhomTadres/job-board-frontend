export interface BillingData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  street?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface CreateCheckoutDto {
  amount: number;
  currency?: string;
  billingData?: BillingData;
  items?: Array<{ name: string; amount_cents: number; description?: string; quantity: number }>;
  paymentMethods?: number[];
  redirectionUrl?: string;
}

export interface CheckoutResponse {
  status: string;
  message?: string;
  data: {
    paymentId: string;
    intentionId: string;
    clientSecret: string;
    checkoutUrl: string;
    specialReference: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export interface PaymentRecord {
  _id: string;
  userId: string;
  paymobIntentionId?: string;
  paymobOrderId?: string | number;
  paymobTransactionId?: string | number;
  specialReference?: string;
  checkoutUrl?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentDetailsResponse {
  status: string;
  data: PaymentRecord;
}
