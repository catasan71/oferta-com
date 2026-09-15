// Next.js App Router API Route: /api/billing/revolut/create-order
import { createRevolutOrder } from '@/src/lib/revolut.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { organizationId, customerEmail, returnUrl } = body;

    if (!organizationId) {
      return new Response(
        JSON.stringify({ error: 'Parametrul organizationId este obligatoriu' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Preț plan Starter: 149 RON / lună
    const STARTER_PLAN_PRICE = 149.00;
    const CURRENCY = 'RON';

    const result = await createRevolutOrder({
      organizationId,
      customerEmail: customerEmail || 'office@imm-exemplu.ro',
      amount: STARTER_PLAN_PRICE,
      currency: CURRENCY,
      returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard?payment=success`,
      description: 'OfferFlow Starter - Ofertare Nelimitată & White-Label (30 zile)',
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: result.orderId,
        checkoutUrl: result.checkoutUrl,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Eroare la crearea comenzii Revolut:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Eroare internă de server' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
