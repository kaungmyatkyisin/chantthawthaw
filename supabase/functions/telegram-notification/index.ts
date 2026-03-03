import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

serve(async (req) => {
  try {
    const payload = await req.json()
    // Supabase Webhook data ကို record key ထဲကနေ ဆွဲယူခြင်း
    const record = payload.record 

    if (!record) {
      return new Response(JSON.stringify({ error: "No record found" }), { status: 400 })
    }

    // တန်ဖိုး မရှိနိုင်သော ကော်လံများအတွက် Default value ထည့်ခြင်း
    const customer = record.customer_name || 'Unknown'
    const phone = record.customer_phone || 'No Phone'
    const amount = record.total_amount ? Number(record.total_amount).toLocaleString() : '0'
    const address = record.address || 'လိပ်စာမဖော်ပြထားပါ'
    const note = record.note || '-'

    const message = `
<b>New Order Alert! 🚀</b>

🆔 Order ID: <code>${record.id}</code>
👤 Customer: <b>${customer}</b>
📞 Phone: ${phone}
💰 Total: <b>${amount} Ks</b>
🏠 Address: ${address}
📝 Note: ${note}
    `.trim()

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    })

    const result = await response.json()
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})