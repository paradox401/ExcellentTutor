const classes = [
  {
    grade: "Class 8",
    focus: "Foundation + concept mastery",
    subjects: ["Mathematics", "Science", "English", "Social Studies"],
  },
  {
    grade: "Class 9",
    focus: "Exam strategy + practice",
    subjects: ["Mathematics", "Science", "English", "Computer"],
  },
  {
    grade: "Class 10",
    focus: "Board prep + model questions",
    subjects: ["Mathematics", "Science", "English", "Account"],
  },
];

const features = [
  {
    title: "Structured Learning Paths",
    description: "Notes, videos, and model questions mapped to the official Nepali curriculum.",
  },
  {
    title: "Live Sessions + Recordings",
    description: "Weekly classes with tutors and instant access to replays.",
  },
  {
    title: "Student Progress Insights",
    description: "Track goals, progress, and performance with a clean dashboard.",
  },
  {
    title: "Scalable Content Library",
    description: "Add new classes, subjects, and teachers without changing the core system.",
  },
];

const pricing = [
  {
    plan: "Standard Learning",
    price: "NPR 499",
    cadence: "per month",
    description: "All course materials: notes, tutorial videos, and model questions.",
    perks: ["Full library access", "Downloadable notes", "Practice packs"],
  },
  {
    plan: "Live + Learning",
    price: "NPR 999",
    cadence: "per month",
    description: "Everything in Standard plus live interactive classes with tutors.",
    perks: ["Live weekly classes", "Doubt clearing", "Priority support"],
  },
];

import { Link, Navigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { isAuthed } from "../lib/auth";

const testimonials = [
  {
    name: "Prisha K.",
    role: "Class 10 student",
    quote: "The model questions and live sessions made SEE prep feel organized and easy.",
  },
  {
    name: "Aarav S.",
    role: "Class 9 student",
    quote: "Every topic has notes + video, so revision is fast before exams.",
  },
  {
    name: "Mrs. Sharma",
    role: "Parent",
    quote: "Finally a platform that matches the school syllabus with clarity.",
  },
];

const faqs = [
  {
    q: "How do subscriptions work?",
    a: "Choose a plan, pay once per month, and access all your class materials instantly.",
  },
  {
    q: "Can I switch classes later?",
    a: "Yes. Admin can update your class so you only see relevant materials.",
  },
  {
    q: "Do I get access to live class recordings?",
    a: "Yes, Live + Learning includes live sessions and recorded replays.",
  },
];

export default function Home() {
  if (isAuthed()) {
    return <Navigate to="/dashboard" replace />;
  }
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [counters, setCounters] = useState({
    subjects: 0,
    videos: 0,
    satisfaction: 0,
  });
  const [counterStarted, setCounterStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    const nodes = document.querySelectorAll(".reveal-on-scroll");
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target = heroRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !counterStarted) {
          setCounterStarted(true);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [counterStarted]);

  useEffect(() => {
    if (!counterStarted) return;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCounters({
        subjects: Math.round(300 * progress),
        videos: Math.round(48 * progress),
        satisfaction: Math.round(98 * progress),
      });
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [counterStarted]);

  return (
    <div className="home">
      <section className="hero hero-landing reveal-on-scroll" ref={heroRef}>
        <div className="hero-grid hero-grid-landing stagger">
          <div className="hero-copy">
            <p className="eyebrow">Class 8 to 10 • Nepali Curriculum</p>
            <h1>Excellent Tutor — the modern learning hub built for SEE success.</h1>
            <p className="lead">
              Notes, tutorial videos, and model questions in one premium platform. Built for
              subscription learning and live classes.
            </p>
            <div className="hero-cta">
              <Link className="primary" to="/signup">
                Start learning
              </Link>
              <Link className="secondary" to="/pricing">
                See pricing
              </Link>
            </div>
            <div className="hero-tags">
              <span>Class-based access</span>
              <span>Manual payment flow</span>
              <span>Content that scales</span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-top">
              <strong>Student Dashboard</strong>
              <span>Class 10 · Active</span>
            </div>
            <div className="panel-body">
              <div className="panel-card">
                <p>Mathematics</p>
                <h4>Quadratic Equations</h4>
                <small>3 lessons · 12 questions</small>
              </div>
              <div className="panel-card">
                <p>Science</p>
                <h4>Acids & Bases</h4>
                <small>New video · 18 mins</small>
              </div>
              <div className="panel-card highlight">
                <p>Live Class</p>
                <h4>Algebra Sprint</h4>
                <small>Today · 7:30 PM</small>
              </div>
            </div>
            <div className="panel-footer">
              <div>
                <strong>{counters.subjects}+</strong>
                <span>Model Questions</span>
              </div>
              <div>
                <strong>{counters.videos}+</strong>
                <span>Video Lessons</span>
              </div>
              <div>
                <strong>{counters.satisfaction}%</strong>
                <span>Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="classes" className="section reveal-on-scroll">
        <div className="section-title">
          <p className="eyebrow">Class Coverage</p>
          <h2>Class 8–10 content structured by subject and module.</h2>
        </div>
        <div className="class-grid stagger">
          {classes.map((item) => (
            <article key={item.grade} className="class-card">
              <h3>{item.grade}</h3>
              <p>{item.focus}</p>
              <div className="pill-row">
                {item.subjects.map((subject) => (
                  <span key={subject} className="pill">
                    {subject}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="section highlight reveal-on-scroll">
        <div className="section-title">
          <p className="eyebrow">Why Students Stay</p>
          <h2>Everything needed to learn, practice, and revise.</h2>
        </div>
        <div className="feature-grid stagger">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="section reveal-on-scroll">
        <div className="section-title">
          <p className="eyebrow">Subscriptions</p>
          <h2>Simple pricing for every learner.</h2>
        </div>
        <div className="pricing-grid stagger">
          {pricing.map((plan) => (
            <article key={plan.plan} className="pricing-card">
              <h3>{plan.plan}</h3>
              <div className="price">
                <span>{plan.price}</span>
                <small>{plan.cadence}</small>
              </div>
              <p>{plan.description}</p>
              <ul>
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <Link className="primary" to="/signup">
                Choose plan
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section testimonials reveal-on-scroll">
        <div className="section-title">
          <p className="eyebrow">Success Stories</p>
          <h2>Families trust Excellent Tutor for SEE preparation.</h2>
        </div>
        <div className="testimonial-grid stagger">
          {testimonials.map((item) => (
            <article key={item.name} className="testimonial-card">
              <p>“{item.quote}”</p>
              <strong>{item.name}</strong>
              <span>{item.role}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section faq reveal-on-scroll">
        <div className="section-title">
          <p className="eyebrow">FAQ</p>
          <h2>Quick answers for students and parents.</h2>
        </div>
        <div className="faq-grid stagger">
          {faqs.map((item) => (
            <article key={item.q} className="faq-card">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta reveal-on-scroll">
        <div className="cta-card">
          <h2>Ready to upgrade your study routine?</h2>
          <p>
            Join Excellent Tutor and get structured lessons, practice sets, and live classes
            tailored to your class.
          </p>
          <Link className="secondary" to="/signup">
            Start now
          </Link>
        </div>
      </section>
    </div>
  );
}
