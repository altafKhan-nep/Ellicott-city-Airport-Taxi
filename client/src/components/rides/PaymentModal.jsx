import { useState, useEffect } from 'react';
import { payRide } from '../../services/paymentService.js';
import { getPublicSettings } from '../../services/settingsService.js';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

// Sandbox payment form. Card ending in 0002 always declines (for testing the
// failure path); 0000 always succeeds; otherwise ~95% success.
export default function PaymentModal({ ride, onClose, onPaid }) {
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [supportPhone, setSupportPhone] = useState('');

  useEffect(() => {
    getPublicSettings()
      .then(({ data }) => {
        setDisabled(data.settings?.paymentsEnabled === false);
        setSupportPhone(data.settings?.supportPhone || '');
      })
      .catch(() => {});
  }, []);

  const last4 = card.number.replace(/\s/g, '').slice(-4);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{13,19}$/.test(card.number.replace(/\s/g, ''))) {
      setError('Enter a valid card number');
      return;
    }
    setLoading(true);
    try {
      const { data } = await payRide(ride._id, {
        method: 'card',
        cardLast4: last4,
        idempotencyKey: `pay-${ride._id}-${Date.now()}`,
      });
      setResult(data.payment);
      if (data.payment.status === 'succeeded') onPaid?.(data.payment);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const amount =
    ride.status === 'completed' ? ride.fare.final : ride.fare.estimated || 0;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-brand-950/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-bold">Pay for your ride</h2>
        <p className="mt-1 text-sm text-muted">
          ${amount.toFixed(2)} · {ride.pickup.address} → {ride.dropoff.address}
        </p>

        {disabled ? (
          <div className="mt-6">
            <div className="rounded-xl bg-gold-50 p-4 text-sm text-ink">
              <p className="font-semibold">Online payments are currently disabled</p>
              <p className="mt-1">
                Pay by cash at pickup, or call {supportPhone || 'support'} to arrange payment.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : result ? (
          <div className="mt-6">
            {result.status === 'succeeded' ? (
              <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
                <p className="font-semibold">Payment succeeded</p>
                <p className="mt-1">Reference: {result.transactionId}</p>
                <p className="mt-1">Receipt emailed to you.</p>
              </div>
            ) : (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">Payment failed</p>
                <p className="mt-1">{result.failureReason || 'Try a different card.'}</p>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              {result.status === 'failed' && (
                <Button variant="secondary" onClick={() => setResult(null)}>Try again</Button>
              )}
              <Button className="flex-1" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <Input
              label="Card number"
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: formatNumber(e.target.value) })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Expiry"
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                required
              />
              <Input
                label="CVC"
                inputMode="numeric"
                placeholder="123"
                value={card.cvc}
                onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-muted">
              Sandbox checkout — no real charge. Cards ending in <b>0002</b> decline (for testing).
            </p>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" loading={loading} className="flex-1">
                Pay ${amount.toFixed(2)}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
