export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      plan,
      email,
      organizationId,
      customAmount,
      returnUrl,
      customPaymentLinkStarter,
      customPaymentLinkClasic,
    } = req.body || {};

    const amountInRon = customAmount ? Number(customAmount) : plan === 'CLASIC' ? 100 : 45;
    const amountInBani = Math.round(amountInRon * 100);
    const planName = plan === 'CLASIC' ? 'Clasic (100 RON)' : 'Starter (45 RON)';

    const apiKey = process.env.REVOLUT_API_KEY;
    const env = process.env.REVOLUT_ENVIRONMENT || 'production';
    const baseUrl =
      env === 'production'
        ? 'https://merchant.revolut.com/api/1.0'
        : 'https://sandbox-merchant.revolut.com/api/1.0';

    // 1. Încercare apel API oficial Revolut Merchant dacă există cheie configurată
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
            amount: amountInBani,
            currency: 'RON',
            customer_email: email || 'catalinsandu@protonmail.com',
            description: `OfferFlow - Abonament Plan ${planName} (30 zile)`,
            merchant_order_ext_ref: organizationId || `org_${Date.now()}`,
            redirect_url: returnUrl || undefined,
            capture_mode: 'AUTOMATIC',
          }),
        });

        const orderData: any = await response.json();

        if (response.ok && (orderData.checkout_url || orderData.public_id || orderData.token)) {
          const checkoutUrl =
            orderData.checkout_url ||
            (orderData.public_id
              ? `https://checkout.revolut.com/payment-link/${orderData.public_id}`
              : null) ||
            (orderData.token ? `https://checkout.revolut.com/pay/${orderData.token}` : null);

          return res.status(200).json({
            success: true,
            orderId: orderData.id,
            token: orderData.token || orderData.public_id,
            url: checkoutUrl,
            amount: amountInRon,
          });
        }
      } catch (apiErr) {
        console.error('Revolut API fetch error:', apiErr);
      }
    }

    // 2. Fallback: Link-uri configurate prin variabile de mediu sau transmise din setările aplicației
    const configuredUrl =
      plan === 'CLASIC'
        ? customPaymentLinkClasic || process.env.REVOLUT_PAYMENT_LINK_CLASIC
        : customPaymentLinkStarter || process.env.REVOLUT_PAYMENT_LINK_STARTER;

    if (configuredUrl) {
      return res.status(200).json({
        success: true,
        orderId: `rev_link_${Date.now()}`,
        url: configuredUrl,
        amount: amountInRon,
      });
    }

    // 3. Dacă nu există cheie sau link setat, returnăm un status clar și link fallback
    return res.status(200).json({
      success: true,
      orderId: `rev_sim_${Date.now()}`,
      url: null,
      amount: amountInRon,
      requiresConfiguration: true,
      message: 'Este necesară configurarea cheii REVOLUT_API_KEY sau a linkului Revolut Business.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
