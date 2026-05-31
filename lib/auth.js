import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: {
        params: {
          scope: 'repo read:user user:email',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = profile?.id;
        token.githubUsername = profile?.login;
        token.avatarUrl = profile?.avatar_url;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.githubId = token.githubId;
      session.user.githubUsername = token.githubUsername;
      session.user.avatarUrl = token.avatarUrl;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
});
