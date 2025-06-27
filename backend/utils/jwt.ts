import jwt from "jsonwebtoken";

export const generateToken = (userId: string, username: string, email: string) => {
  const JWT_SECRET = process.env.JWT_SECRET!;

  return jwt.sign({ userId, username, email }, JWT_SECRET, { expiresIn: "1h" });
};



// export const generateToken = (
//   userId: string,
//   role: string,
//   username: string,
//   email: string
// ) => {
//   return jwt.sign({ id: userId, role, username, email }, SECRET_KEY, {
//     expiresIn: "1h",
//   });
// };