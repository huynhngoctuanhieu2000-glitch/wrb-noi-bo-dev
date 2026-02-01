'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useMenuData } from '@/components/Menu/MenuContext';

import CheckoutHeader from '@/components/Checkout/CheckoutHeader';
import CustomerInfo from '@/components/Checkout/CustomerInfo';
import Invoice from '@/components/Checkout/Invoice';
import PaymentMethods from '@/components/Checkout/PaymentMethods';
import CustomRequestModal from '@/components/Checkout/CustomRequestModal';
import { ServiceOptions } from '@/components/Menu/types';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, updateAllCartItemOptions } = useMenuData();

    // State for Custom Request Modal
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // State for Customer Info
    const [customerInfo, setCustomerInfo] = React.useState({
        name: '',
        email: '',
        phone: '',
        gender: 'Male',
        room: '' // Optional or removed based on new req? Keeping for compat for now
    });

    // State for Payment
    const [paymentMethod, setPaymentMethod] = React.useState('cash_vnd');
    const [amountPaid, setAmountPaid] = React.useState<string>(''); // Keep as string for input

    // Derived Calculations
    const totalVND = React.useMemo(() => cart.reduce((sum, item) => sum + item.priceVND * item.qty, 0), [cart]);

    // Calculate Change
    const changeAmount = React.useMemo(() => {
        const paid = parseInt(amountPaid.replace(/\./g, '') || '0', 10);
        return paid - totalVND;
    }, [amountPaid, totalVND]);

    // Format input as money
    const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');
        setAmountPaid(Number(raw).toLocaleString('vi-VN'));
    };

    // Quick Set Amount Paid
    const setQuickAmount = (amount: number) => {
        setAmountPaid(amount.toLocaleString('vi-VN'));
    };

    // Nếu giỏ hàng trống, quay về menu
    React.useEffect(() => {
        if (!cart || cart.length === 0) {
            router.push('/');
        }
    }, [cart, router]);

    const handleBack = () => {
        router.back();
    };

    const handleCustomRequest = () => {
        setIsModalOpen(true);
    };

    const handleSaveCustomRequest = (options: ServiceOptions) => {
        updateAllCartItemOptions(options);
    };

    const handleCustomerChange = (field: string, value: string) => {
        setCustomerInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleConfirmOrder = () => {
        if (!customerInfo.name || !customerInfo.email) {
            alert('Please enter Full Name and Email');
            return;
        }

        const orderData = {
            customer: customerInfo,
            paymentMethod,
            amountPaid: parseInt(amountPaid.replace(/\./g, '') || '0', 10),
            change: changeAmount,
            items: cart,
            totalVND,
            createdAt: new Date().toISOString()
        };

        console.log('✅ ORDER CONFIRMED:', orderData);
        alert('Order Success! (Simulated)');
        // router.push('/success');
    };

    if (!cart) return null;

    return (
        <div className="min-h-screen bg-[#f8fafc] text-black pb-32 font-sans">
            <CheckoutHeader title="Payment Information" onBack={handleBack} />

            <main className="p-4 space-y-6 max-w-2xl mx-auto">

                {/* 1. Customer Info */}
                <CustomerInfo
                    lang="en"
                    info={customerInfo}
                    onChange={handleCustomerChange}
                />

                {/* 2. Invoice */}
                <Invoice
                    cart={cart}
                    lang="en"
                    onCustomRequest={handleCustomRequest}
                />

                {/* 3. Payment Methods */}
                <PaymentMethods
                    lang="en"
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                />

                {/* 4. Cash Payment Logic (POS) - Only show if Cash VND/USD selected */}
                {(paymentMethod === 'cash_vnd' || paymentMethod === 'cash_usd') && (
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-gray-400 font-bold uppercase tracking-widest text-xs">AMOUNT PAID</h2>
                            <button
                                onClick={() => setAmountPaid('0')}
                                className="text-red-500 text-xs font-bold border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Input Large */}
                        <div className="relative">
                            <input
                                type="text"
                                value={amountPaid}
                                onChange={handleAmountPaidChange}
                                placeholder="0"
                                className="w-full text-center text-4xl font-bold text-black border-b-2 border-gray-100 py-4 focus:outline-none focus:border-green-500 transition-colors bg-transparent placeholder-gray-200"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">VND</span>
                        </div>

                        {/* Quick Suggestions */}
                        <div className="flex gap-2 justify-center flex-wrap">
                            {[totalVND, 500000, 1000000].map(amt => (
                                amt > 0 && (
                                    <button
                                        key={amt}
                                        onClick={() => setQuickAmount(amt)}
                                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all"
                                    >
                                        {amt.toLocaleString('vi-VN')}
                                    </button>
                                )
                            ))}
                        </div>

                        {/* Change Display */}
                        <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                            <span className="text-gray-500 text-sm font-medium">Change:</span>
                            <span className={`text-xl font-bold ${changeAmount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {changeAmount >= 0 ? changeAmount.toLocaleString('vi-VN') : 'Insufficient'} VND
                            </span>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Bar - Confirm */}
            <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={handleConfirmOrder}
                        className="w-full py-4 bg-[#0f172a] text-white font-bold uppercase rounded-xl shadow-lg hover:bg-[#1e293b] transition-colors text-lg"
                    >
                        Confirm Order
                    </button>
                </div>
            </div>

            {/* Modal */}
            <CustomRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCustomRequest}
                lang="en"
            />
        </div>
    );
}
