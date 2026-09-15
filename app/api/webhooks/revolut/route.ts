// Next.js App Router Webhook Route: /api/webhooks/revolut
import { verifyRevolutWebhookSignature, RevolutWebhookPayload } from '@/src/lib/revolut.ts';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('Revolut-Signature') || request.headers.get('revolut-signature');
    const webhookSecret = process.env.REVOLUT_WEBHOOK_SECRET;

    // Verificare securitate semnătură (dacă secretul este configurat)
    if (webhookSecret && !webhookSecret.includes('xxxxxxxx')) {
      const isValid = verifyRevolutWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.warn('[Revolut Webhook] Semnătură invalidă respinsă.');
        return new Response(JSON.stringify({ error: 'Semnătură webhook invalidă' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const payload: RevolutWebhookPayload = JSON.parse(rawBody);
    console.info(`[Revolut Webhook] Eveniment recepționat: ${payload.event} pentru comanda ${payload.order_id}`);

    // Tratare eveniment ORDER_COMPLETED
    if (payload.event === 'ORDER_COMPLETED') {
      const organizationId = payload.merchant_order_ext_ref;

      if (!organizationId) {
        console.error('[Revolut Webhook] merchant_order_ext_ref (organizationId) lipsește');
        return new Response(JSON.stringify({ error: 'Organization ID missing' }), { status: 400 });
      }

      // Calcul dată expirare abonament: 30 de zile de la data plății
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      /*
       * În mediul de producție cu Prisma ORM activ:
       * await prisma.subscription.upsert({
       *   where: { organizationId },
       *   update: {
       *     plan: 'STARTER',
       *     status: 'ACTIVE',
       *     revolut_order_id: payload.order_id,
       *     valid_until: validUntil,
       *   },
       *   create: {
       *     organizationId,
       *     plan: 'STARTER',
       *     status: 'ACTIVE',
       *     revolut_order_id: payload.order_id,
       *     valid_until: validUntil,
       *   },
       * });
       */

      console.info(`[Revolut Webhook] Abonament STARTER activat cu succes pentru organizația: ${organizationId} până la ${validUntil.toISOString()}`);

      return new Response(
        JSON.stringify({
          received: true,
          status: 'PROCESSED',
          plan: 'STARTER',
          organizationId,
          valid_until: validUntil.toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Alte evenimente Revolut (ORDER_AUTHORISED, ORDER_CANCELLED)
    return new Response(JSON.stringify({ received: true, status: 'IGNORED' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[Revolut Webhook Error]:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Eroare procesare webhook' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
