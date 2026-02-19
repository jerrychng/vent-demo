import chumleyLogo from "../assets/chumley_logo.svg";
import SvgIcon from "./SvgIcon";

const ChumleyLogo = () => {
  return (
    <div className="h-12 overflow-y-visible bg-background p-2 flex items-center justify-center gap-2 text-xs">
      <span className="text-text-dark-gray">powered by:</span>
      <SvgIcon
        svg={chumleyLogo}
        size={72}
        alt="Chumley Logo"
        color="text-dark-gray"
      />
    </div>
  );
};

export default ChumleyLogo;
