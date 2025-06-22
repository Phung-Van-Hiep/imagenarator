import Stripe from 'stripe';
import paymentModel from '../models/paymentModel.js';
import userModel from '../models/userModel.js';

const stripe = new Stripe(process.env.STRIPE_SECRET);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function stripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi      = event.data.object;
    const credits = Number(pi.metadata?.credits || 0);
    const userId  = pi.metadata?.userId;
    // console.log('---- Stripe Webhook ----');
    // console.log('PaymentIntent ID :', pi.id);
    // console.log('Metadata         :', pi.metadata);     // <-- xem userId & credits
    // console.log('User             :', userId);
    // console.log('Credits to add   :', credits);
    // console.log('------------------------');
    try {
      await paymentModel.findOneAndUpdate(
        { paymentIntentId: pi.id },
        { status: 'succeeded' }
      );

      if (userId && credits) {
        await userModel.findByIdAndUpdate(
          userId,
          { $inc: { creditBalance: credits } }
        );
      }
    } catch (err) {
      console.error('DB update error:', err);
      return res.status(500).json({ received: false });
    }
  }

  res.json({ received: true });
}