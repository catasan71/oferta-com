export default async function handler(req: any, res: any) {
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
    const { transaction } = req.body || {};
    console.log('[VERCEL NOTIFICARE PLATĂ]:', transaction);

    return res.status(200).json({
      success: true,
      message: 'Notificare recepționată cu succes pe Vercel',
      notifiedEmail: 'catalinsandu07@gmail.com',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
