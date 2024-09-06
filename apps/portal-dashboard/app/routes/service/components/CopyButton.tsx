import useCopy from "../hooks/useCopy";
import BareCopyButton from "./BareCopyButton";

interface CopyButtonProps {
  text: string;
  showText?: boolean;
  animate?: boolean;
}

export const CopyButton = ({
  text,
  animate = true,
  showText = true,
}: CopyButtonProps) => {
  const { copied, copyToClipboard } = useCopy(animate ? 500 : 0);

  const handleCopy = () => copyToClipboard(text);

  return (
    <div className="flex items-center space-x-2">
      {showText && (
        <span>{text.length > 20 ? `${text.slice(0, 20)}...` : text}</span>
      )}
      <BareCopyButton onClick={handleCopy} copied={copied} />
    </div>
  );
};
