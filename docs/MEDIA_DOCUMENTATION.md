# 📸 Media Upload & Selection System Documentation

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Component API](#component-api)
- [Implementation Examples](#implementation-examples)
- [User Experience Flow](#user-experience-flow)
- [Advanced Features](#advanced-features)
- [Form Handling](#form-handling)
- [Best Practices](#best-practices)
- [Integration Checklist](#integration-checklist)
- [Common Issues & Solutions](#common-issues--solutions)
- [Technical Implementation Details](#technical-implementation-details)

## Overview

The Enhanced Media Upload & Selection System provides a unified interface for uploading new images and selecting from existing media in your forms. It supports both single and multiple image selection modes with real-time updates and auto-selection of uploaded images.

### Key Features

- ✅ **Upload & Select in one workflow**
- ✅ **Auto-selection of uploaded images**
- ✅ **Real-time media list updates**
- ✅ **Single and multiple selection modes**
- ✅ **Visual selection indicators**
- ✅ **Folder organization support**
- ✅ **Responsive grid layout**
- ✅ **Error handling & user feedback**

## 🚀 Quick Start

### Installation

The system is already integrated into your project. No additional installation required.

### Basic Usage

```tsx
import ImageUploader from "../../shared/ImageUploader";

// Single image selection
<Form.Item name="logo" label="Logo">
  <ImageUploader fieldPath="logo" form={form} />
</Form.Item>

// Multiple image selection
<Form.Item name="gallery" label="Gallery Images">
  <ImageUploader fieldPath="gallery" form={form} multiple={true} />
</Form.Item>
```

## 📋 Component API

### ImageUploader Props

| Prop        | Type           | Default  | Description                                                   |
| ----------- | -------------- | -------- | ------------------------------------------------------------- |
| `form`      | `FormInstance` | Required | Ant Design form instance                                      |
| `fieldPath` | `string`       | Required | Form field path (supports nested paths like "product.images") |
| `multiple`  | `boolean`      | `false`  | Enable multiple image selection                               |

### Form Data Structure

#### Single Selection

```tsx
// Form field value
logo: "https://example.com/image.jpg"; // string URL
```

#### Multiple Selection

```tsx
// Form field value
gallery: [
  "https://example.com/image1.jpg",
  "https://example.com/image2.jpg",
  "https://example.com/image3.jpg",
]; // array of string URLs
```

## 🎯 Implementation Examples

### 1. Brand Creation Form (CreateBrandModal)

```tsx
import { Modal, Form, Input, Select, Button } from "antd";
import ImageUploader from "../../shared/ImageUploader";

const CreateBrandModal = ({ open, setOpen }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    console.log("Form values:", values);
    // values.logo: string URL
    // values.gallery: string[] URLs

    try {
      await createBrand(values);
      setOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Error creating brand:", error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={false}
      width={800}
    >
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Create Brand</h1>
        <p className="text-gray-500">
          Fill out the details to create a new brand.
        </p>
      </div>

      <Form form={form} onFinish={onFinish} layout="vertical">
        {/* Single Image Selection */}
        <Form.Item
          name="logo"
          label="Brand Logo"
          rules={[{ required: true, message: "Please upload a brand logo" }]}
        >
          <ImageUploader fieldPath="logo" form={form} />
        </Form.Item>

        {/* Multiple Image Selection */}
        <Form.Item name="gallery" label="Brand Gallery (Optional)">
          <ImageUploader fieldPath="gallery" form={form} multiple={true} />
        </Form.Item>

        <Form.Item
          name="name"
          label="Brand Name"
          rules={[{ required: true, message: "Please enter brand name" }]}
        >
          <Input placeholder="Enter brand name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} placeholder="Enter brand description" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Create Brand
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateBrandModal;
```

### 2. Product Creation Form

```tsx
const CreateProductModal = ({ open, setOpen }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await createProduct({
        ...values,
        // values.thumbnail: string (single image)
        // values.images: string[] (multiple images)
        // values.details.coverImage: string (nested field)
      });
      setOpen(false);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <Modal open={open} onCancel={() => setOpen(false)} width={900}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Product thumbnail */}
        <Form.Item
          name="thumbnail"
          label="Product Thumbnail"
          rules={[
            { required: true, message: "Please upload a product thumbnail" },
          ]}
        >
          <ImageUploader fieldPath="thumbnail" form={form} />
        </Form.Item>

        {/* Product gallery */}
        <Form.Item name="images" label="Product Images">
          <ImageUploader fieldPath="images" form={form} multiple={true} />
        </Form.Item>

        {/* Nested field example */}
        <Form.Item name={["details", "coverImage"]} label="Cover Image">
          <ImageUploader fieldPath="details.coverImage" form={form} />
        </Form.Item>

        <Form.Item name="name" label="Product Name">
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Create Product
        </Button>
      </Form>
    </Modal>
  );
};
```

### 3. User Profile Form

```tsx
const UserProfileForm = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await updateUserProfile({
        ...values,
        // values.avatar: string
        // values.portfolio: string[]
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      {/* Profile picture */}
      <Form.Item name="avatar" label="Profile Picture">
        <ImageUploader fieldPath="avatar" form={form} />
      </Form.Item>

      {/* Portfolio images */}
      <Form.Item name="portfolio" label="Portfolio Images">
        <ImageUploader fieldPath="portfolio" form={form} multiple={true} />
      </Form.Item>

      <Form.Item name="name" label="Full Name">
        <Input placeholder="Enter your name" />
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Update Profile
      </Button>
    </Form>
  );
};
```

### 4. Category Management

```tsx
const CreateCategoryModal = ({ open, setOpen }) => {
  const [form] = Form.useForm();

  return (
    <Modal open={open} onCancel={() => setOpen(false)}>
      <Form form={form} layout="vertical">
        {/* Category icon */}
        <Form.Item name="icon" label="Category Icon">
          <ImageUploader fieldPath="icon" form={form} />
        </Form.Item>

        {/* Category banner */}
        <Form.Item name="banner" label="Category Banner">
          <ImageUploader fieldPath="banner" form={form} />
        </Form.Item>

        {/* Category gallery */}
        <Form.Item name="gallery" label="Category Images">
          <ImageUploader fieldPath="gallery" form={form} multiple={true} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
```

## 🎨 User Experience Flow

### Single Image Selection

```
📱 User clicks "Upload Image"
    ↓
🔄 Modal opens with upload area + existing images
    ↓
📤 User uploads new image → auto-selected ✅
    OR
🖼️ User clicks existing image → selected ✅
    ↓
✅ User clicks "Select" → image applied to form field
```

### Multiple Image Selection

```
📱 User clicks "Upload Images"
    ↓
🔄 Modal opens with upload area + existing images
    ↓
📤 User uploads multiple images → all auto-selected ✅
    AND/OR
🖼️ User clicks existing images → toggle selection ✅
    ↓
✅ User clicks "Select (3)" → all selected images applied to form field
```

### Upload & Select Workflow

```
📤 User drags & drops new images
    ↓
⚡ Images upload automatically
    ↓
✅ Uploaded images auto-added to selection
    ↓
🎯 User can continue selecting existing images
    ↓
💾 Final selection applied to form
```

## 🔧 Advanced Features

### 1. Nested Form Fields

```tsx
// For complex nested structures
<ImageUploader fieldPath="product.variant.images" form={form} multiple={true} />
<ImageUploader fieldPath="user.profile.avatar" form={form} />
<ImageUploader fieldPath="settings.branding.logo" form={form} />
```

### 2. Dynamic Arrays (Form.List)

```tsx
// For dynamic form lists
<Form.List name="products">
  {(fields, { add, remove }) => (
    <>
      {fields.map((field, index) => (
        <div key={field.key}>
          <Form.Item
            name={[field.name, "image"]}
            label={`Product ${index + 1} Image`}
          >
            <ImageUploader fieldPath={`products.${index}.image`} form={form} />
          </Form.Item>

          <Form.Item
            name={[field.name, "gallery"]}
            label={`Product ${index + 1} Gallery`}
          >
            <ImageUploader
              fieldPath={`products.${index}.gallery`}
              form={form}
              multiple={true}
            />
          </Form.Item>

          <Button onClick={() => remove(field.name)}>Remove Product</Button>
        </div>
      ))}
      <Button onClick={() => add()}>Add Product</Button>
    </>
  )}
</Form.List>
```

### 3. Conditional Rendering

```tsx
const [showGallery, setShowGallery] = useState(false);

<Form.Item name="hasGallery" valuePropName="checked">
  <Checkbox onChange={(e) => setShowGallery(e.target.checked)}>
    Enable Image Gallery
  </Checkbox>
</Form.Item>;

{
  showGallery && (
    <Form.Item name="gallery" label="Gallery Images">
      <ImageUploader fieldPath="gallery" form={form} multiple={true} />
    </Form.Item>
  );
}
```

### 4. Validation

```tsx
<Form.Item
  name="logo"
  label="Logo"
  rules={[
    { required: true, message: "Please upload a logo" },
    {
      validator: (_, value) => {
        if (value && !value.includes('logo')) {
          return Promise.reject("Logo URL should contain 'logo' in filename");
        }
        return Promise.resolve();
      }
    }
  ]}
>
  <ImageUploader fieldPath="logo" form={form} />
</Form.Item>

// Multiple images validation
<Form.Item
  name="gallery"
  rules={[
    { required: true, message: "At least one image is required" },
    {
      validator: (_, value) => {
        if (value && value.length > 10) {
          return Promise.reject("Maximum 10 images allowed");
        }
        if (value && value.length < 2) {
          return Promise.reject("Minimum 2 images required");
        }
        return Promise.resolve();
      }
    }
  ]}
>
  <ImageUploader fieldPath="gallery" form={form} multiple={true} />
</Form.Item>
```

## 📝 Form Handling

### Getting Form Values

```tsx
const onFinish = (values) => {
  console.log("Single image:", values.logo);
  // "https://example.com/image.jpg"

  console.log("Multiple images:", values.gallery);
  // ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]

  console.log("Nested image:", values.product.thumbnail);
  // "https://example.com/product-thumb.jpg"
};
```

### Setting Initial Values

```tsx
// For edit forms
const initialValues = {
  logo: "https://existing-logo.jpg",
  gallery: ["https://existing-img1.jpg", "https://existing-img2.jpg"],
  product: {
    thumbnail: "https://existing-thumb.jpg",
  },
};

<Form form={form} initialValues={initialValues}>
  <ImageUploader fieldPath="logo" form={form} />
  <ImageUploader fieldPath="gallery" form={form} multiple={true} />
  <ImageUploader fieldPath="product.thumbnail" form={form} />
</Form>;
```

### Form Reset

```tsx
const handleReset = () => {
  form.resetFields();
  // This will clear all ImageUploader components
};

const handleClearSpecificField = () => {
  form.setFieldValue(["gallery"], null);
  // This will clear only the gallery field
};
```

### Dynamic Form Updates

```tsx
const handleProductTypeChange = (type) => {
  if (type === "digital") {
    // Clear physical product images
    form.setFieldValue(["physicalImages"], null);
  } else {
    // Clear digital product images
    form.setFieldValue(["digitalAssets"], null);
  }
};
```

## 🎯 Best Practices

### 1. Form Field Naming

```tsx
// ✅ Good - Clear and descriptive
<ImageUploader fieldPath="brandLogo" form={form} />
<ImageUploader fieldPath="productImages" form={form} multiple={true} />
<ImageUploader fieldPath="userAvatar" form={form} />
<ImageUploader fieldPath="categoryBanner" form={form} />

// ❌ Avoid - Generic names
<ImageUploader fieldPath="image" form={form} />
<ImageUploader fieldPath="pics" form={form} />
<ImageUploader fieldPath="img" form={form} />
```

### 2. Proper Validation

```tsx
// Required field validation
<Form.Item
  name="avatar"
  rules={[{ required: true, message: "Profile picture is required" }]}
>
  <ImageUploader fieldPath="avatar" form={form} />
</Form.Item>

// Custom validation
<Form.Item
  name="gallery"
  rules={[
    {
      validator: (_, value) => {
        if (value && value.length > 5) {
          return Promise.reject("Maximum 5 images allowed");
        }
        return Promise.resolve();
      }
    }
  ]}
>
  <ImageUploader fieldPath="gallery" form={form} multiple={true} />
</Form.Item>
```

### 3. Loading States

```tsx
const CreateBrandModal = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await createBrand(values);
      setOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} confirmLoading={loading} onCancel={() => setOpen(false)}>
      <Form form={form} onFinish={onFinish}>
        <ImageUploader fieldPath="logo" form={form} />
        <Button type="primary" htmlType="submit" loading={loading}>
          Create Brand
        </Button>
      </Form>
    </Modal>
  );
};
```

### 4. Error Handling

```tsx
const onFinish = async (values) => {
  try {
    await createProduct(values);
    message.success("Product created successfully!");
  } catch (error) {
    if (error.message.includes("image")) {
      message.error("Please check your image uploads and try again");
    } else {
      message.error("Something went wrong. Please try again.");
    }
  }
};
```

### 5. Accessibility

```tsx
<Form.Item
  name="logo"
  label="Company Logo"
  tooltip="Upload your company logo. Recommended size: 200x200px"
>
  <ImageUploader fieldPath="logo" form={form} />
</Form.Item>
```

## 🔄 Integration Checklist

### ✅ Before Implementation

- [ ] Import `ImageUploader` component
- [ ] Set up Ant Design `Form` instance
- [ ] Define form field structure
- [ ] Determine if single or multiple selection needed
- [ ] Plan validation rules
- [ ] Consider initial values for edit forms

### ✅ During Implementation

- [ ] Add `<ImageUploader>` to form items
- [ ] Set correct `fieldPath` prop
- [ ] Add `multiple={true}` for multi-selection
- [ ] Add validation rules if needed
- [ ] Test form submission
- [ ] Handle loading and error states

### ✅ After Implementation

- [ ] Test upload functionality
- [ ] Test selection from existing images
- [ ] Verify form submission with image URLs
- [ ] Test form reset/clear functionality
- [ ] Test validation rules
- [ ] Test responsive design
- [ ] Test accessibility features

### ✅ Production Checklist

- [ ] Verify image URLs are accessible
- [ ] Test with various image formats
- [ ] Test with large file sizes
- [ ] Test network error scenarios
- [ ] Verify SEO implications
- [ ] Test performance with many images

## 🚨 Common Issues & Solutions

### Issue: Images not showing after upload

**Problem:** Uploaded images don't appear in the selection modal.
**Solution:**

- Ensure your API returns the uploaded image data correctly
- Check that the media list is being refreshed after upload
- Verify the image URLs are accessible

```tsx
// Check API response format
const response = await uploadImage(formData);
console.log("Upload response:", response);
// Should include uploaded image data
```

### Issue: Form validation not working

**Problem:** Form validation doesn't trigger for image fields.
**Solution:**

- Make sure the form field name matches the `fieldPath` prop
- Ensure validation rules are properly defined

```tsx
// Correct field path matching
<Form.Item name="logo" rules={[{ required: true }]}>
  <ImageUploader fieldPath="logo" form={form} />
</Form.Item>
```

### Issue: Multiple selection not working

**Problem:** Only single images can be selected even with `multiple={true}`.
**Solution:**

- Verify `multiple={true}` prop is set
- Ensure form field is initialized as an array for multiple selection

```tsx
// Correct multiple selection setup
const initialValues = {
  gallery: [], // Initialize as array for multiple selection
};

<ImageUploader fieldPath="gallery" form={form} multiple={true} />;
```

### Issue: Nested paths not working

**Problem:** Deep nested form fields don't update properly.
**Solution:**

- Use proper dot notation like `"user.profile.avatar"`
- Ensure form structure matches the nested path

```tsx
// Correct nested field setup
<Form.Item name={["user", "profile", "avatar"]}>
  <ImageUploader fieldPath="user.profile.avatar" form={form} />
</Form.Item>
```

### Issue: Images not clearing on form reset

**Problem:** Image previews remain after form reset.
**Solution:**

- Use proper form reset methods
- Ensure component re-renders after reset

```tsx
const handleReset = () => {
  form.resetFields();
  // Force component re-render if needed
  setKey(Date.now());
};
```

### Issue: Modal not opening

**Problem:** Media upload modal doesn't open when clicking the upload button.
**Solution:**

- Check for JavaScript errors in console
- Verify modal state management
- Ensure proper imports

```tsx
// Check imports
import { MediaUploadModal } from "../common/Modals";

// Verify state
const [openModal, setOpenModal] = useState(false);
console.log("Modal state:", openModal);
```

## 🔧 Technical Implementation Details

### Component Architecture

```
ImageUploader
├── API Hooks (useMediaListQuery, useUploadImageMutation, etc.)
├── Form Value Management
├── Selection Logic (single/multiple)
├── Modal State Management
└── MediaUploadModal
    ├── Upload Functionality
    ├── Folder Management
    ├── Image Selection
    └── MediaCard Components
```

### Data Flow

```
Form Field Value → ImageUploader → MediaUploadModal → API → Updated Media List → Form Field Update
```

### API Integration Points

1. **Media List Query**: `useMediaListQuery([])`
2. **Upload Mutation**: `useUploadImageMutation()`
3. **Folder Operations**: `useCreateFolderMutation()`, `useRenameFolderMutation()`, `useDeleteFolderMutation()`

### Performance Considerations

- **Lazy Loading**: Images are loaded progressively in the modal
- **Debounced Updates**: Form updates are optimized to prevent excessive re-renders
- **Memory Management**: Image previews are properly cleaned up

### Browser Compatibility

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Mobile responsive design
- Touch-friendly interface

## 📞 Support & Troubleshooting

### Debug Mode

Enable debug logging by adding this to your component:

```tsx
const DEBUG = true;

if (DEBUG) {
  console.log("Form values:", form.getFieldsValue());
  console.log("Selected images:", selectedImages);
  console.log("Media data:", mediaData);
}
```

### Common Debug Commands

```tsx
// Check current form value
console.log("Current value:", form.getFieldValue("logo"));

// Check all form values
console.log("All values:", form.getFieldsValue());

// Force form update
form.setFieldsValue({ logo: "new-url" });

// Reset specific field
form.setFieldValue(["gallery"], null);
```

### Getting Help

For issues or questions:

1. Check this documentation first
2. Review the implementation examples
3. Check browser console for errors
4. Test with simplified examples
5. Contact the development team

### Version History

- **v1.0**: Initial implementation with basic upload functionality
- **v2.0**: Added selection mode and multiple image support
- **v2.1**: Enhanced with auto-selection of uploaded images
- **v2.2**: Improved folder management and real-time updates

---

## 📚 Related Documentation

- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

---

**🎉 Happy coding with the Enhanced Media Upload & Selection System!**

_Last updated: October 5, 2025_
