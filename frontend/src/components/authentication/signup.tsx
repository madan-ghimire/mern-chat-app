import { Button, Field, HStack, Input, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axiosClient from "@/utils/axios-clients";

import { toast } from "react-toastify";
import axios from "axios";

const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    pic: z.string().optional().nullable(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SignupFormValues>({
    mode: "onBlur",
    resolver: zodResolver(signupSchema),
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Convert file to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      setValue("pic", null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      setValue("pic", base64);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    try {
      setLoading(true);
      const response = await axiosClient.post("/api/auth/signup", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(response.data.message);
      reset();
      console.log(response);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error ||
          "Something went wrong. Please try again later.";
        toast.error(`${message}`);
        console.error("Server Error:", error.response);
      } else {
        toast.error("❌ Unexpected error occurred");
        console.error("Unexpected Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spaceY={4} align="stretch">
        <HStack spaceX={4} align="start" width="100%">
          <Field.Root invalid={!!errors.firstName}>
            <Field.Label>First Name</Field.Label>
            <Input placeholder="First name" {...register("firstName")} />
            <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.lastName}>
            <Field.Label>Last Name</Field.Label>
            <Input placeholder="Last name" {...register("lastName")} />
            <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
          </Field.Root>
        </HStack>
        <HStack spaceX={4} align="start" width="100%">
          <Field.Root invalid={!!errors.username}>
            <Field.Label>Username</Field.Label>
            <Input placeholder="Username" {...register("username")} />
            <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.email}>
            <Field.Label>Email</Field.Label>
            <Input placeholder="Email" {...register("email")} />
            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
          </Field.Root>
        </HStack>

        <HStack spaceX={4} align="start" width="100%">
          <Field.Root flex={1} invalid={!!errors.password}>
            <Field.Label>Password</Field.Label>
            <div style={{ position: "relative" }}>
              <Input
                pr="2.5rem"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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
                }}
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </Button>
            </div>
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root flex={1} invalid={!!errors.confirmPassword}>
            <Field.Label>Confirm Password</Field.Label>
            <div style={{ position: "relative" }}>
              <Input
                pr="2.5rem"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                }}
                tabIndex={-1}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </Button>
            </div>
            <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
          </Field.Root>
        </HStack>
        {/* Profile Pic Upload */}
        <Field.Root invalid={!!errors.pic}>
          <Field.Label>Profile Picture (optional)</Field.Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            p={1.5}
          />
          <Field.ErrorText>{errors.pic?.message}</Field.ErrorText>
        </Field.Root>
        {/* Image Preview */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        )}
        <Button type="submit" loading={loading}>
          Submit
        </Button>
      </VStack>
    </form>
  );
};

export default Signup;
