"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Sparkles, FileText, TrendingUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCoverLetters } from "@/actions/cover-letter";

export default function CoverLetterPage() {
  const [coverLetters, setCoverLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoverLetters() {
      try {
        const data = await getCoverLetters();
        setCoverLetters(data || []);
      } catch (error) {
        console.error("Failed to fetch cover letters:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCoverLetters();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4">
      {/* Header with animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between mb-5">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-title">My Cover Letters</h1>
          <Link href="/ai-cover-letter/new" className="w-full md:w-auto">
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Overview Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cover Letters</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coverLetters?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Ready to use</p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI-Powered</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Generated with AI</p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Based on user feedback</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Cover Letter Tips
            </CardTitle>
            <CardDescription>
              Maximize your chances with these expert recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                <p className="text-sm">Personalize each cover letter for the specific role and company</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                <p className="text-sm">Highlight achievements with quantifiable results</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                <p className="text-sm">Keep it concise - one page maximum</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cover Letters List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <CoverLetterList coverLetters={coverLetters} />
      </motion.div>

      {/* Spacer to create gap between content and footer */}
      <div className="h-8"></div>
    </div>
  );
}