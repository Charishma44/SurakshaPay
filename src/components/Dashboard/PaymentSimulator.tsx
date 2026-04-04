import { useState } from 'react';
import { CreditCard, IndianRupee, CheckCircle } from 'lucide-react';

export default function PaymentSimulator() {
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');

  const handlePayment = async () => {
    setProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setProcessing(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setShowPayment(false);
      setUpiId('');
    }, 3000);
  };

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl shadow-md p-6">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-3" />
          <h3 className="text-lg font-bold text-green-900 mb-1">Payment Successful!</h3>
          <p className="text-sm text-green-700">Your premium has been paid</p>
        </div>
      </div>
    );
  }

  if (!showPayment) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Weekly Premium</p>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-gray-900" />
              <p className="text-2xl font-bold text-gray-900">150</p>
            </div>
          </div>

          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Pay Premium
          </button>

          <p className="text-xs text-gray-500 text-center">
            Secure mock payment simulation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700 mb-1">Amount to Pay</p>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-blue-900" />
            <p className="text-3xl font-bold text-blue-900">150</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                paymentMethod === 'upi'
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              UPI
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                paymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              Card
            </button>
          </div>
        </div>

        {paymentMethod === 'upi' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="example@upi"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setShowPayment(false)}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={processing || (paymentMethod === 'upi' && !upiId)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </button>
        </div>

        <p className="text-xs text-center text-gray-500">
          This is a mock payment for demonstration
        </p>
      </div>
    </div>
  );
}
