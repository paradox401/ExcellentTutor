import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type ModuleAsset = {
  _id: string;
  title: string;
  fileUrl?: string;
  videoUrl?: string;
};

type Module = {
  _id: string;
  title: string;
  summary: string;
  materials: ModuleAsset[];
  videos: ModuleAsset[];
  questions: ModuleAsset[];
};

type Course = {
  _id: string;
  title: string;
  description: string;
  modules: Module[];
};

type ClassLevel = {
  _id: string;
  title: string;
  grade: string;
  courses: Course[];
};

export default function Courses() {
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [assetFilter, setAssetFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/v1/catalog/classes`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        setClasses(data.classes ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="section">
      <div className="section-title">
        <p className="eyebrow">Course Library</p>
        <h2>Every class, every subject, organized beautifully.</h2>
      </div>
      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <>
          <div className="filter-bar">
            <input
              placeholder="Search courses or modules..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select value={assetFilter} onChange={(event) => setAssetFilter(event.target.value)}>
              <option value="all">All content</option>
              <option value="notes">Notes</option>
              <option value="videos">Videos</option>
              <option value="questions">Model questions</option>
            </select>
          </div>
          <div className="course-grid">
            {classes.map((level) => {
              const filteredCourses = level.courses.filter((course) => {
                const matchQuery =
                  course.title.toLowerCase().includes(query.toLowerCase()) ||
                  course.description.toLowerCase().includes(query.toLowerCase()) ||
                  course.modules.some((moduleItem) =>
                    moduleItem.title.toLowerCase().includes(query.toLowerCase())
                  );
                const matchAsset =
                  assetFilter === "all"
                    ? true
                    : course.modules.some((moduleItem) => {
                        if (assetFilter === "notes") return moduleItem.materials.length > 0;
                        if (assetFilter === "videos") return moduleItem.videos.length > 0;
                        return moduleItem.questions.length > 0;
                      });
                return matchQuery && matchAsset;
              });

              if (filteredCourses.length === 0) {
                return null;
              }

              return (
                <article key={level._id} className="course-card">
                  <div className="course-head">
                    <h3>{level.title}</h3>
                    <span>{filteredCourses.length} courses</span>
                  </div>
                  <div className="course-body">
                    {filteredCourses.map((course) => (
                      <div key={course._id} className="course-item">
                        <strong>
                          <Link to={`/courses/${course._id}`}>{course.title}</Link>
                        </strong>
                        <p>{course.description}</p>
                        <small>{course.modules.length} modules ready</small>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
