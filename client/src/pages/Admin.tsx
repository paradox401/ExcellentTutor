import { useEffect, useState } from "react";
import { getToken } from "../lib/auth";
import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type ClassLevel = { _id: string; title: string; grade: string };
type Course = { _id: string; title: string; classLevelId: string };
type Module = { _id: string; title: string; courseId: string };
type MaterialItem = { _id: string; title: string; moduleId: string; fileUrl: string };
type VideoItem = {
  _id: string;
  title: string;
  moduleId: string;
  videoUrl: string;
  chapters?: { label: string; time: number }[];
};
type QuestionItem = { _id: string; title: string; moduleId: string; fileUrl: string };
type LiveSessionItem = {
  _id: string;
  title: string;
  courseId: string;
  meetingUrl: string;
  scheduledAt: string;
};

type RoleCheck = { user?: { role?: string } };

export default function Admin() {
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [classes, setClasses] = useState<ClassLevel[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSessionItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [classTitle, setClassTitle] = useState("");
  const [classGrade, setClassGrade] = useState("GRADE_8");
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseClass, setCourseClass] = useState("");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleSummary, setModuleSummary] = useState("");
  const [moduleCourse, setModuleCourse] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  const [assetTitle, setAssetTitle] = useState("");
  const [assetModule, setAssetModule] = useState("");
  const [assetUrl, setAssetUrl] = useState("");
  const [assetType, setAssetType] = useState("materials");
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [assetChapters, setAssetChapters] = useState("");
  const [assetError, setAssetError] = useState<string | null>(null);
  const [assetClassFilter, setAssetClassFilter] = useState<string>("all");
  const [assetSubjectFilter, setAssetSubjectFilter] = useState<string>("all");

  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionCourse, setSessionCourse] = useState("");
  const [sessionUrl, setSessionUrl] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "structure" | "assets" | "live" | "payments" | "users"
  >("structure");
  const [params] = useSearchParams();
  const [paymentRequests, setPaymentRequests] = useState<
    {
      payment: { _id: string; amountNpr: number; note?: string; proofUrl?: string };
      user: { id: string; name: string; email: string } | null;
    }[]
  >([]);
  const [users, setUsers] = useState<
    {
      id: string;
      name: string;
      email: string;
      role: string;
      classLevelId?: string;
      classTitle?: string | null;
      subscriptionStatus: string;
      planName?: string | null;
    }[]
  >([]);

  useEffect(() => {
    const tab = params.get("tab");
    if (
      tab === "structure" ||
      tab === "assets" ||
      tab === "live" ||
      tab === "payments" ||
      tab === "users"
    ) {
      setActiveTab(tab);
    }
  }, [params]);

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) {
        setChecking(false);
        return;
      }
      const me = await fetch(`${API_URL}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData: RoleCheck = await me.json();
      setRole(meData.user?.role ?? null);

      if (meData.user?.role === "ADMIN") {
        await loadOverview(token);
        await loadPayments(token);
        await loadUsers(token);
      }
      setChecking(false);
    };

    load();
  }, []);

  const loadOverview = async (token: string) => {
    const response = await fetch(`${API_URL}/api/v1/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setClasses(data.classes ?? []);
    setCourses(data.courses ?? []);
    setModules(data.modules ?? []);
    setMaterials(data.materials ?? []);
    setVideos(data.videos ?? []);
    setQuestions(data.questions ?? []);
    setLiveSessions(data.liveSessions ?? []);
    setCourseClass(data.classes?.[0]?._id ?? "");
    setModuleCourse(data.courses?.[0]?._id ?? "");
    setAssetModule(data.modules?.[0]?._id ?? "");
    setSessionCourse(data.courses?.[0]?._id ?? "");
  };

  const loadPayments = async (token: string) => {
    const response = await fetch(`${API_URL}/api/v1/admin/payments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setPaymentRequests(data.payments ?? []);
  };

  const loadUsers = async (token: string) => {
    const response = await fetch(`${API_URL}/api/v1/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setUsers(data.users ?? []);
  };

  const callAdmin = async (
    path: string,
    body: Record<string, string | number | object | undefined> = {}
  ) => {
    const token = getToken();
    if (!token) {
      setMessage("Please log in as admin.");
      return;
    }
    const payload = Object.fromEntries(
      Object.entries(body).filter(([, value]) => value !== undefined)
    );
    const response = await fetch(`${API_URL}/api/v1/admin/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message ?? "Action failed");
      return;
    }
    setMessage("Saved successfully.");
    await loadOverview(token);
    await loadPayments(token);
  };

  const callAdminDelete = async (path: string) => {
    const token = getToken();
    if (!token) {
      setMessage("Please log in as admin.");
      return;
    }
    const response = await fetch(`${API_URL}/api/v1/admin/${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json();
      setMessage(data.message ?? "Delete failed");
      return;
    }
    setMessage("Deleted successfully.");
    await loadOverview(token);
    await loadPayments(token);
    await loadUsers(token);
  };

  const handleUpload = async (file: File) => {
    const token = getToken();
    if (!token) {
      setMessage("Please log in as admin.");
      return;
    }
    const maxBytes = 200 * 1024 * 1024;
    if (file.size > maxBytes) {
      setAssetError("File too large. Max size is 200MB.");
      return;
    }
    setAssetError(null);
    setUploading(true);
    setUploadProgress(0);
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/api/v1/uploads/single`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setAssetUrl(data.url);
          setMessage("File uploaded. Now save the asset.");
        } else {
          setMessage(data.message ?? "Upload failed");
        }
      } catch {
        setMessage("Upload failed.");
      }
      setUploading(false);
    };
    xhr.onerror = () => {
      setMessage("Upload failed.");
      setUploading(false);
    };
    xhr.send(form);
  };

  const parseChapters = () => {
    if (!assetChapters.trim()) {
      return undefined;
    }
    const lines = assetChapters.split("\n");
    const chapters = lines
      .map((line) => {
        const [timeText, ...labelParts] = line.trim().split(" ");
        const label = labelParts.join(" ").trim();
        const time = parseTimeToSeconds(timeText);
        if (!label || time === null) {
          return null;
        }
        return { label, time };
      })
      .filter((item): item is { label: string; time: number } => Boolean(item));
    return chapters.length ? chapters : undefined;
  };

  const parseTimeToSeconds = (text: string) => {
    if (!text) return null;
    const parts = text.split(":").map((part) => Number(part));
    if (parts.some((p) => Number.isNaN(p))) {
      return null;
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return null;
  };

  const toTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (checking) {
    return (
      <section className="section">
        <p>Loading admin console...</p>
      </section>
    );
  }

  if (role !== "ADMIN") {
    return (
      <section className="section">
        <div className="section-title">
          <p className="eyebrow">Admin</p>
          <h2>Access restricted</h2>
        </div>
        <p className="muted">You need an admin account to manage content.</p>
      </section>
    );
  }

  return (
    <section className="section admin-shell">
      <div className="section-title admin-header">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h2>Content operations, built for scale.</h2>
          <p className="muted">Create structure, upload assets, and schedule live sessions.</p>
        </div>
        <div className="admin-actions">
          <button
            className="secondary"
            onClick={() => {
              const token = getToken();
              if (token) {
                loadOverview(token);
                loadPayments(token);
                loadUsers(token);
              }
            }}
          >
            Refresh data
          </button>
          <button className="primary" onClick={() => setActiveTab("assets")}>
            Upload content
          </button>
        </div>
      </div>

      {message && <p className="auth-message">{message}</p>}

      <div className="admin-stats">
        <div className="stat-card">
          <span>Classes</span>
          <strong>{classes.length}</strong>
        </div>
        <div className="stat-card">
          <span>Courses</span>
          <strong>{courses.length}</strong>
        </div>
        <div className="stat-card">
          <span>Modules</span>
          <strong>{modules.length}</strong>
        </div>
        <div className="stat-card">
          <span>Uploads</span>
          <strong>{modules.length * 3}</strong>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === "structure" ? "tab active" : "tab"}
          onClick={() => setActiveTab("structure")}
        >
          Structure
        </button>
        <button
          className={activeTab === "assets" ? "tab active" : "tab"}
          onClick={() => setActiveTab("assets")}
        >
          Assets
        </button>
        <button
          className={activeTab === "live" ? "tab active" : "tab"}
          onClick={() => setActiveTab("live")}
        >
          Live Sessions
        </button>
        <button
          className={activeTab === "payments" ? "tab active" : "tab"}
          onClick={() => setActiveTab("payments")}
        >
          Payments
        </button>
        <button
          className={activeTab === "users" ? "tab active" : "tab"}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>

      {activeTab === "structure" && (
        <div className="admin-grid">
          <div className="admin-card">
            <h3>{editingClassId ? "Edit Class" : "Create Class"}</h3>
            <label>
              Grade
              <select value={classGrade} onChange={(e) => setClassGrade(e.target.value)}>
                <option value="GRADE_8">Class 8</option>
                <option value="GRADE_9">Class 9</option>
                <option value="GRADE_10">Class 10</option>
              </select>
            </label>
            <label>
              Title
              <input value={classTitle} onChange={(e) => setClassTitle(e.target.value)} />
            </label>
            <button
              className="primary"
              onClick={() =>
                editingClassId
                  ? callAdmin(`classes/${editingClassId}`, {
                      grade: classGrade,
                      title: classTitle,
                    })
                  : callAdmin("classes", { grade: classGrade, title: classTitle })
              }
            >
              {editingClassId ? "Update class" : "Save class"}
            </button>
            {editingClassId && (
              <button
                className="secondary"
                onClick={() => {
                  setEditingClassId(null);
                  setClassTitle("");
                  setClassGrade("GRADE_8");
                }}
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="admin-card">
            <h3>{editingCourseId ? "Edit Course" : "Create Course"}</h3>
            <label>
              Class
              <select value={courseClass} onChange={(e) => setCourseClass(e.target.value)}>
                {classes.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
            </label>
            <label>
              Description
              <input value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} />
            </label>
            <button
              className="primary"
              onClick={() =>
                editingCourseId
                  ? callAdmin(`courses/${editingCourseId}`, {
                      title: courseTitle,
                      description: courseDesc,
                      classLevelId: courseClass,
                    })
                  : callAdmin("courses", {
                      title: courseTitle,
                      description: courseDesc,
                      classLevelId: courseClass,
                    })
              }
            >
              {editingCourseId ? "Update course" : "Save course"}
            </button>
            {editingCourseId && (
              <button
                className="secondary"
                onClick={() => {
                  setEditingCourseId(null);
                  setCourseTitle("");
                  setCourseDesc("");
                }}
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="admin-card">
            <h3>{editingModuleId ? "Edit Module" : "Create Module"}</h3>
            <label>
              Course
              <select value={moduleCourse} onChange={(e) => setModuleCourse(e.target.value)}>
                {courses.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} />
            </label>
            <label>
              Summary
              <input value={moduleSummary} onChange={(e) => setModuleSummary(e.target.value)} />
            </label>
            <button
              className="primary"
              onClick={() =>
                editingModuleId
                  ? callAdmin(`modules/${editingModuleId}`, {
                      title: moduleTitle,
                      summary: moduleSummary,
                      courseId: moduleCourse,
                    })
                  : callAdmin("modules", {
                      title: moduleTitle,
                      summary: moduleSummary,
                      courseId: moduleCourse,
                    })
              }
            >
              {editingModuleId ? "Update module" : "Save module"}
            </button>
            {editingModuleId && (
              <button
                className="secondary"
                onClick={() => {
                  setEditingModuleId(null);
                  setModuleTitle("");
                  setModuleSummary("");
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
          <div className="admin-card admin-card-wide">
            <h3>Structure tree</h3>
            {classes.length === 0 ? (
              <p className="muted">No classes yet.</p>
            ) : (
              <div className="tree">
                {classes.map((classItem) => {
                  const classCourses = courses.filter(
                    (course) => course.classLevelId === classItem._id
                  );
                  return (
                    <div key={classItem._id} className="tree-node">
                      <div className="tree-row tree-row-root">
                        <div className="tree-title">
                          <span>{classItem.title}</span>
                          <small>{classItem.grade}</small>
                        </div>
                        <div className="row-actions">
                          <button
                            className="secondary"
                            onClick={() => {
                              setEditingClassId(classItem._id);
                              setClassTitle(classItem.title);
                              setClassGrade(classItem.grade);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="ghost"
                            onClick={() => callAdminDelete(`classes/${classItem._id}`)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="tree-children">
                        {classCourses.length === 0 ? (
                          <p className="muted">No courses yet.</p>
                        ) : (
                          classCourses.map((course) => {
                            const courseModules = modules.filter(
                              (moduleItem) => moduleItem.courseId === course._id
                            );
                            return (
                              <div key={course._id} className="tree-node">
                                <div className="tree-row">
                                  <div className="tree-title">
                                    <span>{course.title}</span>
                                    <small>Course</small>
                                  </div>
                                  <div className="row-actions">
                                    <button
                                      className="secondary"
                                      onClick={() => {
                                        setEditingCourseId(course._id);
                                        setCourseTitle(course.title);
                                        setCourseClass(course.classLevelId);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="ghost"
                                      onClick={() => callAdminDelete(`courses/${course._id}`)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                <div className="tree-children">
                                  {courseModules.length === 0 ? (
                                    <p className="muted">No modules yet.</p>
                                  ) : (
                                    courseModules.map((moduleItem) => (
                                      <div key={moduleItem._id} className="tree-row">
                                        <div className="tree-title">
                                          <span>{moduleItem.title}</span>
                                          <small>Module</small>
                                        </div>
                                        <div className="row-actions">
                                          <button
                                            className="secondary"
                                            onClick={() => {
                                              setEditingModuleId(moduleItem._id);
                                              setModuleTitle(moduleItem.title);
                                              setModuleCourse(moduleItem.courseId);
                                            }}
                                          >
                                            Edit
                                          </button>
                                          <button
                                            className="ghost"
                                            onClick={() =>
                                              callAdminDelete(`modules/${moduleItem._id}`)
                                            }
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "assets" && (
        <div className="admin-grid">
          <div className="admin-card admin-card-wide">
            <div className="admin-card-header">
              <div>
                <h3>Upload Asset</h3>
                <p className="muted">Attach notes, model questions, or tutorial videos.</p>
              </div>
              <span className="pill">Storage: Cloudinary</span>
            </div>
            <div className="asset-filters">
              <label>
                Filter class
                <select
                  value={assetClassFilter}
                  onChange={(e) => setAssetClassFilter(e.target.value)}
                >
                  <option value="all">All classes</option>
                  {classes.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Filter subject
                <select
                  value={assetSubjectFilter}
                  onChange={(e) => setAssetSubjectFilter(e.target.value)}
                >
                  <option value="all">All subjects</option>
                  {courses.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="admin-form-grid">
              <label>
                Module
                <select value={assetModule} onChange={(e) => setAssetModule(e.target.value)}>
                  {modules.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Asset type
                <select value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                  <option value="materials">Notes</option>
                  <option value="videos">Video</option>
                  <option value="questions">Model Question</option>
                </select>
              </label>
              <label>
                Title
                <input value={assetTitle} onChange={(e) => setAssetTitle(e.target.value)} />
              </label>
              <label>
                Asset URL
                <input value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)} />
              </label>
              {assetType === "videos" && (
                <label className="chapter-field">
                  Video chapters (one per line, e.g. 00:00 Intro)
                  <textarea
                    value={assetChapters}
                    onChange={(e) => setAssetChapters(e.target.value)}
                    rows={4}
                  />
                  <button
                    type="button"
                    className="secondary"
                    onClick={() =>
                      setAssetChapters("00:00 Intro\n02:00 Key concepts\n06:30 Practice questions")
                    }
                  >
                    Auto generate
                  </button>
                </label>
              )}
              <label>
                Upload file
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUpload(file);
                    }
                  }}
                />
              </label>
              <div className="admin-upload-actions">
                <button
                  className="primary"
                  disabled={uploading}
                  onClick={() => {
                    if (assetType === "videos") {
                      const path = editingAssetId ? `videos/${editingAssetId}` : "videos";
                      callAdmin(path, {
                        title: assetTitle,
                        moduleId: assetModule,
                        videoUrl: assetUrl,
                        chapters: parseChapters(),
                      });
                    } else if (assetType === "questions") {
                      const path = editingAssetId ? `questions/${editingAssetId}` : "questions";
                      callAdmin(path, {
                        title: assetTitle,
                        moduleId: assetModule,
                        fileUrl: assetUrl,
                      });
                    } else {
                      const path = editingAssetId ? `materials/${editingAssetId}` : "materials";
                      callAdmin(path, {
                        title: assetTitle,
                        moduleId: assetModule,
                        fileUrl: assetUrl,
                      });
                    }
                  }}
                >
                  {uploading
                    ? "Uploading..."
                    : editingAssetId
                      ? "Update asset"
                      : "Save asset"}
                </button>
                <button className="secondary" onClick={() => setAssetUrl("")}>
                  Clear link
                </button>
                {editingAssetId && (
                  <button
                    className="secondary"
                    onClick={() => {
                      setEditingAssetId(null);
                      setAssetTitle("");
                      setAssetUrl("");
                      setAssetChapters("");
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </div>
              {assetError && <p className="muted">{assetError}</p>}
              {uploading && (
                <div className="upload-progress">
                  <div style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
            <div className="asset-lists">
              {classes
                .filter((cls) => assetClassFilter === "all" || cls._id === assetClassFilter)
                .map((cls) => {
                  const classCourses = courses.filter((c) => c.classLevelId === cls._id);
                  return (
                    <div key={cls._id} className="asset-class-block">
                      <div className="asset-class-header">
                        <strong>{cls.title}</strong>
                        <span>{classCourses.length} subjects</span>
                      </div>
                      {classCourses
                        .filter(
                          (course) =>
                            assetSubjectFilter === "all" || course._id === assetSubjectFilter
                        )
                        .map((course) => {
                          const courseModules = modules.filter(
                            (m) => m.courseId === course._id
                          );
                          const moduleIds = courseModules.map((m) => m._id);
                          const courseMaterials = materials.filter((m) =>
                            moduleIds.includes(m.moduleId)
                          );
                          const courseVideos = videos.filter((v) =>
                            moduleIds.includes(v.moduleId)
                          );
                          const courseQuestions = questions.filter((q) =>
                            moduleIds.includes(q.moduleId)
                          );
                          return (
                            <div key={course._id} className="asset-subject-block">
                              <div className="asset-subject-header">
                                <strong>{course.title}</strong>
                                <span>{courseModules.length} modules</span>
                              </div>
                              <div className="asset-columns">
                                <div>
                                  <strong>Notes</strong>
                                  {courseMaterials.map((item) => (
                                    <div key={item._id} className="structure-row">
                                      <span>{item.title}</span>
                                      <div className="row-actions">
                                        <button
                                          className="ghost"
                                          onClick={() => {
                                            setEditingAssetId(item._id);
                                            setAssetType("materials");
                                            setAssetTitle(item.title);
                                            setAssetModule(item.moduleId);
                                            setAssetUrl(item.fileUrl);
                                          }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className="ghost"
                                          onClick={() => callAdminDelete(`materials/${item._id}`)}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <strong>Videos</strong>
                                  {courseVideos.map((item) => (
                                    <div key={item._id} className="structure-row">
                                      <span>{item.title}</span>
                                      <div className="row-actions">
                                        <button
                                          className="ghost"
                                          onClick={() => {
                                            setEditingAssetId(item._id);
                                            setAssetType("videos");
                                            setAssetTitle(item.title);
                                            setAssetModule(item.moduleId);
                          setAssetUrl(item.videoUrl);
                          setAssetChapters(
                            item.chapters
                              ? item.chapters.map((c) => `${toTimestamp(c.time)} ${c.label}`).join("\n")
                              : ""
                          );
                        }}
                      >
                                          Edit
                                        </button>
                                        <button
                                          className="ghost"
                                          onClick={() => callAdminDelete(`videos/${item._id}`)}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <strong>Model Questions</strong>
                                  {courseQuestions.map((item) => (
                                    <div key={item._id} className="structure-row">
                                      <span>{item.title}</span>
                                      <div className="row-actions">
                                        <button
                                          className="ghost"
                                          onClick={() => {
                                            setEditingAssetId(item._id);
                                            setAssetType("questions");
                                            setAssetTitle(item.title);
                                            setAssetModule(item.moduleId);
                                            setAssetUrl(item.fileUrl);
                                          }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          className="ghost"
                                          onClick={() => callAdminDelete(`questions/${item._id}`)}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "live" && (
        <div className="admin-grid">
          <div className="admin-card">
            <h3>{editingSessionId ? "Edit Live Session" : "Create Live Session"}</h3>
            <label>
              Course
              <select value={sessionCourse} onChange={(e) => setSessionCourse(e.target.value)}>
                {courses.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} />
            </label>
            <label>
              Meeting URL
              <input value={sessionUrl} onChange={(e) => setSessionUrl(e.target.value)} />
            </label>
            <label>
              Schedule
              <input
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </label>
            <button
              className="primary"
              onClick={() =>
                editingSessionId
                  ? callAdmin(`live-sessions/${editingSessionId}`, {
                      title: sessionTitle,
                      courseId: sessionCourse,
                      meetingUrl: sessionUrl,
                      scheduledAt: sessionDate ? new Date(sessionDate).toISOString() : "",
                    })
                  : callAdmin("live-sessions", {
                      title: sessionTitle,
                      courseId: sessionCourse,
                      meetingUrl: sessionUrl,
                      scheduledAt: sessionDate ? new Date(sessionDate).toISOString() : "",
                    })
              }
            >
              {editingSessionId ? "Update session" : "Save session"}
            </button>
            {editingSessionId && (
              <button
                className="secondary"
                onClick={() => {
                  setEditingSessionId(null);
                  setSessionTitle("");
                  setSessionUrl("");
                  setSessionDate("");
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
          <div className="admin-card">
            <h3>Upcoming sessions</h3>
            <div className="timeline">
              {liveSessions.length === 0 ? (
                <p className="muted">No sessions yet.</p>
              ) : (
                liveSessions.map((session) => (
                  <div key={session._id} className="timeline-item">
                    <span>{session.title}</span>
                    <small>{new Date(session.scheduledAt).toLocaleString()}</small>
                    <div className="row-actions">
                      <button
                        className="ghost"
                        onClick={() => {
                          setEditingSessionId(session._id);
                          setSessionTitle(session.title);
                          setSessionCourse(session.courseId);
                          setSessionUrl(session.meetingUrl);
                          setSessionDate(
                            new Date(session.scheduledAt).toISOString().slice(0, 16)
                          );
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="ghost"
                        onClick={() => callAdminDelete(`live-sessions/${session._id}`)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="admin-grid">
          <div className="admin-card admin-card-wide">
            <h3>Manual payment requests</h3>
            {paymentRequests.length === 0 ? (
              <p className="muted">No pending requests.</p>
            ) : (
              <div className="payment-list">
                {paymentRequests.map((item) => (
                  <div key={item.payment._id} className="payment-row">
                    <div>
                      <strong>{item.user?.name ?? "Unknown user"}</strong>
                      <p className="muted">{item.user?.email ?? "No email"}</p>
                      {item.payment.note && <p>Note: {item.payment.note}</p>}
                      {item.payment.proofUrl && (
                        <a href={item.payment.proofUrl} target="_blank" rel="noreferrer">
                          View proof
                        </a>
                      )}
                    </div>
                    <div className="payment-actions">
                      <span>NPR {item.payment.amountNpr}</span>
                      <button
                        className="primary"
                        onClick={() => callAdmin(`payments/${item.payment._id}/approve`, {})}
                      >
                        Approve
                      </button>
                      <button
                        className="secondary"
                        onClick={() => callAdmin(`payments/${item.payment._id}/reject`, {})}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="admin-grid">
          <div className="admin-card admin-card-wide">
            <h3>Users by subscription status</h3>
            <div className="user-groups">
              {["ACTIVE", "PAST_DUE", "CANCELED", "EXPIRED", "NONE"].map((status) => {
                const group = users.filter((u) => u.subscriptionStatus === status);
                return (
                  <div key={status} className="user-group">
                    <div className="user-group-head">
                      <strong>{status}</strong>
                      <span>{group.length} users</span>
                    </div>
                    {group.length === 0 ? (
                      <p className="muted">No users in this group.</p>
                    ) : (
                      group.map((user) => (
                        <div key={user.id} className="user-row">
                          <div>
                            <strong>{user.name}</strong>
                            <p className="muted">{user.email}</p>
                          </div>
                          <div className="user-meta">
                            <span>{user.planName ?? "No plan"}</span>
                            <span>{user.classTitle ?? "No class"}</span>
                            <span>{user.role}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
