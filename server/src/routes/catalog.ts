import { Router } from "express";
import { ClassLevel, Course, Module, Material, Video, Question, User } from "../models";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/classes-summary", async (_req, res) => {
  const classes = await ClassLevel.find().sort({ grade: 1 }).lean();
  res.json({ classes });
});

router.get("/classes", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.auth!.userId).lean();
  if (!user?.classLevelId) {
    return res.status(400).json({ message: "Class not set for user." });
  }
  const classes = await ClassLevel.find({ _id: user.classLevelId }).sort({ grade: 1 }).lean();
  const enriched = await Promise.all(
    classes.map(async (classLevel) => {
      const courses = await Course.find({ classLevelId: classLevel._id }).lean();
      const coursesWithModules = await Promise.all(
        courses.map(async (course) => {
          const modules = await Module.find({ courseId: course._id }).lean();
          const modulesWithAssets = await Promise.all(
            modules.map(async (moduleItem) => {
              const [materials, videos, questions] = await Promise.all([
                Material.find({ moduleId: moduleItem._id }).lean(),
                Video.find({ moduleId: moduleItem._id }).lean(),
                Question.find({ moduleId: moduleItem._id }).lean(),
              ]);
              return { ...moduleItem, materials, videos, questions };
            })
          );
          return { ...course, modules: modulesWithAssets };
        })
      );
      return { ...classLevel, courses: coursesWithModules };
    })
  );

  res.json({ classes: enriched });
});

router.get("/courses/:courseId", requireAuth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.auth!.userId).lean();
  if (!user?.classLevelId) {
    return res.status(400).json({ message: "Class not set for user." });
  }
  const course = await Course.findById(req.params.courseId).lean();

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  if (course.classLevelId?.toString() !== user.classLevelId.toString()) {
    return res.status(403).json({ message: "Not allowed for this class." });
  }

  const [classLevel, modules] = await Promise.all([
    ClassLevel.findById(course.classLevelId).lean(),
    Module.find({ courseId: course._id }).lean(),
  ]);

  const modulesWithAssets = await Promise.all(
    modules.map(async (moduleItem) => {
      const [materials, videos, questions] = await Promise.all([
        Material.find({ moduleId: moduleItem._id }).lean(),
        Video.find({ moduleId: moduleItem._id }).lean(),
        Question.find({ moduleId: moduleItem._id }).lean(),
      ]);
      return { ...moduleItem, materials, videos, questions };
    })
  );

  res.json({ course: { ...course, classLevel, modules: modulesWithAssets } });
});

export default router;
