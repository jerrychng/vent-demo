import React from "react";
import edit from "../assets/edit.svg";

export type CardProps = React.PropsWithChildren<{
  title?: string;
  editable?: boolean;
  onEdit?: () => void;
  className?: string;
}>;

const Card: React.FC<CardProps> = ({
  title,
  editable = false,
  onEdit,
  className = "",
  children,
}) => {
  return (
    <div
      className={`p-6 flex flex-col gap-3 bg-white rounded-lg border-[0.5px] border-subtle min-w-[230px] min-h-[230px] ${className}`}
    >
      {/* Header (optional) */}
      {title && <p className="font-bold text-primary">{title}</p>}
      <div className={`h-full ${title ? "" : ""}`}>{children}</div>
      {/* Edit button (only when editable) */}
      {editable && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit"
          className="self-end cursor-pointer"
        >
          <img src={edit} alt="Edit" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Card;
