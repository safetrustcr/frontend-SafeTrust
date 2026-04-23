import { BackButton } from "./BackButton";
import { Breadcrumbs } from "./Breadcrumbs";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface NavigationHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  backButtonFallback?: string;
  className?: string;
}

export const NavigationHeader = ({ 
  breadcrumbs, 
  backButtonFallback, 
  className = "" 
}: NavigationHeaderProps) => {
  return (
    <div className={` border-b  ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackButton fallbackTo={backButtonFallback} />
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      </div>
    </div>
  );
};