import ContactButton from "./ContactButton";
import FavoriteButton from "./FavoriteButton";
import ReportButton from "./ReportButton";
import ShareButton from "./ShareButton";

const RoomActionBar = () => {
  return (
    <div className="flex flex-col gap-4 py-4 px-14 justify-center w-max">
      <div>
        <FavoriteButton />
      </div>
      <div className="flex items-center justify-between">
        <ShareButton />
        <ContactButton />
        <ReportButton />
      </div>
    </div>
  );
};
export default RoomActionBar;
