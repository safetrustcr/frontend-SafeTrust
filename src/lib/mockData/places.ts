import type { Place } from "@/types/destination";

export const DEMO_PLACES: Place[] = [
  { id: "barrio-escalante", name: "Barrio Escalante", province: "San Jósé" },
  { id: "los-yoses", name: "Los Yoses", province: "San Jósé" },
  { id: "paseo-colon", name: "Paseo Colón", province: "San José" },
  { id: "mercedes", name: "Mercedes", province: "Heredia" },
  { id: "heredia-centro", name: "Heredia Centro", province: "Heredia" },
  { id: "rio-segundo", name: "Río Segundo", province: "Alajuela" },
  { id: "el-llano", name: "El Llano", province: "Alajuela" },
  { id: "el-tejar", name: "El Tejar", province: "Cartago" },
  { id: "barrio-el-carmen", name: "Barrio El Carmen", province: "Puntarenas" },
  { id: "barrio-el-cocal", name: "Barrio El Cocal", province: "Puntarenas" },
  { id: "tamarindo", name: "Tamarindo", province: "Guanacaste", aliases: ["playa tamarindo"] },
  { id: "barrio-roosevelt", name: "Barrio Roosevelt", province: "Limón" },
];

export function getPlaceById(id: string) {
  return DEMO_PLACES.find((place) => place.id === id);
}

export function getPlacesByProvince(province: Place["province"]) {
  return DEMO_PLACES.filter((place) => place.province === province);
}

export function getPlaceByProvinceAndId(province: Place["province"], id: string) {
  return DEMO_PLACES.find((place) => place.province === province && place.id === id);
}

export function isValidPlaceForProvince(province: Place["province"], id: string) {
  return getPlaceByProvinceAndId(province, id) !== undefined;
}
