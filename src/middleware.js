import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized: ({ token }) => token?.role === "admin",
  },
});

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
