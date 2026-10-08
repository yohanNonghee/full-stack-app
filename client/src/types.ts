export interface Property {
  _id?: string;
  title: string;
  description: string;
  rent: number;
  utilities: number;
  address: string;
  neighborhood: string;
  size: number;
  bedrooms: number;
  lat: number;
  lng: number;
  images: string[];
}