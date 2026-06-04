import { useState } from 'react';
import { initiatePayment, verifyPayment } from '../api/orderApi';
import { useQueryClient } from '@tanstack/react-query';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const usePayment = () => {
    const [isPaying, setIsPaying] = useState(false);
    const queryClient = useQueryClient();

    const handlePayment = async (orderId, amount) => {
        setIsPaying(true);
        try {
            // 1. Load Razorpay script
            const res = await loadRazorpayScript();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                return;
            }

            // 2. Initiate payment on backend to get Razorpay order details
            const paymentDetails = await initiatePayment(orderId, amount);

            // Bypassing Razorpay popup if it's a dev mock order or placeholder key
            if ((paymentDetails.razorpayOrderId && paymentDetails.razorpayOrderId.startsWith('mock_order_')) || 
                (paymentDetails.keyId && paymentDetails.keyId.startsWith('rzp_test_placeholder'))) {
                console.log("Mock payment mode activated. Auto-verifying transaction.");
                await verifyPayment({
                    razorpayOrderId: paymentDetails.razorpayOrderId || ('mock_order_' + Date.now()),
                    razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substring(2, 9),
                    razorpaySignature: 'sig_mock_' + Math.random().toString(36).substring(2, 9)
                });
                queryClient.invalidateQueries(['orderDetail', orderId]);
                setIsPaying(false);
                return;
            }

            // 3. Configure Razorpay options
            const options = {
                key: paymentDetails.keyId,
                amount: (paymentDetails.amount * 100).toString(),
                currency: paymentDetails.currency,
                name: 'Academix',
                description: paymentDetails.orderDescription,
                order_id: paymentDetails.razorpayOrderId,
                handler: async (response) => {
                    try {
                        // 4. Verify payment on backend
                        await verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        });
                        
                        // Success! Refresh the order data
                        queryClient.invalidateQueries(['orderDetail', orderId]);
                    } catch (err) {
                        console.error('Verification failed', err);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: paymentDetails.studentName,
                    email: paymentDetails.studentEmail,
                    contact: paymentDetails.studentContact,
                },
                theme: {
                    color: '#6366f1',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error(response.error);
                alert('Payment failed: ' + response.error.description);
            });
            rzp.open();
        } catch (err) {
            console.error('Payment initiation failed', err);
            alert('Failed to initiate payment. Please try again.');
        } finally {
            setIsPaying(false);
        }
    };

    return { handlePayment, isPaying };
};
