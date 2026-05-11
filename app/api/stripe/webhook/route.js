import { NextResponse } from "next/server";
import Stripe from "stripe";
import { computePremiumUntilAfterPassPurchase } from "../../../../lib/stripePremiumPass";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";

export const runtime = "nodejs";

/**
 * Webhook Stripe (Next.js).
 * Alternative prod — Supabase Edge Function (même événements / logique) :
 * `https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook`
 * → définis STRIPE_* dans les secrets Edge ; mets `verify_jwt = false` (voir supabase/config.toml).
 * Ne configure qu’UNE seule URL endpoint dans Stripe pour éviter les doubles traitements.
 */
export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const apiKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secret || !apiKey) {
    return NextResponse.json(
      { error: "Stripe webhook non configuré (STRIPE_WEBHOOK_SECRET / STRIPE_SECRET_KEY)." },
      { status: 500 },
    );
  }

  const stripe = new Stripe(apiKey);
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "En-tête stripe-signature manquant." }, { status: 400 });
  }

  let event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature invalide.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.supabase_user_id ?? session.client_reference_id;
      const rawCustomer = session.customer;
      const customerId =
        typeof rawCustomer === "string"
          ? rawCustomer
          : rawCustomer && typeof rawCustomer === "object" && "id" in rawCustomer && typeof rawCustomer.id === "string"
            ? rawCustomer.id
            : null;
      if (userId && typeof userId === "string") {
        const admin = createSupabaseAdminClient();
        if (!admin) {
          console.error("[stripe webhook] SUPABASE_SERVICE_ROLE_KEY manquante — is_premium non mis à jour.");
        } else if (session.mode === "payment") {
          const { data: row } = await admin.from("profiles").select("premium_until").eq("id", userId).maybeSingle();
          const premiumUntil = computePremiumUntilAfterPassPurchase(row?.premium_until ?? null);
          const patch = { is_premium: true, premium_until: premiumUntil };
          if (customerId) {
            patch.stripe_customer_id = customerId;
          }
          const { error } = await admin.from("profiles").update(patch).eq("id", userId);
          if (error) {
            console.error("[stripe webhook] Erreur mise à jour profil (pass):", error.message);
          }
        } else if (session.mode === "subscription") {
          const patch = { is_premium: true };
          if (customerId) {
            patch.stripe_customer_id = customerId;
          }
          const { error } = await admin.from("profiles").update(patch).eq("id", userId);
          if (error) {
            console.error("[stripe webhook] Erreur mise à jour profil (abo):", error.message);
          }
        }
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = subscription.metadata?.supabase_user_id;
      if (userId && typeof userId === "string") {
        const admin = createSupabaseAdminClient();
        if (admin) {
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
            console.error("[stripe webhook] Révocation premium:", error.message);
          }
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

  return NextResponse.json({ received: true });
}
