import { Button, Field, Input, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Zod schema
const signinSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type SigninFormValues = z.infer<typeof signinSchema>;

const Login = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SigninFormValues>({
    mode: "onBlur",
    resolver: zodResolver(signinSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const onSubmit = async (data: SigninFormValues) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/signin", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("check response here", response);

      toast.success("✅ Login successful!");
      reset();

      // You can also store token or user info here if needed
      // localStorage.setItem("token", response.data.token);

      navigate("/chats");
    } catch (error) {
      console.log("check error here", error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data.message;
        toast.error(message);
      } else {
        toast.error("❌ Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spaceY={4} align="stretch">
        <Field.Root invalid={!!errors.email}>
          <Field.Label>Email</Field.Label>
          <Input placeholder="Enter your email" {...register("email")} />
          <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.password}>
          <Field.Label>Password</Field.Label>
          <div style={{ position: "relative", width: "100%" }}>
            <Input
              pr="2.5rem"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                top: "50%",
                right: "10px",
                transform: "translateY(-50%)",
                height: "auto",
              }}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </Button>
          </div>
          <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
        </Field.Root>

        <Button type="submit" p={1.5} colorScheme="blue" loading={loading}>
          Submit
        </Button>
      </VStack>
    </form>
  );
};

export default Login;
