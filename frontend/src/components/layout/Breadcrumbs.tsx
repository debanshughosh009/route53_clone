import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 py-2.5 select-none">
      <Link href="/hosted-zones" className="hover:text-aws-blue hover:underline">
        Route 53
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-aws-blue hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
