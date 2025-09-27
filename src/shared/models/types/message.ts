import { UniqueIdentifier } from "./unique-identifier";
import { NotificationStatus } from "@/shared/types/notification";

export interface IMessage extends UniqueIdentifier {
  title: string;
  description: string;
  time: string;
  isRead?: boolean;
  status?: NotificationStatus;
}
