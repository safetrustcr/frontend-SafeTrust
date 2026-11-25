import type { Place } from "../model/types";

/**
 * Neighborhoods and towns that have at least one demo listing. To add a town
 * (e.g. Cahuita or Puerto Viejo), add a listing there first, then the place.
 * `demo-places.test.ts` keeps the catalog and the listings in sync.
 */
export const DEMO_PLACES: Place[] = [
  { id: "barrio-escalante", name: "Barrio Escalante", province: "San José" },
  { id: "los-yoses", name: "Los Yoses", province: "San José" },
  { id: "paseo-colon", name: "Paseo Colón", province: "San José" },
  { id: "mercedes", name: "Mercedes", province: "Heredia" },
  { id: "heredia-centro", name: "Heredia Centro", province: "Heredia" },
  { id: "rio-segundo", name: "Río Segundo", province: "Alajuela" },
  { id: "el-llano", name: "El Llano", province: "Alajuela" },
  { id: "el-tejar", name: "El Tejar", province: "Cartago" },
  { id: "barrio-el-carmen", name: "Barrio El Carmen", province: "Puntarenas" },
  { id: "barrio-el-cocal", name: "Barrio El Cocal", province: "Puntarenas" },
  {
    id: "tamarindo",
    name: "Tamarindo",
    province: "Guanacaste",
    aliases: ["playa tamarindo"],
  },
  { id: "barrio-roosevelt", name: "Barrio Roosevelt", province: "Limón" },
];
