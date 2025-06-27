import {
    Box,
    Button,
    Container,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    VStack,
    useToast,
  } from '@chakra-ui/react';
  import { Link as RouterLink, useNavigate } from 'react-router-dom';
  import { useState } from 'react';
  import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
  import { useForm } from 'react-hook-form';
  import type { AuthState } from '../stores/useAuthStore';
  import { zodResolver } from '@hookform/resolvers/zod';
  import * as z from 'zod';
  import { authApi } from '../services/api';
  import useAuthStore from '../stores/useAuthStore';
  
  const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  });
  
  type LoginFormData = z.infer<typeof loginSchema>;
  
  const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
    const login = useAuthStore((state: AuthState) => state.login);
  
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
    });
  
    const onSubmit = async (data: LoginFormData) => {
      try {
        setIsLoading(true);
        const response = await authApi.login(data);
        const { data: userData } = response;
        const { token, ...user } = userData;
        login(user, token);
  
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
  
        navigate('/chat');
      } catch (error: any) {
        let errorMessage = 'An error occurred during login';
  
        if (error.response) {
          errorMessage = error.response.data?.message || error.response.statusText || 'Server error';
        } else if (error.request) {
          errorMessage = 'No response from server. Please check your connection.';
        } else if (error.message) {
          errorMessage = error.message;
        }
  
        toast({
          title: 'Login Failed',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <Flex align="center" justify="center" minH="100vh" bg="gray.50" px={4}>
        <Container maxW="sm" py={6}>
          <VStack spacing={6}>
            <Box textAlign="center">
              <Heading size="lg">Welcome Back</Heading>
              <Text fontSize="sm" color="gray.500">
                Sign in to your account
              </Text>
            </Box>
  
            <Box w="100%" bg="white" p={6} rounded="md" boxShadow="md">
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4}>
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel fontSize="sm">Email</FormLabel>
                    <Input placeholder="Enter your email" {...register('email')} />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>
  
                  <FormControl isInvalid={!!errors.password}>
                    <FormLabel fontSize="sm">Password</FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        {...register('password')}
                      />
                      <InputRightElement>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                  </FormControl>
  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    width="full"
                    mt={2}
                    isLoading={isLoading}
                    loadingText="Signing in..."
                  >
                    Sign In
                  </Button>
  
                  <Text fontSize="sm" textAlign="center">
                    Don&apos;t have an account?{' '}
                    <Text
                      as={RouterLink}
                      to="/register"
                      color="blue.500"
                      fontWeight="medium"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      Sign up
                    </Text>
                  </Text>
                </VStack>
              </form>
            </Box>
          </VStack>
        </Container>
      </Flex>
    );
  };
  
  export default LoginPage;
  