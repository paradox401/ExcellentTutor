import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type ModuleAsset = { _id: string; title: string; fileUrl?: string; videoUrl?: string };
type Module = { _id: string; title: string; summary: string; materials: ModuleAsset[]; videos: ModuleAsset[]; questions: ModuleAsset[] };
type Course = { _id: string; title: string; description: string; modules: Module[] };
type ClassLevel = { _id: string; title: string; grade: string; courses: Course[] };

type Subscription = {
  status: string;
  currentPeriodEnd: string;
  plan?: { name: string; priceNpr: number; description: string };
};

export default function Dashboard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [pendingPayments, setPendingPayments] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [params] = useSearchParams();
  const paymentStatus = params.get("payment");

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const response = await fetch(`${API_URL}/api/v1/subscriptions/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setSubscription(data.subscription ?? null);

      const paymentResponse = await fetch(`${API_URL}/api/v1/payments/manual/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const paymentData = await paymentResponse.json();
      setPendingPayments(paymentData.payments?.length ?? 0);

      const classResponse = await fetch(`${API_URL}/api/v1/catalog/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const classData = await classResponse.json();
      setClasses(classData.classes ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const statusLabel = subscription?.status ?? "NONE";
  const statusAccent =
    statusLabel === "ACTIVE"
      ? "status-pill active"
      : statusLabel === "PAST_DUE"
        ? "status-pill warning"
        : statusLabel === "EXPIRED"
          ? "status-pill danger"
          : "status-pill muted";

  const currentClass = classes[0];
  const allCourses = currentClass?.courses ?? [];
  const allModules = allCourses.flatMap((course) => course.modules ?? []);
  const allAssets = allModules.flatMap((moduleItem) => [
    ...moduleItem.materials,
    ...moduleItem.videos,
    ...moduleItem.questions,
  ]);
  const latestAssets = allAssets.slice(0, 5);
  const featuredCourse = allCourses[0];
  const totalNotes = allModules.reduce((sum, mod) => sum + mod.materials.length, 0);
  const totalVideos = allModules.reduce((sum, mod) => sum + mod.videos.length, 0);
  const totalQuestions = allModules.reduce((sum, mod) => sum + mod.questions.length, 0);

  return (
    <section className="section dashboard">
      <div className="section-title dashboard-header">
        <div>
          <p className="eyebrow">Student Dashboard</p>
          <h2>Welcome back. Let’s keep the momentum.</h2>
          <p className="lead">
            Track your subscription, plan learning, and jump into today’s class.
          </p>
        </div>
        <div className="header-actions">
          <Link className="secondary" to="/courses">
            Browse courses
          </Link>
          <Link className="primary" to="/checkout">
            Manage plan
          </Link>
        </div>
      </div>
      {paymentStatus === "success" && (
        <div className="lock-banner">
          <div>
            <strong>Payment successful</strong>
            <p>Your subscription is now active.</p>
          </div>
        </div>
      )}
      {paymentStatus === "failed" && (
        <div className="lock-banner">
          <div>
            <strong>Payment failed</strong>
            <p>Please try again or choose a different method.</p>
          </div>
          <Link to="/checkout" className="primary">
            Retry payment
          </Link>
        </div>
      )}
      <div className="status-bar">
        <div>
          <strong>Subscription status</strong>
          <div className={statusAccent}>{statusLabel}</div>
          {subscription?.plan?.name && <p>{subscription.plan.name}</p>}
          {subscription?.currentPeriodEnd && (
            <p className="muted">
              Valid until {new Date(subscription.currentPeriodEnd).toDateString()}
            </p>
          )}
        </div>
        <div className="status-actions">
          <Link className="secondary" to="/checkout">
            Manage subscription
          </Link>
          {pendingPayments > 0 && (
            <span className="muted">Pending requests: {pendingPayments}</span>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Learning snapshot</h3>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <p>Plan: {subscription?.plan?.name ?? "No active plan"}</p>
              <p>Courses: {allCourses.length}</p>
              <p className="muted">
                Notes {totalNotes} • Videos {totalVideos} • Questions {totalQuestions}
              </p>
            </>
          )}
          <div className="card-actions">
            <Link className="primary" to="/courses">
              Continue learning
            </Link>
            <Link className="ghost" to="/checkout">
              Upgrade
            </Link>
          </div>
        </article>
        <article className="dashboard-card">
          <h3>Your class</h3>
          <p>{currentClass?.title ?? "Class not set"}</p>
          <p className="muted">Focused content from your class only.</p>
          <div className="card-actions">
            <Link className="secondary" to="/courses">
              View class courses
            </Link>
          </div>
        </article>
        <article className="dashboard-card">
          <h3>Quick actions</h3>
          <div className="quick-actions">
            <Link className="secondary" to="/courses">
              Browse courses
            </Link>
            <Link className="secondary" to="/checkout">
              Renew plan
            </Link>
            <Link className="secondary" to="/viewer">
              Open last lesson
            </Link>
          </div>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card dashboard-wide">
          <div className="card-header-row">
            <h3>Featured course</h3>
            <Link className="ghost" to="/courses">
              See all
            </Link>
          </div>
          {featuredCourse ? (
            <div className="featured-course">
              <div>
                <strong>{featuredCourse.title}</strong>
                <p className="muted">{featuredCourse.description}</p>
                <p>{featuredCourse.modules.length} modules ready</p>
              </div>
              <div className="card-actions">
                <Link className="primary" to={`/courses/${featuredCourse._id}`}>
                  Open course
                </Link>
              </div>
            </div>
          ) : (
            <p className="muted">No courses yet.</p>
          )}
        </article>
        <article className="dashboard-card">
          <h3>Latest materials</h3>
          {latestAssets.length === 0 ? (
            <p className="muted">No materials yet.</p>
          ) : (
            <div className="material-list">
              {latestAssets.map((asset) => (
                <div key={asset._id} className="material-row">
                  <span>{asset.title}</span>
                  <span className="muted">
                    {asset.videoUrl ? "Video" : "Document"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="dashboard-card">
          <h3>Study goals</h3>
          <div className="goal-list">
            <div className="goal-row">
              <div>
                <strong>Finish 2 modules</strong>
                <p className="muted">This week</p>
              </div>
              <span className="goal-pill">1 / 2</span>
            </div>
            <div className="goal-row">
              <div>
                <strong>Attempt 10 model questions</strong>
                <p className="muted">This week</p>
              </div>
              <span className="goal-pill">4 / 10</span>
            </div>
          </div>
        </article>
        <article className="dashboard-card">
          <h3>Announcements</h3>
          <div className="announcement-list">
            <div className="announcement-item">
              <strong>Live class Friday</strong>
              <p className="muted">Algebra sprint at 7:30 PM.</p>
            </div>
            <div className="announcement-item">
              <strong>New notes uploaded</strong>
              <p className="muted">Chapter 4 practice set is ready.</p>
            </div>
          </div>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card dashboard-wide">
          <div className="card-header-row">
            <h3>Recommended for you</h3>
            <span className="muted">Based on your class</span>
          </div>
          <div className="recommend-grid">
            {allModules.slice(0, 4).map((moduleItem) => (
              <div key={moduleItem._id} className="recommend-card">
                <strong>{moduleItem.title}</strong>
                <p className="muted">{moduleItem.summary}</p>
                <div className="card-actions">
                  <Link className="secondary" to="/courses">
                    Open module
                  </Link>
                </div>
              </div>
            ))}
            {allModules.length === 0 && <p className="muted">No modules yet.</p>}
          </div>
        </article>
      </div>
    </section>
  );
}
