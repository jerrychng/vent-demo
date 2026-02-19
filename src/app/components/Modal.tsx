interface ModalProps {
  size?: "xs" | "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}
const Modal = (props: ModalProps) => {
  const { children, size, onClick } = props;
  return (
    <div
      onClick={onClick}
      className="absolute top-0 left-0 rouned-lg bg-black/40 z-140 w-full h-full flex justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="min-w-sm max-w-lg min-h-sm max-h-lg bg-white rounded-lg p-6"
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
