import { useEffect, useState } from "react";
import { getToken } from "../lib/auth";
import qrImage from "../assets/esewa-qr.jpg";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type Plan = {
  _id: string;
  name: string;
  priceNpr: number;
  description: string;
};

export default function Checkout() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/subscriptions/plans`);
        const data = await response.json();
        setPlans(data.plans ?? []);
        if (data.plans?.length) {
          setSelectedPlan(data.plans[0]._id);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubscribe = async () => {
    const token = getToken();
    if (!token) {
      setMessage("Please log in to subscribe.");
      return;
    }

    try {
      setProcessing(true);
      setMessage(null);
      const response = await fetch(`${API_URL}/api/v1/payments/manual/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: selectedPlan, note }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message ?? "Request failed");
        return;
      }
      setMessage("Payment request submitted. Await admin confirmation.");
    } catch (error) {
      setMessage("Something went wrong.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="section">
      <div className="section-title">
        <p className="eyebrow">Checkout</p>
        <h2>Choose your plan and payment method.</h2>
      </div>

      {loading ? (
        <p>Loading plans...</p>
      ) : (
        <div className="checkout-grid">
          <div className="checkout-card">
            <h3>Plans</h3>
            <div className="checkout-options">
              {plans.map((plan) => (
                <label key={plan._id} className="option">
                  <input
                    type="radio"
                    name="plan"
                    value={plan._id}
                    checked={selectedPlan === plan._id}
                    onChange={() => setSelectedPlan(plan._id)}
                  />
                  <div>
                    <strong>{plan.name}</strong>
                    <p>{plan.description}</p>
                  </div>
                  <span>NPR {plan.priceNpr}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="checkout-card">
            <h3>Pay via eSewa</h3>
            <p className="muted">Scan the QR and complete payment, then submit confirmation.</p>
            <img className="qr-image" src={qrImage} alt="eSewa QR" />
            <label>
              Payment note (optional)
              <input value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <button className="primary" onClick={handleSubscribe} disabled={processing}>
              {processing ? "Submitting..." : "I have paid"}
            </button>
            {message && <p className="auth-message">{message}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
