import { UniqueIdentifier } from "./unique-identifier";

export interface IMessage extends UniqueIdentifier {
  title: string;
  description: string;
  time: string;
  isRead?: boolean;
}
