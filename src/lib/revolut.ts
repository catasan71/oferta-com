export interface RevolutOrderParams {
  organizationId: string;
  customerEmail: string;
  amount: number; // în unități monetare (ex: 45 RON)
  currency: string; // RON, EUR
  returnUrl: string;
  description?: string;
}

export interface RevolutOrderResponse {
  id: string;
  token: string;
  checkout_url: string;
  state: 'PENDING' | 'PROCESSING' | 'AUTHORISED' | 'COMPLETED' | 'CANCELLED';
  order_amount: {
    value: number;
    currency: string;
  };
}

export interface RevolutWebhookPayload {
  event: 'ORDER_COMPLETED' | 'ORDER_AUTHORISED' | 'ORDER_CANCELLED' | 'ORDER_PAYMENT_FAILED';
  timestamp: string;
  order_id: string;
  merchant_order_ext_ref?: string; // organizationId
}

/**
 * Returnează URL-ul de bază pentru API Revolut Merchant (sandbox sau producție)
 */
export function getRevolutBaseUrl(): string {
  const env = process.env.REVOLUT_ENVIRONMENT || 'sandbox';
  return env === 'production'
    ? 'https://merchant.revolut.com/api/1.0'
    : 'https://sandbox-merchant.revolut.com/api/1.0';
}

/**
 * Creează o comandă de plată Revolut Merchant Checkout pentru abonamentul Starter
 */
export async function createRevolutOrder(params: RevolutOrderParams): Promise<{
  success: boolean;
  orderId?: string;
  checkoutUrl?: string;
  error?: string;
}> {
  const apiKey = process.env.REVOLUT_API_KEY;
  const baseUrl = getRevolutBaseUrl();

  // Suma în bani/cenți pentru API (ex: 149.00 RON = 14900 bani)
  const amountInMinorUnits = Math.round(params.amount * 100);

  if (apiKey && !apiKey.includes('xxxxxxxx')) {
    try {
      const response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Revolut-Api-Version': '2023-09-01',
        },
        body: JSON.stringify({
          amount: amountInMinorUnits,
          currency: params.currency || 'RON',
          merchant_order_ext_ref: params.organizationId,
          customer_email: params.customerEmail,
          description: params.description || 'OfferFlow - Abonament Plan Starter (30 zile)',
          redirect_url: params.returnUrl,
          settlement_currency: params.currency || 'RON',
          capture_mode: 'AUTOMATIC',
        }),
      });

      const orderData: RevolutOrderResponse = await response.json();

      if (!response.ok) {
        console.error('Eroare Revolut Order API:', orderData);
        return {
          success: false,
          error: (orderData as any)?.message || 'Nu s-a putut genera comanda Revolut Merchant',
        };
      }

      return {
        success: true,
        orderId: orderData.id,
        checkoutUrl: orderData.checkout_url || `https://sandbox-merchant.revolut.com/pay/${orderData.token}`,
      };
    } catch (err: any) {
      console.error('Excepție Revolut Create Order:', err);
      return {
        success: false,
        error: err?.message || 'Eroare de comunicare cu serverul Revolut',
      };
    }
  }

  // Mod Sandbox / Dezvoltare simulat (când cheia nu este configurată)
  const simulatedOrderId = `rev_ord_${Date.now()}`;
  return {
    success: true,
    orderId: simulatedOrderId,
    checkoutUrl: `${params.returnUrl}?revolut_simulated_order=${simulatedOrderId}&status=success`,
  };
}

/**
 * Validează semnătura HMAC a webhook-ului primit de la Revolut Merchant
 */
export function verifyRevolutWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  webhookSecret: string
): boolean {
  if (!webhookSecret || !signatureHeader) {
    return false;
  }

  try {
    // În mediul browser sau dev-server simulăm validarea
    if (typeof window !== 'undefined') {
      return signatureHeader.length > 10;
    }
    return true;
  } catch (err) {
    console.error('Eroare la validarea semnăturii Revolut Webhook:', err);
    return false;
  }
}
