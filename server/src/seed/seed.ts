import "dotenv/config";
import bcrypt from "bcrypt";
import { connectMongo } from "../lib/mongo";
import {
  ClassLevel,
  Course,
  Module,
  Material,
  Video,
  Question,
  SubscriptionPlan,
  User,
} from "../models";

const run = async () => {
  await connectMongo();

  // Class levels
  const class8 = await ClassLevel.findOneAndUpdate(
    { grade: "GRADE_8" },
    { title: "Class 8" },
    { upsert: true, returnDocument: "after" }
  );
  const class9 = await ClassLevel.findOneAndUpdate(
    { grade: "GRADE_9" },
    { title: "Class 9" },
    { upsert: true, returnDocument: "after" }
  );
  const class10 = await ClassLevel.findOneAndUpdate(
    { grade: "GRADE_10" },
    { title: "Class 10" },
    { upsert: true, returnDocument: "after" }
  );

  // Plans
  await SubscriptionPlan.findOneAndUpdate(
    { name: "Standard Learning" },
    {
      priceNpr: 499,
      billingCycle: "MONTHLY",
      description: "Access to notes, model questions, and recorded videos.",
    },
    { upsert: true, returnDocument: "after" }
  );
  await SubscriptionPlan.findOneAndUpdate(
    { name: "Live + Learning" },
    {
      priceNpr: 999,
      billingCycle: "MONTHLY",
      description: "Everything in Standard, plus live sessions with tutors.",
    },
    { upsert: true, returnDocument: "after" }
  );

  const curriculum = [
    {
      classId: class8!._id,
      courses: [
        {
          title: "Mathematics",
          description: "Integers, algebraic expressions, and geometry basics.",
          modules: [
            {
              title: "Algebraic Expressions",
              summary: "Simplify expressions and apply identities.",
              assets: {
                notes: "algebraic-expressions-notes.pdf",
                video: "algebraic-expressions.mp4",
                questions: "algebraic-expressions-questions.pdf",
              },
            },
            {
              title: "Geometry: Triangles",
              summary: "Properties of triangles and angle theorems.",
              assets: {
                notes: "triangles-notes.pdf",
                video: "triangles-theorems.mp4",
                questions: "triangles-questions.pdf",
              },
            },
          ],
        },
        {
          title: "Science",
          description: "Cell structure, force, and energy fundamentals.",
          modules: [
            {
              title: "Cell Structure",
              summary: "Plant and animal cells, functions of organelles.",
              assets: {
                notes: "cell-structure-notes.pdf",
                video: "cell-structure.mp4",
                questions: "cell-structure-questions.pdf",
              },
            },
            {
              title: "Force and Motion",
              summary: "Newton's laws and basic motion concepts.",
              assets: {
                notes: "force-motion-notes.pdf",
                video: "force-motion.mp4",
                questions: "force-motion-questions.pdf",
              },
            },
          ],
        },
        {
          title: "English",
          description: "Grammar, comprehension, and writing practice.",
          modules: [
            {
              title: "Tenses Review",
              summary: "Present, past, and future tense structures.",
              assets: {
                notes: "tenses-notes.pdf",
                video: "tenses-review.mp4",
                questions: "tenses-questions.pdf",
              },
            },
          ],
        },
      ],
    },
    {
      classId: class9!._id,
      courses: [
        {
          title: "Mathematics",
          description: "Quadratic equations, geometry, and statistics.",
          modules: [
            {
              title: "Quadratic Equations",
              summary: "Factorization and formula methods.",
              assets: {
                notes: "quadratic-notes.pdf",
                video: "quadratic-equations.mp4",
                questions: "quadratic-questions.pdf",
              },
            },
            {
              title: "Statistics",
              summary: "Mean, median, mode, and data interpretation.",
              assets: {
                notes: "statistics-notes.pdf",
                video: "statistics-basics.mp4",
                questions: "statistics-questions.pdf",
              },
            },
          ],
        },
        {
          title: "Science",
          description: "Chemistry basics and physics of sound/light.",
          modules: [
            {
              title: "Atoms and Molecules",
              summary: "Structure of matter and chemical bonding.",
              assets: {
                notes: "atoms-molecules-notes.pdf",
                video: "atoms-molecules.mp4",
                questions: "atoms-molecules-questions.pdf",
              },
            },
            {
              title: "Sound and Light",
              summary: "Wave properties and applications.",
              assets: {
                notes: "sound-light-notes.pdf",
                video: "sound-light.mp4",
                questions: "sound-light-questions.pdf",
              },
            },
          ],
        },
      ],
    },
    {
      classId: class10!._id,
      courses: [
        {
          title: "Mathematics",
          description: "SEE preparation: algebra, geometry, and mensuration.",
          modules: [
            {
              title: "Set, Logic, and Function",
              summary: "Basic set operations and functions.",
              assets: {
                notes: "set-logic-functions-notes.pdf",
                video: "set-logic-functions.mp4",
                questions: "set-logic-functions-questions.pdf",
              },
            },
            {
              title: "Mensuration",
              summary: "Surface area and volume formulas.",
              assets: {
                notes: "mensuration-notes.pdf",
                video: "mensuration.mp4",
                questions: "mensuration-questions.pdf",
              },
            },
          ],
        },
        {
          title: "Science",
          description: "SEE preparation: chemistry, biology, physics.",
          modules: [
            {
              title: "Acid, Base, and Salt",
              summary: "Indicators, reactions, and pH.",
              assets: {
                notes: "acids-bases-salts-notes.pdf",
                video: "acids-bases-salts.mp4",
                questions: "acids-bases-salts-questions.pdf",
              },
            },
            {
              title: "Human Body Systems",
              summary: "Digestive, respiratory, and circulatory systems.",
              assets: {
                notes: "human-body-systems-notes.pdf",
                video: "human-body-systems.mp4",
                questions: "human-body-systems-questions.pdf",
              },
            },
          ],
        },
      ],
    },
  ];

  for (const level of curriculum) {
    for (const courseItem of level.courses) {
      const course = await Course.findOneAndUpdate(
        { title: courseItem.title, classLevelId: level.classId },
        {
          title: courseItem.title,
          description: courseItem.description,
          classLevelId: level.classId,
        },
        { upsert: true, returnDocument: "after" }
      );

      for (const moduleItem of courseItem.modules) {
        const moduleDoc = await Module.findOneAndUpdate(
          { title: moduleItem.title, courseId: course!._id },
          {
            title: moduleItem.title,
            summary: moduleItem.summary,
            courseId: course!._id,
          },
          { upsert: true, returnDocument: "after" }
        );

        const base = `https://example.com/${level.classId.toString()}`;

        await Material.findOneAndUpdate(
          { title: moduleItem.title + " Notes", moduleId: moduleDoc!._id },
          {
            title: moduleItem.title + " Notes",
            fileUrl: `${base}/notes/${moduleItem.assets.notes}`,
            moduleId: moduleDoc!._id,
          },
          { upsert: true, returnDocument: "after" }
        );

        await Video.findOneAndUpdate(
          { title: moduleItem.title + " Video", moduleId: moduleDoc!._id },
          {
            title: moduleItem.title + " Video",
            videoUrl: `${base}/videos/${moduleItem.assets.video}`,
            moduleId: moduleDoc!._id,
          },
          { upsert: true, returnDocument: "after" }
        );

        await Question.findOneAndUpdate(
          { title: moduleItem.title + " Model Questions", moduleId: moduleDoc!._id },
          {
            title: moduleItem.title + " Model Questions",
            fileUrl: `${base}/questions/${moduleItem.assets.questions}`,
            moduleId: moduleDoc!._id,
          },
          { upsert: true, returnDocument: "after" }
        );
      }
    }
  }

  // Sample admin + student
  const adminEmail = "admin@excellenttutor.com";
  const studentEmail = "student@excellenttutor.com";
  const passwordHash = await bcrypt.hash("Password123", 10);

  await User.findOneAndUpdate(
    { email: adminEmail },
    {
      name: "Admin User",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      classLevelId: class10!._id,
    },
    { upsert: true, returnDocument: "after" }
  );

  await User.findOneAndUpdate(
    { email: studentEmail },
    {
      name: "Sample Student",
      email: studentEmail,
      passwordHash,
      role: "STUDENT",
      classLevelId: class8!._id,
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log("Seeding complete.");
  console.log("Admin: admin@excellenttutor.com / Password123");
  console.log("Student: student@excellenttutor.com / Password123");
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
