import { DEMO_MODE } from "@/lib/demo";
import { demoApartments } from "./demo";
import { liveApartments } from "./live";

export type {
  ApartmentInput,
  ApartmentsRepository,
  OwnedApartment,
} from "./repository";
export {
  COORDINATES_REQUIRED,
  describeApartmentError,
  type ApartmentErrorDetails,
  type ApartmentField,
} from "./mappers";

export const apartmentsRepository = DEMO_MODE ? demoApartments : liveApartments;

export const DEMO_SAVED_MESSAGE = "Saved in demo mode (not stored)";
