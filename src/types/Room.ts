export interface Room {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  owned?: boolean;
  ownerId?: string;
}
