import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        // Omit password before returning
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt", // Use database sessions
  },

  pages: {
    signIn: "/login", // custom login page
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id); // Ensure string
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      } else if (token.id && typeof token.id === "string") {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id },
        });
        if (freshUser) {
          token.name = freshUser.name;
          token.email = freshUser.email;
          token.image = freshUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add user.id to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image as string;
        session.user.createdAt = token.createdAt as string | undefined;
      }
      return session;
    },
    async redirect({ baseUrl }) {
      return "/rooms";
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
