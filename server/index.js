import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import mercadopago from "mercadopago";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

/** =========================
 *  Mercado Pago (Checkout Pro)
 *  ========================= */
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

app.post("/api/mercadopago/create-preference", async (req, res) => {
  try {
    const { buyer, items } = req.body;
    if (!items?.length) return res.status(400).json({ error: "Carrinho vazio" });

    const preference = {
      items: items.map(i => ({
        title: i.title,
        unit_price: Number(i.unit_price),
        quantity: Number(i.quantity),
        currency_id: "BRL"
      })),
      payer: {
        name: buyer?.name,
        email: buyer?.email
      },
      back_urls: {
        success: `${process.env.WEB_BASE_URL}/?paid=success`,
        pending: `${process.env.WEB_BASE_URL}/?paid=pending`,
        failure: `${process.env.WEB_BASE_URL}/?paid=failure`
      },
      auto_return: "approved",
      // Quando publicar, troque para o domínio público do backend:
      notification_url: `https://SEU-DOMINIO.com/api/mercadopago/webhook`
    };

    const response = await mercadopago.preferences.create(preference);

    return res.json({
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Erro Mercado Pago" });
  }
});

/** Webhook Mercado Pago (exemplo) */
app.post("/api/mercadopago/webhook", async (req, res) => {
  // Em produção:
  // 1) valide assinatura/segredo
  // 2) consulte a API do MP para confirmar status (approved)
  // 3) libere VIP/créditos/itens no seu sistema
  console.log("MP webhook:", req.body);
  res.sendStatus(200);
});

/** =========================
 *  PayPal Orders API v2
 *  ========================= */

async function paypalAccessToken(){
  const base = process.env.PAYPAL_BASE_URL;
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");

  const r = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = await r.json();
  if (!r.ok) throw new Error(data?.error_description || "PayPal token error");
  return data.access_token;
}

app.post("/api/paypal/create-order", async (req, res) => {
  try{
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ error:"Carrinho vazio" });

    const total = items.reduce((acc,i)=> acc + Number(i.unit_price)*Number(i.quantity), 0);
    const token = await paypalAccessToken();

    const base = process.env.PAYPAL_BASE_URL;
    const r = await fetch(`${base}/v2/checkout/orders`, {
      method:"POST",
      headers:{
        "Authorization": `Bearer ${token}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "BRL",
            value: total.toFixed(2)
          }
        }],
        application_context: {
          return_url: `${process.env.WEB_BASE_URL}/?paypal=success`,
          cancel_url: `${process.env.WEB_BASE_URL}/?paypal=cancel`
        }
      })
    });

    const data = await r.json();
    if (!r.ok) throw new Error(data?.message || "PayPal create order failed");

    const approve = (data.links || []).find(l => l.rel === "approve")?.href;
    return res.json({ id: data.id, approve_url: approve });
  }catch(e){
    return res.status(500).json({ error: e?.message || "Erro PayPal" });
  }
});

/** Captura PayPal (opcional) */
app.post("/api/paypal/capture/:orderId", async (req,res)=>{
  try{
    const token = await paypalAccessToken();
    const base = process.env.PAYPAL_BASE_URL;

    const r = await fetch(`${base}/v2/checkout/orders/${req.params.orderId}/capture`, {
      method:"POST",
      headers:{
        "Authorization": `Bearer ${token}`,
        "Content-Type":"application/json"
      }
    });

    const data = await r.json();
    if (!r.ok) throw new Error(data?.message || "PayPal capture failed");
    return res.json(data);
  }catch(e){
    return res.status(500).json({ error: e?.message || "Erro PayPal capture" });
  }
});

app.listen(PORT, ()=> console.log(`Backend on http://localhost:${PORT}`));
