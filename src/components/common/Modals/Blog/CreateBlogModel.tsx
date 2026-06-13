import { Button, Form, Input, Modal } from "antd";
import { toast } from "react-toastify";
import { useCreateBlogMutation } from "../../../../redux/features/blogs/blogApi";
import { TBlogCreateInput } from "../../../../types/blogs";
import ImageUploader from "../../../shared/ImageUploader";
import { FormRichTextEditor } from "../../Forms";
import SwitchStatus2 from "../../Forms/SwitchStatus2";

interface CreateBlogModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateBlogModel: React.FC<CreateBlogModalProps> = ({ open, setOpen }) => {
  const [form] = Form.useForm<TBlogCreateInput>();

  const [createBlog, { isLoading }] = useCreateBlogMutation();

  const onFinish = async (values: TBlogCreateInput) => {
    try {
      const res = await createBlog(values).unwrap();

      if (res?.success) {
        toast.success(res.message || "Blog created successfully!");
        setOpen(false);
        form.resetFields();
      }
    } catch (err: any) {
      toast.error(
        err.data?.message || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={1200}
    >
      <div className="mb-6">
        <h1 className="mb-1 font-semibold text-gray-800 dark:text-white/90 text-2xl">
          Create Blog Post
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fill out the details to create a new blog post.
        </p>
      </div>

      <Form
        form={form}
        name="create-blog"
        onFinish={onFinish}
        layout="vertical"
        size="middle"
        className="space-y-2 w-full"
        initialValues={{
          isActive: true,
        }}
      >
        <Form.Item
          label="Blog Title"
          tooltip="Type the blog title"
          name="title"
          rules={[{ required: true, message: "Please enter the blog title!" }]}
        >
          <Input placeholder="e.g., 10 Healthy Breakfast Recipes" />
        </Form.Item>

        <Form.Item name="imageId" label="Featured Image (Optional)">
          <ImageUploader fieldPath="imageId" form={form} />
        </Form.Item>

        <Form.Item
          label="Short Description"
          name="shortDesc"
          tooltip="Brief summary that appears in blog listings"
        >
          <Input.TextArea
            placeholder="Enter a brief summary of the blog post..."
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <FormRichTextEditor
          label="Description"
          name="description"
          height={300}
          rules={[
            {
              required: true,
              message: "Please enter the description.",
            },
          ]}
          placeholder="Enter description"
        />
        <Form.Item
          label="Status"
          name="isActive"
          valuePropName="checked"
          initialValue={true}
        >
          <SwitchStatus2 />
        </Form.Item>

        <div className="flex justify-start gap-2 w-full mt-5">
          <Button
            onClick={() => {
              setOpen(false);
              form.resetFields();
            }}
            type="default"
            htmlType="button"
            className="px-5!"
          >
            Cancel
          </Button>

          <Button
            loading={isLoading}
            type="primary"
            htmlType="submit"
            className="px-5!"
          >
            Create Blog
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateBlogModel;
