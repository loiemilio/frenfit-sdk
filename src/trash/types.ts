export type TrashedItem = {
  id: number;
  type: 'Message' | 'Comment';
  content: string;
  container?: string;
};
