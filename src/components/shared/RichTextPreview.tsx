import { ReactNode } from "react";
import "../../styles/text-editor.css";

interface RichTextProps {
  content: string;
  className?: string;
  children?: ReactNode;
}

const RichText = ({ content, className = "", children }: RichTextProps) => {
  return (
    <div className={`text-editor ${className}`}>
      {children}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default RichText;
