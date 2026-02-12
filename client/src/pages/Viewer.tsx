import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getToken } from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function Viewer() {
  const [params] = useSearchParams();
  const type = params.get("type");
  const url = params.get("url");
  const chaptersParam = params.get("chapters");
  const [zoom, setZoom] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  const safeUrl = useMemo(() => {
    if (!url) {
      return null;
    }
    try {
      const parsed = new URL(url);
      return parsed.toString();
    } catch {
      return null;
    }
  }, [url]);

  const chapters = useMemo(() => {
    if (!chaptersParam) {
      return [
        { label: "Intro", time: 0 },
        { label: "Lesson", time: 120 },
        { label: "Practice", time: 420 },
      ];
    }
    try {
      const decoded = atob(chaptersParam);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        return parsed.filter((c) => typeof c.time === "number" && c.label);
      }
    } catch {
      return [];
    }
    return [];
  }, [chaptersParam]);

  useEffect(() => {
    const loadAccess = async () => {
      const token = getToken();
      if (!token) {
        setChecking(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/v1/subscriptions/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setHasAccess(data.subscription?.status === "ACTIVE");
      } catch {
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };
    loadAccess();
  }, []);

  if (!safeUrl) {
    return (
      <section className="section">
        <p>Invalid content link.</p>
      </section>
    );
  }

  if (checking) {
    return (
      <section className="section">
        <p>Checking access...</p>
      </section>
    );
  }

  if (!hasAccess) {
    return (
      <section className="section">
        <div className="lock-banner">
          <div>
            <strong>Subscription required</strong>
            <p>Please subscribe to access this content.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="section-title">
        <p className="eyebrow">Content Viewer</p>
        <h2>{type === "video" ? "Video Lesson" : "Study Material"}</h2>
      </div>
      <div className="viewer-card">
        <div className="viewer-toolbar">
          <button className="ghost" onClick={() => window.open(safeUrl, "_blank")}>
            Open in new tab
          </button>
          <a className="ghost" href={safeUrl} download>
            Download
          </a>
          {type !== "video" && (
            <div className="viewer-zoom">
              <button className="ghost" onClick={() => setZoom((z) => Math.max(0.75, z - 0.1))}>
                Zoom -
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button className="ghost" onClick={() => setZoom((z) => Math.min(1.75, z + 0.1))}>
                Zoom +
              </button>
            </div>
          )}
        </div>
        {type === "video" ? (
          <div className="viewer-video-grid">
            <video ref={videoRef} controls src={safeUrl} className="viewer-video" />
            <div className="viewer-chapters">
              <h3>Chapters</h3>
              {chapters.length === 0 ? (
                <p className="muted">Chapters will appear when provided by the tutor.</p>
              ) : (
                chapters.map((chapter) => (
                  <button
                    key={`${chapter.label}-${chapter.time}`}
                    className="chapter-item"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = chapter.time;
                        videoRef.current.play();
                      }
                    }}
                  >
                    {chapter.label} · {formatTime(chapter.time)}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <iframe
            className="viewer-frame"
            src={safeUrl}
            title="Document"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          />
        )}
      </div>
    </section>
  );
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
