"use client";

import { Trophy, CheckCircle2, XCircle, RotateCcw, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function QuizResult({
  result,
  hideStartNew = false,
  onStartNew,
}) {
  if (!result) return null;

  // Calculate additional statistics
  const correctAnswers = result.questions?.filter(q => q.isCorrect).length || 0;
  const totalQuestions = result.questions?.length || 0;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <motion.div
      className="mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1 
        className="flex items-center gap-2 text-3xl gradient-title mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Trophy className="h-6 w-6 text-yellow-500" />
        Quiz Results
      </motion.h1>

      <CardContent className="space-y-6">
        {/* Score Overview */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200 stroke-current"
                  strokeWidth="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                ></circle>
                <circle
                  className="text-blue-500 stroke-current"
                  strokeWidth="10"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * result.quizScore) / 100}
                  transform="rotate(-90 50 50)"
                ></circle>
                <text
                  x="50"
                  y="50"
                  className="text-xl font-bold fill-current text-gray-700"
                  textAnchor="middle"
                  dy="0.3em"
                >
                  {result.quizScore.toFixed(1)}%
                </text>
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold">{result.quizScore.toFixed(1)}%</h3>
          <Progress value={result.quizScore} className="w-full h-3" />
          <p className="text-muted-foreground">
            You answered {correctAnswers} out of {totalQuestions} questions correctly
          </p>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="bg-muted p-3 rounded-lg text-center">
            <BarChart className="h-5 w-5 mx-auto text-blue-500" />
            <p className="text-2xl font-bold">{accuracy.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="bg-muted p-3 rounded-lg text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-green-500" />
            <p className="text-2xl font-bold">{correctAnswers}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="bg-muted p-3 rounded-lg text-center">
            <XCircle className="h-5 w-5 mx-auto text-red-500" />
            <p className="text-2xl font-bold">{totalQuestions - correctAnswers}</p>
            <p className="text-xs text-muted-foreground">Incorrect</p>
          </div>
          <div className="bg-muted p-3 rounded-lg text-center">
            <Trophy className="h-5 w-5 mx-auto text-yellow-500" />
            <p className="text-2xl font-bold">{Math.round(result.quizScore)}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </motion.div>

        {/* Improvement Tip */}
        {result.improvementTip && (
          <motion.div
            className="bg-muted p-4 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <p className="font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Improvement Tip:
            </p>
            <p className="text-muted-foreground">{result.improvementTip}</p>
          </motion.div>
        )}

        {/* Questions Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 className="font-medium mb-3 text-foreground">Question Review</h3>
          <div className="space-y-4">
            {result.questions.map((q, index) => (
              <motion.div 
                key={index} 
                className="border rounded-lg p-4 space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground">{q.question}</p>
                  {q.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="text-sm bg-muted p-3 rounded">
                    <p className="font-medium text-foreground">Your Answer:</p>
                    <p className="mt-1 text-foreground">{q.userAnswer || "No answer provided"}</p>
                  </div>
                  <div className="text-sm bg-muted p-3 rounded">
                    <p className="font-medium text-foreground">Correct Answer:</p>
                    <p className="mt-1 text-foreground">{q.correctAnswerText}</p>
                  </div>
                </div>
                
                <div className="text-sm bg-muted p-3 rounded">
                  <p className="font-medium flex items-center gap-2 text-foreground">
                    <BarChart className="h-4 w-4" />
                    Explanation:
                  </p>
                  <p className="mt-1 text-foreground">{q.explanation}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </CardContent>

      {!hideStartNew && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <CardFooter>
            <Button onClick={onStartNew} className="w-full gap-2">
              <RotateCcw className="h-4 w-4" />
              Start New Quiz
            </Button>
          </CardFooter>
        </motion.div>
      )}
    </motion.div>
  );
}