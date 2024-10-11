import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Firebase",
      credentials: {
        email: { label: "Email", type: "text" },
        token: { label: "Token", type: "text" },
      },
      async authorize() {
        // This is where you can validate the token
        try {
          // Perform some custom logic here, e.g., verify token with Firebase
          const user = {
            uid: "as",
            email: "as",
          };

          if (user) {
            // Return the user object if verified
            return { id: user.uid, email: user.email };
          }
          return null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
});
