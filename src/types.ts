export type Card = {
  id: string;
  name: string;
  image: string;
  /** Category used to group cards on the Home page. */
  category?: string;
};

export type Page = 'home' | 'cards' | 'duplicates';
