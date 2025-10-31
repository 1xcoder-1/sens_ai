"use client";

import { useEffect, useState, useRef } from "react";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  Target, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Bell,
  AlertCircle,
  Square
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { getAssessments } from "@/actions/interview";
import { toast } from "sonner";

export default function InterviewPrepPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [timerSettings, setTimerSettings] = useState({
    questionTime: 120, // 2 minutes per question
    warningTime: 30,   // 30 seconds warning
    autoNext: true,    // Auto move to next question
  });
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [warningActive, setWarningActive] = useState(false);
  const audioRef = useRef(null);

  const fetchAssessments = async () => {
    try {
      const data = await getAssessments();
      setAssessments(data || []);
    } catch (error) {
      console.error("Failed to fetch assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => {
          const newSeconds = seconds + 1;
          
          // Warning alert
          if (newSeconds >= (timerSettings.questionTime - timerSettings.warningTime)) {
            setWarningActive(true);
            if (newSeconds === (timerSettings.questionTime - timerSettings.warningTime)) {
              toast.warning("Time is running out!", {
                description: `${timerSettings.warningTime} seconds remaining`,
                icon: <AlertCircle className="h-4 w-4" />
              });
            }
          }
          
          // Auto next question
          if (newSeconds >= timerSettings.questionTime && timerSettings.autoNext) {
            handleNextQuestion();
          }
          
          return newSeconds;
        });
      }, 1000);
    } else if (!timerActive && timerSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSettings]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const stopTimer = () => {
    setTimerActive(false);
    toast.info("Practice timer stopped");
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(0);
    setWarningActive(false);
    setCurrentQuestion(1);
    toast.info("Practice timer reset");
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
      setTimerSeconds(0);
      setWarningActive(false);
      toast.info(`Moving to question ${currentQuestion + 1}`);
    } else {
      setTimerActive(false);
      toast.success("Practice session completed!");
    }
  };

  const handleInterviewTips = () => {
    setShowTips(!showTips);
    if (!showTips) {
      toast.info("Interview tips section expanded");
    }
  };

  const handlePracticeTimer = () => {
    toast.info("Practice timer activated");
    toggleTimer();
  };

  const updateTimerSettings = (key, value) => {
    setTimerSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Calculate additional stats
  const totalQuizzes = assessments?.length || 0;
  const highestScore = assessments?.length 
    ? Math.max(...assessments.map(a => a.quizScore)) 
    : 0;
  const avgTimePerQuiz = assessments?.length 
    ? (assessments.reduce((sum, a) => sum + (a.questions?.length || 0), 0) * 2) / assessments.length 
    : 0; // Assuming 2 minutes per question

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
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-title">
            Interview Preparation
          </h1>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-wrap gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Link href="/interview/mock" className="w-full sm:w-auto">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Target className="h-5 w-5" />
            Start New Quiz
          </Button>
        </Link>
        <Button 
          variant="outline" 
          size="lg" 
          className="gap-2 w-full sm:w-auto"
          onClick={handleInterviewTips}
        >
          <BookOpen className="h-5 w-5" />
          Interview Tips
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="gap-2 w-full sm:w-auto"
          onClick={handlePracticeTimer}
        >
          {timerActive ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          Practice Timer
        </Button>
      </motion.div>

      {/* Practice Timer Display */}
      {timerActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={warningActive ? "border-yellow-500 border-2" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Practice Timer
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowTimerSettings(!showTimerSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timer Display */}
                <div className="text-center">
                  <div className={`text-3xl md:text-4xl font-mono ${warningActive ? "text-yellow-500" : "text-foreground"}`}>
                    {formatTime(timerSeconds)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Question {currentQuestion} of {totalQuestions}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${warningActive ? "bg-yellow-500" : "bg-primary"}`}
                    style={{ 
                      width: `${Math.min(100, (timerSeconds / timerSettings.questionTime) * 100)}%` 
                    }}
                  ></div>
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={toggleTimer} className="w-12 h-12 sm:w-auto sm:h-auto">
                    {timerActive ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    <span className="sr-only sm:not-sr-only sm:ml-2">
                      {timerActive ? 'Pause' : 'Play'}
                    </span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={stopTimer} className="w-12 h-12 sm:w-auto sm:h-auto">
                    <Square className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-2">
                      Stop
                    </span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetTimer} className="w-12 h-12 sm:w-auto sm:h-auto">
                    <RotateCcw className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-2">
                      Reset
                    </span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextQuestion} className="w-12 h-12 sm:w-auto sm:h-auto">
                    Next Question
                  </Button>
                </div>

                {/* Timer Settings Panel */}
                {showTimerSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t pt-4 mt-4"
                  >
                    <h4 className="font-medium mb-3">Timer Settings</h4>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <Label htmlFor="question-time">Time per question (seconds)</Label>
                        <Input
                          id="question-time"
                          type="number"
                          value={timerSettings.questionTime}
                          onChange={(e) => updateTimerSettings('questionTime', parseInt(e.target.value))}
                          className="w-full sm:w-24"
                          min="30"
                          max="600"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <Label htmlFor="warning-time">Warning time (seconds)</Label>
                        <Input
                          id="warning-time"
                          type="number"
                          value={timerSettings.warningTime}
                          onChange={(e) => updateTimerSettings('warningTime', parseInt(e.target.value))}
                          className="w-full sm:w-24"
                          min="10"
                          max="120"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <Label htmlFor="auto-next">Auto next question</Label>
                        <div className="flex items-center">
                          <input
                            id="auto-next"
                            type="checkbox"
                            checked={timerSettings.autoNext}
                            onChange={(e) => updateTimerSettings('autoNext', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <Label htmlFor="total-questions">Total questions</Label>
                        <Input
                          id="total-questions"
                          type="number"
                          value={totalQuestions}
                          onChange={(e) => setTotalQuestions(parseInt(e.target.value))}
                          className="w-full sm:w-24"
                          min="1"
                          max="20"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StatsCards assessments={assessments} />
      </motion.div>

      {/* Additional Stats Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              Completed assessments
            </p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highestScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Your best performance
            </p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time/Quiz</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgTimePerQuiz)}m</div>
            <p className="text-xs text-muted-foreground">
              Estimated completion time
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <PerformanceChart assessments={assessments} />
      </motion.div>

      {/* Interview Tips Section */}
      {showTips && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Interview Success Tips
              </CardTitle>
              <CardDescription>
                Proven strategies to excel in your interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-2">
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-sm">
                    Research the company thoroughly before the interview
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="mt-1 w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm">
                    Practice answering common interview questions aloud
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="mt-1 w-2 h-2 rounded-full bg-purple-500"></div>
                  <p className="text-sm">
                    Prepare specific examples using the STAR method
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="mt-1 w-2 h-2 rounded-full bg-orange-500"></div>
                  <p className="text-sm">
                    Dress professionally and arrive 10-15 minutes early
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
                  <p className="text-sm">
                    Ask thoughtful questions about the role and company
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="mt-1 w-2 h-2 rounded-full bg-teal-500"></div>
                  <p className="text-sm">
                    Follow up with a thank-you email within 24 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quiz List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <QuizList 
          assessments={assessments} 
          onAssessmentsChange={fetchAssessments} 
        />
      </motion.div>

      {/* Spacer to prevent content from touching footer */}
      <div className="h-8"></div>
    </div>
  );
}