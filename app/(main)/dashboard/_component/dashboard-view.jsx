"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  FileText,
  Mail,
  ClipboardList,
  Award,
  Calendar,
  User,
  Rocket,
  Target,
  BookOpen,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const DashboardView = ({ insights, resume, coverLetters, assessments }) => {
  // Handle cases where data might be missing
  if (!insights) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Error loading dashboard data</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please try refreshing the page or contact support
          </p>
        </div>
      </div>
    );
  }

  // Transform salary data for the chart, with fallbacks
  const salaryData = insights.salaryRanges?.map((range) => ({
    name: range.role || "Unknown Role",
    min: (range.min || 0) / 1000,
    max: (range.max || 0) / 1000,
    median: (range.median || 0) / 1000,
  })) || [];

  const getDemandLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook?.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };

  const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook)?.icon || LineChart;
  const outlookColor = getMarketOutlookInfo(insights.marketOutlook)?.color || "text-gray-500";

  // Format dates using date-fns, with fallbacks
  const lastUpdatedDate = insights.lastUpdated 
    ? format(new Date(insights.lastUpdated), "dd/MM/yyyy")
    : "Unknown";
    
  const nextUpdateDistance = insights.nextUpdate
    ? formatDistanceToNow(new Date(insights.nextUpdate), { addSuffix: true })
    : "soon";

  // Calculate overall progress with fallbacks
  const hasResume = !!resume;
  const hasCoverLetters = (coverLetters?.length || 0) > 0;
  const hasAssessments = (assessments?.length || 0) > 0;
  const progressPercentage = 
    ((hasResume ? 1 : 0) + (hasCoverLetters ? 1 : 0) + (hasAssessments ? 1 : 0)) * 33.33;

  // Get latest assessment for performance card
  const latestAssessment = assessments?.length > 0 ? assessments[assessments.length - 1] : null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome to Your Career Dashboard</h1>
            <p className="text-muted-foreground">
              Track your progress and access all your career tools in one place
            </p>
          </div>
          <Badge variant="secondary" className="text-sm w-full md:w-auto justify-center md:justify-start">
            <Rocket className="w-4 h-4 mr-2" />
            {insights.industry || "Technology"} Industry Insights
          </Badge>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Your Career Progress
            </CardTitle>
            <CardDescription>
              Track your completion of key career development milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Overall Progress</span>
                <span className="font-bold">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${hasResume ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Resume Created</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${hasCoverLetters ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Cover Letters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${hasAssessments ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Assessments Taken</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Rocket className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Jump to key career development tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/resume">
                <motion.div
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                >
                  <FileText className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold">Resume Builder</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create or edit your resume
                  </p>
                </motion.div>
              </Link>
              <Link href="/ai-cover-letter/new">
                <motion.div
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                >
                  <Mail className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold">Cover Letter</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate AI-powered cover letters
                  </p>
                </motion.div>
              </Link>
              <Link href="/interview/mock">
                <motion.div
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                >
                  <ClipboardList className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold">Mock Interview</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Practice with AI-generated questions
                  </p>
                </motion.div>
              </Link>
              <Link href="/interview">
                <motion.div
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                >
                  <Award className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-semibold">Performance</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    View your assessment results
                  </p>
                </motion.div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Overview */}
      {latestAssessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Latest Performance
              </CardTitle>
              <CardDescription>
                Your most recent assessment results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold">{latestAssessment.quizScore?.toFixed(1) || "0.0"}%</h3>
                  <p className="text-muted-foreground">
                    {latestAssessment.createdAt 
                      ? format(new Date(latestAssessment.createdAt), "MMM d, yyyy")
                      : "Unknown date"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={latestAssessment.quizScore || 0} className="w-32" />
                  <span className="text-sm font-medium">
                    {(latestAssessment.quizScore || 0) >= 80 ? 'Excellent' : 
                     (latestAssessment.quizScore || 0) >= 60 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
                {latestAssessment.improvementTip && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm italic">"{latestAssessment.improvementTip}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Market Overview Cards - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2" />
              Industry Insights
            </CardTitle>
            <CardDescription>
              Key metrics for the {insights.industry || "Technology"} industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Market Outlook
                  </CardTitle>
                  <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.marketOutlook || "Neutral"}</div>
                  <p className="text-xs text-muted-foreground">
                    Next update {nextUpdateDistance}
                  </p>
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Industry Growth
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {insights.growthRate?.toFixed(1) || "0.0"}%
                  </div>
                  <Progress value={insights.growthRate || 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
                  <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{insights.demandLevel || "Medium"}</div>
                  <div
                    className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                      insights.demandLevel
                    )}`}
                  />
                </CardContent>
              </Card>

              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {(insights.topSkills || []).slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Industry Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Key Industry Trends
              </CardTitle>
              <CardDescription>
                Current trends shaping the {insights.industry || "Technology"} industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {(insights.keyTrends || []).slice(0, 5).map((trend, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  >
                    <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                    <span>{trend}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Skills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Recommended Skills
              </CardTitle>
              <CardDescription>
                Skills to consider developing for career growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(insights.recommendedSkills || []).slice(0, 8).map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
                  >
                    <Badge variant="outline">
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardView;