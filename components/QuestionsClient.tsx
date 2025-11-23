"use client";

import { useState, useTransition, useMemo } from "react";
import { coachingInstitutes } from "@/lib/mock-data";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import HTMLRenderer from "@/components/html-renderer";

const QUESTIONS_PER_PAGE = 10;
interface QuestionsClientProps {
  coachingId: string;
  sectionId: string;
}
async function loadQuestions(folder: string, testId: string) {
  try {
    const mod = await import(`@/data/${folder}/${testId}.json`);
    return mod.default ?? mod;
  } catch {
    return [];
  }
}

export default function QuestionsClient({ coachingId, sectionId }: QuestionsClientProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPending, startTransition] = useTransition();

  const coaching = coachingInstitutes.find(c => c.id === coachingId);

  // 🔥 Load all questions ON DEMAND (no useEffect)
  if (!loaded && coaching) {
    startTransition(async () => {
      const merged: any[] = [];

      for (const test of coaching.tests) {
        const qset = await loadQuestions(coaching.folder_name, test.id);
        const filtered = qset.filter(
          (q: any) => String(q.section_id) === String(sectionId)
        );
        merged.push(...filtered);
      }

      setQuestions(merged);
      setLoaded(true);
    });
  }

  const totalPages = loaded
    ? Math.ceil(questions.length / QUESTIONS_PER_PAGE)
    : 1;

  const paginated = useMemo(() => {
    return questions.slice(
      currentPage * QUESTIONS_PER_PAGE,
      (currentPage + 1) * QUESTIONS_PER_PAGE
    );
  }, [questions, currentPage]);

  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href={`/coaching/${coachingId}`}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Coaching
          </Link>

          <h1 className="text-2xl font-bold mt-2">
            Section {sectionId}
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            {loaded ? `${questions.length} Questions` : "Loading..."}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!loaded && <p>Loading questions…</p>}

        {loaded && paginated.map((q: any, idx: number) => (
          <Card key={q.id} className="p-6 mb-6">
            <div className="flex gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/90 text-white flex items-center justify-center font-bold">
                {currentPage * QUESTIONS_PER_PAGE + idx + 1}
              </div>
              <HTMLRenderer html={q.question} />
            </div>

            {/* Options */}
            {[1, 2, 3, 4].map((opt) => {
              const key = `option_${opt}`;
              const isCorrect = q.answer === String(opt);

              return (
                <div
                  key={opt}
                  className={`p-3 mb-2 rounded-lg border-2 ${
                    isCorrect ? "border-green-500 bg-green-50" : "border-border"
                  }`}
                >
                  <b>{String.fromCharCode(64 + opt)}.</b>{" "}
                  <HTMLRenderer html={q[key]} />
                </div>
              );
            })}
          </Card>
        ))}

        {/* Pagination */}
        {loaded && (
          <div className="flex justify-between pt-8 border-t">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 inline" /> Prev
            </button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4 inline" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
