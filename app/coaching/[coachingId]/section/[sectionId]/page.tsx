import SectionViewer from "@/components/section-viewer";
import { coachingInstitutes } from "@/lib/mock-data";

interface PageProps {
    params: {
        coachingId: string;
        sectionId: string;
    };
}


interface Props {
    params: Promise<{ coachingId: string; sectionId: string ,questionlist:any}>
}
export async function generateStaticParams() {
    const params: Array<{ coachingId: string; sectionId: string }> = [];

    coachingInstitutes.forEach((coaching) => {
        Object.keys(coaching.sectionMap).forEach((id) => {
            params.push({
                coachingId: coaching.id,
                sectionId: id,
            });
        });
    });

    return params;
}


export async function getQuestionsForSectionInCoaching(coachingId: string, sectionId: string) {
    const coaching = coachingInstitutes.find((c) => c.id === coachingId);
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
    const questions =await  getQuestionsForSectionInCoaching(coachingId, sectionId)

    return (
        <SectionViewer
            coachingId={(await params).coachingId}
            sectionId={(await params).sectionId}
            questionlist={questions}
        />
    );
}
