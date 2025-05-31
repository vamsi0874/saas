import { NextResponse } from 'next/server'
import { db } from '@/server/db'

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil',
})

export async function POST(request: Request) {
    const body = await request.text()
  const signature = (await request.headers).get('Stripe-Signature') as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  console.log(event.type)

  if (event.type === 'checkout.session.completed') {
    const credits = Number(session.metadata?.['credits'])
    const userId = session.client_reference_id
    if (!credits || !userId) {
      return NextResponse.json({ error: 'Missing credits or user ID' }, { status: 400 })
    }
    await db.stripeTransaction.create({
      data: {
        userId,
        credits
      }
    })

    await db.user.update({
        where :{id:userId},
        data: {
            credits: {
                increment: credits
            }
        }
    })
     return NextResponse.json({ message: 'credits added' },{ status: 200})
  }
    return NextResponse.json({ message: 'hello world' })
 
}
