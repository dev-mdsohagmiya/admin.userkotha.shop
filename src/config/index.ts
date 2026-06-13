export const config = {
  // 🌐 Application
  app_domain: import.meta.env.VITE_PUBLIC_APP_DOMAIN,
  tracking_url: import.meta.env.VITE_PUBLIC_TRACKING_URL,

  // 🚀 Server & API
  server_url: import.meta.env.VITE_PUBLIC_SERVER_URL,
  api_url: import.meta.env.VITE_PUBLIC_API_URL,
  image_access_url: import.meta.env.VITE_PUBLIC_IMAGE_ACCESS_URL,

  // 🔑 Third-Party Services
  tiny_api_key: import.meta.env.VITE_PUBLIC_TINY_API_KEY,

  // email address supperAdmin
  supperAdminEmail: import.meta.env.VITE_PUBLIC_SUPPER_ADMIN_EMAIL,
} as const;
