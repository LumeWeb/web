import { CommunicationType } from "@/types/communication";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
const Mail = lazyIcon("Mail");
const MessageSquare = lazyIcon("MessageSquare");
const Reply = lazyIcon("Reply");


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
