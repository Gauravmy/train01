import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export function middleware(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  
  // If no token and trying to access protected routes, redirect to login
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If token exists, verify it
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("user-id", decoded.userId)
      requestHeaders.set("user-role", decoded.role)
      requestHeaders.set("user-email", decoded.email)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      // Invalid token
      if (request.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
  ],
}