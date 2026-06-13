import {
  BarChartOutlined,
  CheckCircleFilled,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  ShopOutlined,
  StockOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input } from "antd";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/Meta/PageMeta";
import { useLoginMutation } from "../../redux/features/auth/authApi";
import { setUser } from "../../redux/features/auth/authSlice";
import { useAppDispatch } from "../../redux/features/hooks";
import {
  getPostLoginNavigatePath,
  type RouteAccessUser,
} from "../../routes/routeAccess";

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

const features = [
  { icon: <StockOutlined />, title: "Inventory", desc: "Stock & tracking" },
  { icon: <ShopOutlined />, title: "Sales", desc: "Multi-branch" },
  { icon: <TeamOutlined />, title: "Suppliers", desc: "Procurement" },
  { icon: <BarChartOutlined />, title: "Analytics", desc: "Live reports" },
];

const Login = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get("redirect");

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    (redirectParam ? decodeURIComponent(redirectParam) : "/");

  const onFinish = async (values: LoginFormValues) => {
    const data = { email: values.email, password: values.password };
    try {
      const res = await login(data).unwrap();
      if (res) {
        localStorage.setItem("token", res?.data?.token);
        if (values.remember) {
          localStorage.setItem("remembered_email", values.email);
        } else {
          localStorage.removeItem("remembered_email");
        }
        const userFromResponse = res?.data?.user;

        // All users are now type "user" - employee type is deprecated
        const userData = {
          ...userFromResponse,
          type: "user",
        };

        dispatch(
          setUser({
            user: userData,
            token: res?.data?.token,
            refreshToken: res?.data?.refreshToken,
          }),
        );
        const postLoginPath = getPostLoginNavigatePath(
          from,
          userData as RouteAccessUser,
        );
        navigate(postLoginPath, { replace: true });
        toast.success("Login successful!");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.errors ||
          err?.data?.message ||
          "Something went wrong. Please try again later.",
      );
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    if (savedEmail) {
      form.setFieldsValue({ email: savedEmail, remember: true });
    }
  }, [form]);

  return (
    <>
      <PageMeta
        title="Sign In | Amzad Food ERP"
        description="Login to Amzad Food ERP System"
      />
      <div className="min-h-screen flex">
        {/* ── LEFT PANEL ── */}
        <div
          className="hidden lg:flex lg:w-[52%] xl:w-[50%] flex-col relative overflow-hidden"
          style={{
            background:
              "linear-gradient(150deg, #1a0600 0%, #2e0d03 28%, #4d1a08 55%, #b32a00 78%, #ff3d0a 100%)",
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)
              `,
              backgroundSize: "56px 56px",
            }}
          />

          {/* Glow orbs */}
          <div
            className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,61,10,0.16) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute bottom-20 -left-32 w-[380px] h-[380px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(230,50,0,0.30) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute top-1/2 right-10 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,110,68,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Decorative rings */}
          <div
            className="absolute top-1/2 left-1/2 w-[660px] h-[660px] rounded-full pointer-events-none"
            style={{
              border: "1px solid rgba(255,255,255,0.04)",
              transform: "translate(-30%, -52%)",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-[440px] h-[440px] rounded-full pointer-events-none"
            style={{
              border: "1px solid rgba(255,255,255,0.055)",
              transform: "translate(-30%, -52%)",
            }}
          />

          <div className="relative flex flex-col h-full px-12 py-11 xl:px-16 xl:py-13">
            {/* Logo */}
            <div>
              <img
                src="/images/logo/logo.png"
                alt="Amzad Food"
                className="h-11 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>

            {/* Center content */}
            <div className="flex-1 flex flex-col justify-center gap-10">
              {/* Live status pill */}
              <div
                className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full text-[11px] font-semibold"
                style={{
                  background: "rgba(255,110,68,0.10)",
                  border: "1px solid rgba(255,110,68,0.22)",
                  color: "#ffb59c",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6c45] animate-pulse" />
                Enterprise Resource Planning · Live
              </div>

              {/* Headline */}
              <div>
                <h1
                  className="font-extrabold leading-[1.08] tracking-tight text-white"
                  style={{ fontSize: "clamp(2rem, 3vw, 2.9rem)" }}
                >
                  Run your food
                  <br />
                  business{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg, #ff6c45 0%, #ffb59c 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    end-to-end
                  </span>
                </h1>
                <p
                  className="mt-4 text-[14.5px] leading-[1.7] max-w-[340px]"
                  style={{ color: "rgba(255,255,255,0.48)" }}
                >
                  Inventory, orders, suppliers, and analytics — unified in one
                  powerful platform.
                </p>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(255,110,68,0.14)",
                        color: "#ff6c45",
                        fontSize: 14,
                      }}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <div className="text-white text-[12.5px] font-semibold leading-none">
                        {f.title}
                      </div>
                      <div
                        className="text-[11px] mt-0.5"
                        style={{ color: "rgba(255,255,255,0.40)" }}
                      >
                        {f.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div
                className="flex items-center gap-0 rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {[
                  { value: "99.9%", label: "Uptime SLA" },
                  { value: "Real-time", label: "Data Sync" },
                  { value: "256-bit", label: "Encryption" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center py-4"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRight:
                        i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                    }}
                  >
                    <span className="text-[15px] font-bold text-white">
                      {s.value}
                    </span>
                    <span
                      className="text-[10.5px] mt-0.5"
                      style={{ color: "rgba(255,255,255,0.36)" }}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between pt-5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <p
                className="text-[11px]"
                style={{ color: "rgba(255,255,255,0.26)" }}
              >
                © {new Date().getFullYear()} Amzad Food. All rights reserved.
              </p>
              <div
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: "rgba(255,255,255,0.30)" }}
              >
                <SafetyOutlined style={{ fontSize: 10 }} />
                SSL Secured
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#fdf6f3] dark:bg-[#0d0806] relative overflow-hidden">
          {/* Subtle bg accents */}
          <div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,61,10,0.07) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,61,10,0.05) 0%, transparent 70%)",
            }}
          />

          <div className="w-full max-w-[400px] relative">
            {/* Mobile logo */}
            <div className="flex justify-center mb-8 lg:hidden">
              <img
                src="/images/logo/logo.png"
                alt="Amzad Food"
                className="h-11 w-auto object-contain"
              />
            </div>

            {/* Card */}
            <div
              className="bg-white dark:bg-[#1a0e0a] rounded-[28px] p-8 xl:p-9"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(255,61,10,0.07), 0 8px 24px -4px rgba(189,41,0,0.09), 0 40px 80px -16px rgba(0,0,0,0.13)",
              }}
            >
              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center gap-3.5 mb-5">
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #bd2900 0%, #ff3d0a 100%)",
                      boxShadow: "0 5px 18px rgba(255,61,10,0.38)",
                    }}
                  >
                    <LockOutlined style={{ color: "white", fontSize: 17 }} />
                  </div>
                  <div>
                    <h2 className="text-[19px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                      Welcome back
                    </h2>
                    <p className="text-gray-400 dark:text-gray-500 text-[12.5px] mt-0.5">
                      Sign in to Amzad Food ERP
                    </p>
                  </div>
                </div>

                {/* Step indicator */}
                <div className="flex gap-1.5 mt-1">
                  <div
                    className="h-[3px] rounded-full flex-1"
                    style={{ background: "#ff3d0a" }}
                  />
                  <div
                    className="h-[3px] rounded-full w-8"
                    style={{ background: "#e5e7eb" }}
                  />
                  <div
                    className="h-[3px] rounded-full w-8"
                    style={{ background: "#e5e7eb" }}
                  />
                </div>
              </div>

              <Form form={form} onFinish={onFinish} layout="vertical">
                {/* Email */}
                <Form.Item
                  name="email"
                  label={
                    <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                      Email Address
                    </span>
                  }
                  rules={[
                    { required: true, message: "Email is required" },
                    { type: "email", message: "Enter a valid email" },
                  ]}
                  style={{ marginBottom: 14 }}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                    placeholder="you@amzadfood.com"
                    size="large"
                    style={{ borderRadius: 11 }}
                  />
                </Form.Item>

                {/* Password label row */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </span>
                  <Link
                    to="/forgot-password"
                    className="text-[12px] font-semibold hover:opacity-75 transition-opacity"
                    style={{ color: "#ff3d0a" }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Password is required" }]}
                  style={{ marginBottom: 16 }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                    placeholder="Enter your password"
                    size="large"
                    style={{ borderRadius: 11 }}
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                {/* Remember me */}
                <div className="mb-6">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>
                      <span className="text-[13px] text-gray-600 dark:text-gray-400">
                        Keep me signed in for 30 days
                      </span>
                    </Checkbox>
                  </Form.Item>
                </div>

                {/* Submit */}
                <Button
                  loading={isLoading}
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  style={{
                    height: 48,
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 13,
                    background: isLoading
                      ? undefined
                      : "linear-gradient(135deg, #bd2900 0%, #ff3d0a 100%)",
                    border: "none",
                    boxShadow: "0 5px 22px rgba(255, 61, 10, 0.38)",
                    letterSpacing: "0.01em",
                  }}
                >
                  {isLoading ? "Signing in…" : "Sign In →"}
                </Button>
              </Form>

              {/* Trust row */}
              <div
                className="flex items-center justify-center gap-5 mt-6 pt-5"
                style={{ borderTop: "1px solid #f0f0f0" }}
              >
                {[
                  { icon: <SafetyOutlined />, label: "SSL Encrypted" },
                  { icon: <CheckCircleFilled />, label: "99.9% Uptime" },
                  { icon: <LockOutlined />, label: "GDPR Safe" },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span style={{ color: "#ff3d0a", fontSize: 11 }}>
                      {b.icon}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sign-up hint */}
            <p className="text-center text-[13px] text-gray-500 dark:text-gray-500 mt-5">
              Don't have an account?{" "}
              <Link
                to="/"
                className="font-semibold hover:opacity-80 transition-opacity"
                style={{ color: "#ff3d0a" }}
              >
                Request access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
