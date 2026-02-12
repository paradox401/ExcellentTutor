import { Link } from "react-router-dom";

const plans = [
  {
    name: "Standard Learning",
    price: "NPR 499",
    cadence: "per month",
    description: "Full access to notes, videos, and model questions.",
    features: ["All subjects", "Practice questions", "Downloadable notes"],
  },
  {
    name: "Live + Learning",
    price: "NPR 999",
    cadence: "per month",
    description: "Everything in Standard plus live interactive classes.",
    features: ["Live weekly sessions", "Tutor support", "Session recordings"],
  },
];

export default function Pricing() {
  return (
    <section className="section">
      <div className="section-title">
        <p className="eyebrow">Pricing</p>
        <h2>Simple, transparent subscription plans.</h2>
      </div>
      <div className="pricing-grid">
        {plans.map((plan) => (
          <article key={plan.name} className="pricing-card">
            <h3>{plan.name}</h3>
            <div className="price">
              <span>{plan.price}</span>
              <small>{plan.cadence}</small>
            </div>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link className="primary" to="/checkout">
              Choose plan
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
