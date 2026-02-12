import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getToken } from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type Asset = {
  _id: string;
  title: string;
  fileUrl?: string;
  videoUrl?: string;
  chapters?: { label: string; time: number }[];
};

type Module = {
  _id: string;
  title: string;
  summary: string;
  materials: Asset[];
  videos: Asset[];
  questions: Asset[];
};

type Course = {
  _id: string;
  title: string;
  description: string;
  classLevel?: { title: string };
  modules: Module[];
};

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/v1/catalog/courses/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        setCourse(data.course ?? null);
        if (token) {
          const subResponse = await fetch(`${API_URL}/api/v1/subscriptions/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const subData = await subResponse.json();
          setHasAccess(subData.subscription?.status === "ACTIVE");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const lockedMessage = useMemo(() => {
    if (hasAccess) {
      return null;
    }
    return (
      <div className="lock-banner">
        <div>
          <strong>Subscribe to unlock materials</strong>
          <p>Notes, videos, and model questions are available with an active plan.</p>
        </div>
        <Link to="/checkout" className="primary">
          Get access
        </Link>
      </div>
    );
  }, [hasAccess]);

  if (loading) {
    return (
      <section className="section">
        <p>Loading course...</p>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="section">
        <p>Course not found.</p>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-title">
        <p className="eyebrow">{course.classLevel?.title ?? "Course"}</p>
        <h2>{course.title}</h2>
        <p className="lead">{course.description}</p>
      </div>
      {lockedMessage}
      <div className="module-stack">
        {course.modules.map((moduleItem) => (
          <article key={moduleItem._id} className="module-card">
            <div className="module-header">
              <div>
                <h3>{moduleItem.title}</h3>
                <p className="muted">{moduleItem.summary}</p>
              </div>
              <div className="module-badges">
                <span>{moduleItem.materials.length} notes</span>
                <span>{moduleItem.videos.length} videos</span>
                <span>{moduleItem.questions.length} model questions</span>
              </div>
            </div>
            <div className="asset-columns">
              <div>
                <strong>Notes</strong>
                {moduleItem.materials
                  .filter((asset) => asset.fileUrl)
                  .map((asset) => (
                    <Link
                      key={asset._id}
                      to={`/viewer?type=doc&url=${encodeURIComponent(asset.fileUrl ?? "")}`}
                      className={hasAccess ? "asset-link" : "asset-link locked"}
                      onClick={(event) => {
                        if (!hasAccess) {
                          event.preventDefault();
                        }
                      }}
                    >
                      {asset.title}
                    </Link>
                  ))}
              </div>
              <div>
                <strong>Videos</strong>
              {moduleItem.videos
                .filter((asset) => asset.videoUrl)
                .map((asset) => {
                  const chaptersParam = asset.chapters
                    ? encodeURIComponent(btoa(JSON.stringify(asset.chapters)))
                    : "";
                  return (
                    <Link
                      key={asset._id}
                      to={`/viewer?type=video&url=${encodeURIComponent(asset.videoUrl ?? "")}${
                        chaptersParam ? `&chapters=${chaptersParam}` : ""
                      }`}
                      className={hasAccess ? "asset-link" : "asset-link locked"}
                      onClick={(event) => {
                        if (!hasAccess) {
                          event.preventDefault();
                        }
                      }}
                    >
                      {asset.title}
                    </Link>
                  );
                })}
              </div>
              <div>
                <strong>Model Questions</strong>
                {moduleItem.questions
                  .filter((asset) => asset.fileUrl)
                  .map((asset) => (
                    <Link
                      key={asset._id}
                      to={`/viewer?type=doc&url=${encodeURIComponent(asset.fileUrl ?? "")}`}
                      className={hasAccess ? "asset-link" : "asset-link locked"}
                      onClick={(event) => {
                        if (!hasAccess) {
                          event.preventDefault();
                        }
                      }}
                    >
                      {asset.title}
                    </Link>
                  ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
