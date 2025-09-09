"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Train, Shield, Users, BarChart3, ArrowRight, Clock, Zap, Target } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Train className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                <div className="absolute -top-2 -right-2">
                  <Zap className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              AI-Powered Railway Traffic Control System
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Maximizing Section Throughput Using AI-Powered Precise Train Traffic Control
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
                  Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                The Challenge
              </h2>
              <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="h-6 w-6 text-orange-500" />
                  Current Infrastructure Limitations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Indian Railways faces significant congestion challenges due to limited track infrastructure and 
                  exponentially increasing train volumes. Multiple train types with varying priorities—including 
                  passenger, express, freight, and local trains—must efficiently share the same track infrastructure.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Currently, critical traffic control decisions are made manually by human traffic controllers, 
                  leading to inefficiencies, delays, and suboptimal resource utilization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-6 w-6 text-green-500" />
                  Our AI-Powered Solution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  This revolutionary project develops an intelligent AI-powered decision-support system for 
                  train traffic control that fundamentally transforms railway operations. Our system leverages 
                  advanced machine learning algorithms to:
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Maximize Throughput</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Optimize track utilization and increase train capacity</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Clock className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Minimize Delays</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reduce waiting times and improve punctuality</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Real-time Optimization</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dynamic decision-making for live operations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Key Features
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <CardTitle>Role-Based Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Secure authentication with specialized dashboards for Admins, Controllers, and Users
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <CardTitle>Real-time Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Live train movement monitoring with AI-powered suggestions for optimal traffic flow
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <CardTitle>Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Comprehensive KPI tracking, performance metrics, and predictive insights
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Railway Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the future of intelligent railway traffic management with our AI-powered control system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Get Started Today
                <ArrowRight className={`ml-2 h-5 w-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-all duration-300"
              >
                Demo Access
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Train className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-semibold">AI Railway Traffic Control</span>
          </div>
          <p className="text-gray-400">
            © 2024 AI-Powered Railway Traffic Control System. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Badge variant="secondary" className="bg-blue-600 text-white">Next.js</Badge>
            <Badge variant="secondary" className="bg-green-600 text-white">AI Powered</Badge>
            <Badge variant="secondary" className="bg-purple-600 text-white">Real-time</Badge>
          </div>
        </div>
      </footer>
    </div>
  )
}