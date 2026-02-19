import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        style: {
          border: "1px solid #cbd5e1",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        success: {
          style: {
            background: "#ffffff",
            color: "#17325e",
          },
        },
        error: {
          style: {
            background: "#faedea !important", // light-red
            color: "#812f1d !important", // dark-red
            // border: "1px solid #d15134 !important", // highlight-red
          },
        },
        warning: {
          style: {
            background: "#fef5ec !important", // light-orange
            color: "#a35c0a !important", // orange
            // border: "1px solid #f29630 !important", // highlight-orange
          },
        },
        info: {
          style: {
            background: "#f7f9fd !important", // background
            color: "#17325e !important", // dark-primary
            // border: "1px solid #27549d !important", // primary
          },
        },
      }}
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "#1e293b",
          "--normal-border": "#cbd5e1",
          "--border-radius": "0.75rem",
          "--error-bg": "#faedea",
          "--error-text": "#812f1d",
          "--error-border": "#d15134",
          "--success-bg": "#17325e",
          "--success-text": "#17325e",
          "--success-border": "#17325e",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
