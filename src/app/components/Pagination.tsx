import React from "react";
import Button from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  error?: string | null;
  variant?: "default" | "subtle";
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  error = null,
  variant = "default",
}) => {
  if (totalPages <= 1 || loading || error) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();
  const borderClass = variant === "subtle" ? "border-subtle" : "border-white";

  return (
    <div
      className={`flex bg-background border ${borderClass} py-1 px-6 rounded-xl justify-between items-center mt-6`}
    >
      <Button
        variant="transparent"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt; Previous
      </Button>

      <div className="flex items-center gap-2 text-sm">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="text-gray-500">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-1 rounded font-medium ${
                isActive
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:text-dark-primary"
              }`}
            >
              {String(pageNum).padStart(2, "0")}
            </button>
          );
        })}
      </div>

      <Button
        variant="transparent"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next &gt;
      </Button>
    </div>
  );
};

export default Pagination;
