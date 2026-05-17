import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service role to fetch ALL products from all clients
    const products = await base44.asServiceRole.entities.Product.list('-created_date', 5000);

    return Response.json({ products });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});