"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { coachingInstitutes } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";

interface Props {
  coachingId: string;
}

export default function SectionFilter({ coachingId }: Props) {
  const [sections, setSections] = useState<
    { id: string; name: string; count: number }[]
  >([]);

  useEffect(() => {
    // 1. Find coaching institute
    const institute = coachingInstitutes.find(
      (ci) => Number(ci.id) === Number(coachingId)
    );
    if (!institute) return;

    // 2. Extract sectionMap (object)
    const sectionMapObj = institute.sectionMap ?? {};

    // 3. Convert object → sorted array
    const list = Object.entries(sectionMapObj)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, name]) => ({
        id,
        name,
        count: 1500, // default 0
      }));

    // 4. Update state
    setSections(list);
  }, [coachingId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 border-t">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Browse by Section
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`/coaching/${coachingId}/section/${section.id}`}
          >
            <Card className="h-full p-6 text-center cursor-pointer transition-all hover:shadow-lg hover:scale-105">
              <div className="text-3xl font-bold text-primary mb-2">
                {section.count}
              </div>
              <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                {section.name}
              </h3>
              <p className="text-xs text-muted-foreground">Questions</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
