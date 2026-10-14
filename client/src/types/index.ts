export interface Property {
  _id?: string;
  id?: string;
  title: string;
  rent: number;
  location?: string;
  lat?: number;
  lng?: number;
  rooms?: number;
  area?: number;
  description?: string;
  images?: string[];
  showOnHome?: boolean;
  createdAt?: string;
}

//  User Interface 
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}