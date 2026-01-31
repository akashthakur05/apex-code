"use client";

import Link from "next/link";
import data from "@/lib/data.json";
import { Card } from "@/components/ui/card";

interface Props {
  coachingId: string;
}

export default function SectionFilter({ coachingId }: Props) {
  // 1. Find coaching institute
  const institute = data.find(
    (ci) => String(ci.id) === String(coachingId)
  );

  if (!institute || !institute.sectionMap) {
    return null;
  }

  // 2. Convert sectionMap → sorted array
  const sections = Object.entries(institute.sectionMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, name]) => ({
      id,
      name: String(name),
      count: 1500, // placeholder
    }));

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
