import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../api/axios';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51R5KV0EIWCxGuuh7Fk6pJ4f6LU93QC2ESUnKUXqdPFtelf2n8mvwlcqM56IEK3i0JeD9hB4onBkIPEXzNfft7jPn00idRshu3M',
  { advancedFraudSignals: false }
);

const CheckoutForm = ({ amount, onSuccess, onError, orderId, studentId, cardElementStyle }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    setProcessing(true);
    setCardError(null);

    if (!stripe || !elements) {
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setProcessing(false);
      return;
    }

    try {
      // Step 1: Call backend to create a PaymentIntent
      const response = await api.post('/create-payment-intent', {
        amount: amount * 100, // convert INR to paise
        currency: 'inr',
        metadata: {
          studentId: String(studentId),
          orderId: String(orderId),
          platform: 'academix'
        }
      });

      const { clientSecret } = response.data;
      if (!clientSecret) {
        throw new Error('Failed to retrieve payment intent client secret');
      }

      // Step 2: Confirm the card payment using the clientSecret
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement }
      });

      if (result.error) {
        let displayError = result.error.message || 'Payment failed';
        if (result.error.code === 'card_declined') {
          displayError = 'Your card was declined. Please try a different card.';
        } else if (result.error.code === 'insufficient_funds') {
          displayError = 'Insufficient funds on this card.';
        }
        setCardError(displayError);
        onError(displayError);
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess(result.paymentIntent);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'An error occurred during payment';
      setCardError(errMsg);
      onError(errMsg);
    } finally {
      setProcessing(false);
    }
  };

  const defaultStyle = {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: 'transparent',
      '::placeholder': { color: '#555555' },
      iconColor: '#a0c4a0'
    },
    invalid: { color: '#e07070', iconColor: '#e07070' }
  };

  return (
    <div className="space-y-4">
      <div className="border border-white/10 rounded-lg p-4 bg-[#111113]">
        <CardElement
          options={{
            style: cardElementStyle || defaultStyle
          }}
          onChange={(e) => {
            if (e.error) {
              setCardError(e.error.message);
              onError(e.error.message);
            } else {
              setCardError(null);
              onError(null);
            }
          }}
        />
      </div>

      {cardError && (
        <div className="flex items-center gap-1.5 text-[#e07070] text-xs font-mono">
          <span>⚠️</span>
          <span>{cardError}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || processing}
        className="w-full bg-[#e07a7a] hover:bg-[#d06060] text-white py-3 px-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg min-h-[48px]"
      >
        {processing ? 'Processing...' : `Pay ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)}`}
      </button>
    </div>
  );
};

export const PaymentGateway = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};
