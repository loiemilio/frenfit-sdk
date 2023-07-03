export type SearchRequest = {
  query: string;
  within: 'both' | 'posts' | 'comments';
  feed?: string;
  commenter?: string;
  page?: number;
};
