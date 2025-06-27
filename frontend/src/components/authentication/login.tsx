import { Button, Input, Box, Text, Flex, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../../utils/auth";

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

interface ApiResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async (data: SigninFormValues) => {
    try {
      setIsLoading(true);
      const response = await axios.post<ApiResponse>("/api/auth/login", data, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Important for cookies
      });

      const { token, user } = response.data;
      
      // Store token
      setToken(token);
      
      // Store user data in localStorage (optional, can be removed if using token only)
      localStorage.setItem("user", JSON.stringify(user));
      
      toast({
        title: "Login successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/chat");
    } catch (error) {
      console.error("Login error:", error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || "Login failed";
        toast({
          title: "Error",
          description: message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
      <Text fontSize="2xl" fontWeight="bold" mb={6} textAlign="center">Sign In</Text>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mb={4}>
          <Text mb={2}>Email</Text>
          <Input 
            type="email" 
            placeholder="Enter your email" 
            {...register("email")} 
            mb={2}
          />
          {errors.email && (
            <Text color="red.500" fontSize="sm">{errors.email.message}</Text>
          )}
        </Box>

        <Box mb={6}>
          <Text mb={2}>Password</Text>
          <Flex align="center" mb={2}>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
              flex="1"
            />
            <Button
              ml={2}
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </Button>
          </Flex>
          {errors.password && (
            <Text color="red.500" fontSize="sm">{errors.password.message}</Text>
          )}
        </Box>

        <Button 
          type="submit" 
          colorScheme="blue" 
          width="100%"
          mb={4}
          isLoading={isLoading}
          loadingText="Signing in..."
        >
          Sign In
        </Button>

        <Text textAlign="center">
          Don't have an account?{' '}
          <Text as="span" color="blue.500" _hover={{ textDecoration: 'underline' }}>
            <Link to="/register">Sign up</Link>
          </Text>
        </Text>
      </form>
    </Box>
  );
};

export default Login;
