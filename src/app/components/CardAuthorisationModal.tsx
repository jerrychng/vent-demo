import React from "react";
import Button from "./Button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertSquareIcon } from "@hugeicons/core-free-icons";
import SvgIcon from "../components/SvgIcon";
import LockYellowIcon from "../assets/lock_circle_yellow.svg";

interface CardAuthorisationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidateCard: () => void;
  isLoading?: boolean;
}

const CardAuthorisationModal: React.FC<CardAuthorisationModalProps> = ({
  isOpen,
  onClose,
  onValidateCard,
  isLoading = false,
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 p-6 flex flex-col items-center">
        {/* Title Section */}
        <div className="mb-6 flex items-center gap-2 text-dark-primary">
          <HugeiconsIcon icon={AlertSquareIcon} className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Card Registration</h3>
        </div>

        {/* Information Section */}
        <div className="mb-6 bg-background rounded-lg border-subtle border p-4 flex flex-col gap-3">
          <p className="">
            Please <b>confirm your card details</b> with our secure gateway to
            finalise your booking.
          </p>
          <p className="">
            If you do not confirm within the next 15 minutes, you will receive
            an email to complete this process at a later time.
          </p>
        </div>

        {/* Button Section */}
        <div className="flex flex-col md:flex-row gap-6 justify-end pt-4 w-full">
          <Button
            variant="primary"
            onClick={onValidateCard}
            disabled={isLoading}
            className="flex-1 w-full flex gap-1"
            size="md"
          >
            <SvgIcon
              svg={LockYellowIcon}
              size={20}
              color={`${isLoading ? "gray" : "accent"}`}
            />
            {isLoading ? "Registering..." : "Register Card"}
          </Button>
          <Button
            variant="primaryOutline"
            onClick={onClose}
            disabled={isLoading}
            size="md"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CardAuthorisationModal;
