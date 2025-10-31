"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Lightbulb, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterGenerator from "../_components/cover-letter-generator";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewCoverLetterPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Back Button with Animation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>
      </motion.div>

      {/* Header Section */}
      <motion.div
        className="pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-title">
          Create Cover Letter
        </h1>
        <p className="text-muted-foreground">
          Generate a tailored cover letter for your job application
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CoverLetterGenerator />
        </motion.div>

        {/* Sidebar with Features and Tips */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* AI Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                AI-Powered Features
              </CardTitle>
              <CardDescription>
                How our AI helps you create better cover letters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Instant Generation</h4>
                  <p className="text-xs text-muted-foreground">
                    Create professional cover letters in seconds
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Tailored Content</h4>
                  <p className="text-xs text-muted-foreground">
                    Customized for each job description
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Keyword Optimization</h4>
                  <p className="text-xs text-muted-foreground">
                    Matches job requirements with your experience
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Pro Tips
              </CardTitle>
              <CardDescription>
                Maximize your cover letter effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-sm">
                  Include specific achievements that relate to the job requirements
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-sm">
                  Mention the company by name and show you've researched them
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500"></div>
                <p className="text-sm">
                  Keep paragraphs concise and focused on value you bring
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Success Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Success Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Rate</span>
                    <span className="font-medium">73%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "73%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Interview Rate</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}