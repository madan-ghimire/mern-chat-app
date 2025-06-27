import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  VStack,
  Image,
  Box,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axiosClient from "@/utils/axios-clients";
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

      toast({
        title: "Success",
        description: response.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: 'bottom-right'
      });    
        reset();
      console.log(response);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error ||
          "Something went wrong. Please try again later.";
          toast({
            title: "Error",
            description: message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: 'bottom-right'
          });     
      } else {
        toast({
          title: "Error",
          description: "Unexpected error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: 'bottom-right'
        });        
        console.error("Unexpected Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const toast = useToast();

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4} align="stretch">
        <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
          <FormControl isInvalid={!!errors.firstName}>
            <FormLabel>First Name</FormLabel>
            <Input placeholder="First name" {...register("firstName")} />
            <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.lastName}>
            <FormLabel>Last Name</FormLabel>
            <Input placeholder="Last name" {...register("lastName")} />
            <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
          </FormControl>
        </Stack>

        <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
          <FormControl isInvalid={!!errors.username}>
            <FormLabel>Username</FormLabel>
            <Input placeholder="Username" {...register("username")} />
            <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input type="email" placeholder="Email" {...register("email")} />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>
        </Stack>

        <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
          <FormControl isInvalid={!!errors.password} flex={1}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                pr="4.5rem"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password")}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  variant="ghost"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.confirmPassword} flex={1}>
            <FormLabel>Confirm Password</FormLabel>
            <InputGroup>
              <Input
                pr="4.5rem"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword")}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  variant="ghost"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
          </FormControl>
        </Stack>

        <FormControl isInvalid={!!errors.pic}>
          <FormLabel>Profile Picture (optional)</FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            p={1.5}
            variant="unstyled"
          />
          <FormErrorMessage>{errors.pic?.message}</FormErrorMessage>
        </FormControl>

        {preview && (
          <Image
            src={preview}
            alt="Profile preview"
            boxSize="100px"
            objectFit="cover"
            borderRadius="md"
            alignSelf="flex-start"
          />
        )}

        <Button type="submit" colorScheme="blue" isLoading={loading} mt={4}>
          Sign Up
        </Button>
      </VStack>
    </Box>
  );
};

export default Signup;
