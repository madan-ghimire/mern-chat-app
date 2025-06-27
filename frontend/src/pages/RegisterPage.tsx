// import { Box, Button, Container, FormControl, FormErrorMessage, FormLabel, Heading, Input, InputGroup, InputRightElement, Text, VStack, useToast } from '@chakra-ui/react';
// import { Link as RouterLink, useNavigate } from 'react-router-dom';
// import { useState } from 'react';
// import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { authApi } from '../services/api';

// // Define form schema
// const registerSchema = z.object({
//   firstName: z.string().min(1, 'First name is required'),
//   lastName: z.string().min(1, 'Last name is required'),
//   username: z.string().min(1, 'Username is required'),
//   email: z.string().email('Invalid email address'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   confirmPassword: z.string(),
//   pic: z.string().optional(),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// });

// type RegisterFormData = z.infer<typeof registerSchema>;

// const RegisterPage = (): JSX.Element => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const toast = useToast();
//   const navigate = useNavigate();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<RegisterFormData>({
//     resolver: zodResolver(registerSchema),
//   });

//   const onSubmit = async (formData: RegisterFormData) => {
//     try {
//       setIsLoading(true);
//       const { confirmPassword, ...userData } = formData;
      
//       await authApi.register({
//         ...userData,
//         pic: userData.pic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
//       });
      
//       toast({
//         title: 'Signup Successful',
//         description: 'Your account has been created successfully. Please log in.',
//         status: 'success',
//         duration: 5000,
//         isClosable: true,
//         position: 'bottom-right'
//       });
      
//       navigate('/login');
//     } catch (error: any) {
//       console.error('Registration error:', error);
//       let errorMessage = 'Registration failed. Please try again.';
      
//       if (error.response?.data) {
//         // Handle API response errors
//         errorMessage = error.response.data.message || 'Registration failed';
//       } else if (error.request) {
//         // No response received
//         errorMessage = 'Unable to connect to server. Please check your connection.';
//       } else {
//         // Other errors
//         errorMessage = error.message || 'An unexpected error occurred';
//       }
      
//       toast({
//         title: 'Registration Failed',
//         description: errorMessage,
//         status: 'error',
//         duration: 7000, // Longer duration for potentially longer error messages
//         isClosable: true,
//         position: 'bottom-right',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Container maxW="md" py={20}>
//       <VStack spacing={8}>
//         <Box textAlign="center">
//           <Heading as="h1" size="xl" mb={2}>
//             Create an account
//           </Heading>
//           <Text color="gray.600">Join our community today</Text>
//         </Box>

//         <Box w="100%" bg="white" p={8} borderRadius="lg" boxShadow="sm">
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <VStack spacing={4}>
//               <FormControl id="firstName" isInvalid={!!errors.firstName}>
//                 <FormLabel>First Name</FormLabel>
//                 <Input
//                   type="text"
//                   placeholder="Enter your first name"
//                   {...register('firstName')}
//                 />
//                 <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
//               </FormControl>

//               <FormControl id="lastName" isInvalid={!!errors.lastName}>
//                 <FormLabel>Last Name</FormLabel>
//                 <Input
//                   type="text"
//                   placeholder="Enter your last name"
//                   {...register('lastName')}
//                 />
//                 <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
//               </FormControl>

//               <FormControl id="username" isInvalid={!!errors.username}>
//                 <FormLabel>Username</FormLabel>
//                 <Input
//                   type="text"
//                   placeholder="Choose a username"
//                   {...register('username')}
//                 />
//                 <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
//               </FormControl>

//               <FormControl id="email" isInvalid={!!errors.email}>
//                 <FormLabel>Email address</FormLabel>
//                 <Input
//                   type="email"
//                   placeholder="Enter your email"
//                   {...register('email')}
//                 />
//                 <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
//               </FormControl>

//               <FormControl id="password" isInvalid={!!errors.password}>
//                 <FormLabel>Password</FormLabel>
//                 <InputGroup>
//                   <Input
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="Create a password"
//                     {...register('password')}
//                   />
//                   <InputRightElement h="full">
//                     <Button
//                       variant="ghost"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? <ViewOffIcon /> : <ViewIcon />}
//                     </Button>
//                   </InputRightElement>
//                 </InputGroup>
//                 <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
//               </FormControl>

//               <FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword}>
//                 <FormLabel>Confirm Password</FormLabel>
//                 <InputGroup>
//                   <Input
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     placeholder="Confirm your password"
//                     {...register('confirmPassword')}
//                   />
//                   <InputRightElement h="full">
//                     <Button
//                       variant="ghost"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     >
//                       {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
//                     </Button>
//                   </InputRightElement>
//                 </InputGroup>
//                 <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
//               </FormControl>

//               <Button
//                 type="submit"
//                 colorScheme="blue"
//                 width="100%"
//                 size="lg"
//                 mt={4}
//                 isLoading={isLoading}
//                 loadingText="Creating account..."
//               >
//                 Sign Up
//               </Button>

//               <Text textAlign="center" mt={4}>
//                 Already have an account?{' '}
//                 <Text as={RouterLink} to="/login" color="blue.500" fontWeight="medium">
//                   Sign in
//                 </Text>
//               </Text>
//             </VStack>
//           </form>
//         </Box>
//       </VStack>
//     </Container>
//   );
// };

// export default RegisterPage;


import {
    Box,
    Button,
    Container,
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
  import { z } from 'zod';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { authApi } from '../services/api';
  
  const registerSchema = z
    .object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      username: z.string().min(1, 'Username is required'),
      email: z.string().email('Invalid email address'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string(),
      pic: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    });
  
  type RegisterFormData = z.infer<typeof registerSchema>;
  
  const RegisterPage = (): JSX.Element => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();
  
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
    });
  
    const onSubmit = async (formData: RegisterFormData) => {
      try {
        setIsLoading(true);
        const { confirmPassword, ...userData } = formData;
  
        await authApi.register({
          ...userData,
          pic:
            userData.pic ||
            'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        });
  
        toast({
          title: 'Signup Successful',
          description: 'Your account has been created successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'bottom-right',
        });
  
        navigate('/login');
      } catch (error: any) {
        let errorMessage = 'Registration failed. Please try again.';
  
        if (error.response?.data) {
          errorMessage = error.response.data.message || 'Registration failed';
        } else if (error.request) {
          errorMessage = 'Unable to connect to server. Check your connection.';
        } else {
          errorMessage = error.message || 'An unexpected error occurred';
        }
  
        toast({
          title: 'Registration Failed',
          description: errorMessage,
          status: 'error',
          duration: 7000,
          isClosable: true,
          position: 'bottom-right',
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <Container maxW="sm" py={10}>
        <VStack spacing={6}>
          <Box textAlign="center">
            <Heading size="lg">Sign Up</Heading>
            <Text fontSize="sm" color="gray.500">
              Create your MERN Chat account
            </Text>
          </Box>
  
          <Box w="100%" bg="white" p={6} rounded="md" boxShadow="md">
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.firstName}>
                  <FormLabel fontSize="sm">First Name</FormLabel>
                  <Input placeholder="First name" {...register('firstName')} />
                  <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
                </FormControl>
  
                <FormControl isInvalid={!!errors.lastName}>
                  <FormLabel fontSize="sm">Last Name</FormLabel>
                  <Input placeholder="Last name" {...register('lastName')} />
                  <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
                </FormControl>
  
                <FormControl isInvalid={!!errors.username}>
                  <FormLabel fontSize="sm">Username</FormLabel>
                  <Input placeholder="Username" {...register('username')} />
                  <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
                </FormControl>
  
                <FormControl isInvalid={!!errors.email}>
                  <FormLabel fontSize="sm">Email</FormLabel>
                  <Input placeholder="Email" type="email" {...register('email')} />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>
  
                <FormControl isInvalid={!!errors.password}>
                  <FormLabel fontSize="sm">Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
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
  
                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel fontSize="sm">Confirm Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      {...register('confirmPassword')}
                    />
                    <InputRightElement>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.confirmPassword?.message}
                  </FormErrorMessage>
                </FormControl>
  
                <Button
                  type="submit"
                  colorScheme="blue"
                  w="full"
                  mt={2}
                  isLoading={isLoading}
                  loadingText="Creating..."
                >
                  Create Account
                </Button>
  
                <Text fontSize="sm">
                  Already have an account?{' '}
                  <Text
                    as={RouterLink}
                    to="/login"
                    color="blue.500"
                    fontWeight="medium"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Sign in
                  </Text>
                </Text>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    );
  };
  
  export default RegisterPage;
  