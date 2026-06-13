import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
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
        title="Sign In | UserKotha.Shop"
        description="Login to UserKotha.Shop Admin Panel"
      />
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#fafafa] dark:bg-[#0d0806]">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="flex justify-center mb-9">
            <img
              src="/images/logo/logo.png"
              alt="UserKotha.Shop"
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-[14px] mt-1.5">
              Please sign in to your account to continue.
            </p>
          </div>

          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            {/* Email */}
            <Form.Item
              name="email"
              label={
                <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                  Email address
                </span>
              }
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Enter a valid email" },
              ]}
              style={{ marginBottom: 18 }}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#9ca3af" }} />}
                placeholder="you@userkotha.shop"
                size="large"
                style={{ borderRadius: 10 }}
              />
            </Form.Item>

            {/* Password */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                Password
              </span>
              <Link
                to="/forgot-password"
                className="text-[12.5px] font-semibold hover:opacity-75 transition-opacity"
                style={{ color: "#ff3d0a" }}
              >
                Forgot password?
              </Link>
            </div>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
              style={{ marginBottom: 18 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#9ca3af" }} />}
                placeholder="Enter your password"
                size="large"
                style={{ borderRadius: 10 }}
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
                fontWeight: 600,
                borderRadius: 10,
                background: "#ff3d0a",
                border: "none",
                boxShadow: "0 4px 14px rgba(255, 61, 10, 0.28)",
              }}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </Form>

          {/* Footer note */}
          <p className="text-center text-[12.5px] text-gray-400 mt-9">
            UserKotha.Shop · Admin Panel
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
