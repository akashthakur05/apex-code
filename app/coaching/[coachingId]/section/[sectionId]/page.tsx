import { ProtectedLayout } from "@/components/protected-layout";
import SectionViewer from "@/components/section-viewer";
import { Suspense } from "react";

interface PageProps {
  params: {
    coachingId: string;
    sectionId: string;
  };
}

/* ======================================================
   LOAD MASTER DATA (STATIC SAFE)
====================================================== */

async function loadCoachingData() {
  const data = await import('@/lib/data.json')
  return data.default ?? data
}

interface Props {
  params: Promise<{ coachingId: string; sectionId: string, questionlist: any }>
}
export async function generateStaticParams() {
  const params: { coachingId: string; sectionId: string }[] = [];

  const coachingInstitutes = await loadCoachingData();

  for (const coaching of coachingInstitutes) {
    if (!coaching.sectionMap) continue;

    for (const sectionId of Object.keys(coaching.sectionMap)) {
      params.push({
        coachingId: String(coaching.id),
        sectionId: String(sectionId),
      });
    }
  }

  return params;
}



export async function getQuestionsForSectionInCoaching(coachingId: string, sectionId: string) {
  const coachingInstitutes = await loadCoachingData() as any;

  const coaching = coachingInstitutes.find((c: { id: string; }) => c.id === coachingId);
  if (!coaching) return [];

  const folder = coaching.folder_name;

  // Load all test JSON files asynchronously
  const data = await import(`@/data/${folder}/Section/${sectionId}.json`);
  // console.log(data, `@/data/${folder}/Section/${sectionId}.json`)

  // Flatten all tests → filter by section

  return data.default;
}


export default async function SectionQuestionsPage({ params }: Props) {
  const { coachingId, sectionId } = await params
  const questions = await getQuestionsForSectionInCoaching(coachingId, sectionId)

  return (
    <ProtectedLayout>
      <Suspense fallback={null}>
        <SectionViewer
          coachingId={(await params).coachingId}
          sectionId={(await params).sectionId}
          questionlist={questions}
        />
      </Suspense>
    </ProtectedLayout>

  );
}
