import { CommunicationType } from "@/types/communication";
import { Mail, MessageSquare, Reply } from "lucide-react";

interface CommunicationTypeIconProps {
  className?: string;
  type: CommunicationType;
}

export function CommunicationTypeIcon({
  className,
  type,
}: CommunicationTypeIconProps) {
  switch (type) {
    case CommunicationType.Email:
      return <Mail className={className} />;
    case CommunicationType.Note:
      return <MessageSquare className={className} />;
    case CommunicationType.Response:
      return <Reply className={className} />;
    default:
      return <MessageSquare className={className} />;
  }
}
