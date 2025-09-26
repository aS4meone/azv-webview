import { IUser, UserRole } from "@/shared/models/types/user";

import { UserData } from "./UserData";
import { EditName } from "./EditName";
import UserDocumentsData from "./documents/UserDocumentsData";
import { FinancialRejection } from "./FinancialRejection";
import { ModerationStatus } from "./ModerationStatus";

const GetUserData = ({
  user,
  getUser,
  isLoading,
}: {
  user: IUser | null;
  getUser: () => void;
  isLoading: boolean;
}) => {
  return !user || isLoading ? (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : (
        <div className="flex-1 space-y-6 overflow-y-auto">
          {/* Warning Components - Show at the top */}
          <ModerationStatus user={user} getUser={getUser} />
          <FinancialRejection user={user} />

      {/* Personal Information */}
      <EditName user={user} />

      {/* Documents Section */}
      {(user.role === UserRole.USER ||
        user.role === UserRole.PENDING || 
        user.role === UserRole.CLIENT || 
        user.role === UserRole.PENDINGTOFIRST || 
        user.role === UserRole.REJECTFIRSTDOC) && (
          <UserDocumentsData user={user} getUser={getUser} />
        )}
    </div>
  );
};

export default GetUserData;
