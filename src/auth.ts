import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const config = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

export const { auth, signIn, signOut, handlers } = NextAuth(config);
export const { GET, POST } = handlers;
