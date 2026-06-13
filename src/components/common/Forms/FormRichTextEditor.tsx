import { Form } from "antd";
import { Rule } from "antd/es/form";
import InputError from "./InputError";
import RichTextEditor from "./RichTextEditor";

interface FormRichTextEditorProps {
  name: any;
  label?: string;
  value?: string;
  rules?: Rule[];
  placeholder?: string;
  fieldError?: Record<string, string>;
  setFieldError?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  height?: number;
  readOnly?: boolean;
}

const FormRichTextEditor = ({
  name,
  label,
  rules,
  placeholder,
  fieldError = {},
  height = 480,
  value,
  readOnly,
  setFieldError = () => {},
  ...rest
}: FormRichTextEditorProps) => {
  return (
    <Form.Item name={name} label={label} rules={rules}>
      <RichTextEditor
        value={
          value !== undefined && value !== null ? String(value) : undefined
        }
        placeholder={placeholder}
        onChange={() => setFieldError?.((prev) => ({ ...prev, [name]: "" }))}
        height={height}
        readOnly={readOnly}
        {...rest}
      />
      {fieldError?.[name] && <InputError>{fieldError[name]}</InputError>}
    </Form.Item>
  );
};

export default FormRichTextEditor;
