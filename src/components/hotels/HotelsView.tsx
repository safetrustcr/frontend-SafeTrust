import HotelBookingContainer from "./overall/HotelBookingContainer";
import { PageContainer } from "@/components/layouts/PageContainer";

const HotelsView = () => {
  return (
    <PageContainer className="flex min-h-screen py-10">
      <div className="flex-1">
        <HotelBookingContainer />
      </div>
    </PageContainer>
  );
};

export default HotelsView;
