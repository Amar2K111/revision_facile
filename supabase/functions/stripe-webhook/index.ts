import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.5.0";

/**
 * Webhook Stripe hébergé sur Supabase Edge Functions.
 * URL prod : https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook
 *
 * Secrets (Dashboard → Edge Functions → Secrets, ou `supabase secrets set`) :
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET (whsec_… du endpoint pointant vers CETTE URL)
 *
 * Fournis par Supabase : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim();
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

  if (!webhookSecret || !stripeKey || !supabaseUrl || !serviceRole) {
    console.error("[stripe-webhook] Variables manquantes (STRIPE_*, SUPABASE_*).");
    return new Response(JSON.stringify({ error: "Configuration serveur incomplète." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "En-tête stripe-signature manquant." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Signature invalide.";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const computePremiumUntilAfterPassPurchase = (
    existingPremiumUntilIso: string | null | undefined,
    now = new Date(),
  ): string => {
    let base = now;
    if (existingPremiumUntilIso != null && String(existingPremiumUntilIso).trim() !== "") {
      const ex = new Date(String(existingPremiumUntilIso));
      if (!Number.isNaN(ex.getTime()) && ex > now) {
        base = ex;
      }
    }
    const d = new Date(base.getTime());
    d.setMonth(d.getMonth() + 3);
    return d.toISOString();
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId =
        session.metadata?.supabase_user_id ?? session.client_reference_id ?? undefined;
      const rawCustomer = session.customer;
      const customerId =
        typeof rawCustomer === "string"
          ? rawCustomer
          : rawCustomer && typeof rawCustomer === "object" && rawCustomer !== null && "id" in rawCustomer
            ? String((rawCustomer as { id: string }).id)
            : null;

      if (userId && typeof userId === "string") {
        if (session.mode === "payment") {
          const { data: row } = await admin.from("profiles").select("premium_until").eq("id", userId).maybeSingle();
          const premiumUntil = computePremiumUntilAfterPassPurchase(row?.premium_until ?? null);
          const patch: { is_premium: boolean; premium_until: string; stripe_customer_id?: string } = {
            is_premium: true,
            premium_until: premiumUntil,
          };
          if (customerId) {
            patch.stripe_customer_id = customerId;
          }
          const { error } = await admin.from("profiles").update(patch).eq("id", userId);
          if (error) {
            console.error("[stripe-webhook] Erreur mise à jour profil (pass):", error.message);
          }
        } else if (session.mode === "subscription") {
          const patch: { is_premium: boolean; stripe_customer_id?: string } = { is_premium: true };
          if (customerId) {
            patch.stripe_customer_id = customerId;
          }
          const { error } = await admin.from("profiles").update(patch).eq("id", userId);
          if (error) {
            console.error("[stripe-webhook] Erreur mise à jour profil (abo):", error.message);
          }
        }
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.supabase_user_id;
      if (userId && typeof userId === "string") {
        const { data: row } = await admin.from("profiles").select("premium_until").eq("id", userId).maybeSingle();
        const untilRaw = row?.premium_until;
        if (untilRaw != null && String(untilRaw).trim() !== "") {
          const t = new Date(String(untilRaw)).getTime();
          if (Number.isFinite(t) && t > Date.now()) {
            break;
          }
        }
        const { error } = await admin.from("profiles").update({ is_premium: false }).eq("id", userId);
        if (error) {
          console.error("[stripe-webhook] Révocation premium:", error.message);
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "invoice.paid":
    case "invoice.payment_failed":
      break;
    default:
      break;
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
