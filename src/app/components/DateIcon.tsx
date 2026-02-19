import { displayDate } from "../utils/utils";
import SvgIcon from "./SvgIcon";
import Calendar from "../assets/calendar.svg";

const DateIcon = ({ date }: { date: string }) => {
  const formattedDate = displayDate(date);
  return (
    <div className="inline-flex items-center flex-nowrap gap-1 rounded-full border border-subtle px-2 py-1 text-dark-primary">
      <SvgIcon svg={Calendar} size={12} color="dark-primary" />
      <p className="text-xs whitespace-nowrap shrink-0">{formattedDate}</p>
    </div>
  );
};

export default DateIcon;
