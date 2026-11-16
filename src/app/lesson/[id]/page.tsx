import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LESSONS, lessonById } from "@/content";
import { LessonView } from "@/components/LessonView";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

async function Lesson({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = lessonById(id);
  if (!lesson) notFound();
  return <LessonView key={lesson.id} lesson={lesson} />;
}

export default function LessonPage({ params }: PageProps<"/lesson/[id]">) {
  return (
    <Suspense fallback={null}>
      <Lesson params={params} />
    </Suspense>
  );
}
