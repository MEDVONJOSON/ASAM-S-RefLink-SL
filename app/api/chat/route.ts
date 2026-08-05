import { z } from "zod"

const KNOWLEDGE_BASE = {
  overview: "ASAMS RefLink SL turns informal referrals into a structured, paid economy. Businesses list their services, Referrers share links, and Customers buy. The Business pays an agreed commission (5% to 15%), split 80% to the Referrer and 20% to the Platform. Registration is completely free.",
  referrer: "As a Referrer (Youth/Individual):\n1. Sign up via /get-started with a phone number and an ASAMS Registration Code.\n2. Mark training complete on your dashboard to become certified.\n3. Generate a personal referral link for any business at /businesses.\n4. Share your link! When a business confirms a sale made through your code, you earn 80% of the commission, paid automatically via Orange Money.",
  business: "As a Business:\n1. Sign up via /get-started with your email and an ASAMS Authorization Code.\n2. Fill out your profile and wait for admin verification.\n3. List products under the 'Products' tab.\n4. When a customer buys and mentions a referral code, click 'Report sale' on your dashboard. You pay the commission (5-15%) to confirm the sale.",
  client: "As a Client (Customer):\n1. Sign up via /get-started with your phone number.\n2. Browse the marketplace (/businesses) to find verified businesses.\n3. Buy products at normal prices. Remember to mention the referrer's code to ensure they get paid!\n4. Track your purchases on your dashboard.",
  login: "Login is completely passwordless! Just go to /login, enter your phone, email, or signature code, and you'll receive an OTP.",
  fees: "Joining ASAMS RefLink SL is completely free! There are no upfront fees. Businesses only pay the agreed commission (5-15%) when a successful sale is made.",
}

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
})

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(30),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return new Response("Invalid request.", { status: 400 })
  }

  const messages = parsed.data.messages
  const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content.toLowerCase() || ""

  let responseText = ""

  if (lastUserMessage.includes("referrer") || lastUserMessage.includes("youth") || lastUserMessage.includes("earn") || lastUserMessage.includes("money")) {
    responseText = KNOWLEDGE_BASE.referrer
  } else if (lastUserMessage.includes("business") || lastUserMessage.includes("company") || lastUserMessage.includes("list") || lastUserMessage.includes("sell")) {
    responseText = KNOWLEDGE_BASE.business
  } else if (lastUserMessage.includes("client") || lastUserMessage.includes("customer") || lastUserMessage.includes("buy")) {
    responseText = KNOWLEDGE_BASE.client
  } else if (lastUserMessage.includes("login") || lastUserMessage.includes("password") || lastUserMessage.includes("otp") || lastUserMessage.includes("sign in")) {
    responseText = KNOWLEDGE_BASE.login
  } else if (lastUserMessage.includes("fee") || lastUserMessage.includes("cost") || lastUserMessage.includes("pay") || lastUserMessage.includes("commission") || lastUserMessage.includes("price")) {
    responseText = KNOWLEDGE_BASE.fees
  } else {
    responseText = KNOWLEDGE_BASE.overview + "\n\nYou can ask me specifically about being a Referrer, a Business, a Client, or how Login and Fees work!"
  }

  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 400))

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      const chunks = responseText.match(/.{1,4}/g) || []
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
        await new Promise(r => setTimeout(r, 15)) // stream effect
      }
      controller.close()
    }
  })

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
