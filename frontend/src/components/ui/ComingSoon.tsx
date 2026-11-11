import React from "react";
import Link from "next/link";
import { Breadcrumbs } from "../layout/Breadcrumbs";
import { Button } from "./Button";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  section: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  section,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Breadcrumbs items={[{ label: title }]} />

      <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg p-10 text-center shadow-sm max-w-2xl mx-auto my-12 space-y-4">
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-full flex items-center justify-center mx-auto text-amber-600">
          <Construction className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {title} &mdash; Coming Soon
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>

        <div className="pt-2">
          <Link href="/hosted-zones">
            <Button variant="primary">Go to Hosted zones</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
