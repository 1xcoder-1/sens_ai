"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateAssessment, submitAssessmentAnswers } from "@/actions/interview";
import QuizResult from "./quiz-result";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { motion } from "framer-motion";
import { Target, Brain, CheckCircle, Send } from "lucide-react";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const {
    loading: generatingQuiz,
    fn: generateQuizFn,
    data: quizData,
  } = useFetch(generateAssessment);

  const {
    loading: submittingAnswers,
    fn: submitAnswersFn,
    data: resultData,
  } = useFetch(submitAssessmentAnswers);

  useEffect(() => {
    if (quizData && quizData.questions) {
      // Initialize answers array
      setAnswers(new Array(quizData.questions.length).fill(null));
    }
  }, [quizData]);

  useEffect(() => {
    if (resultData) {
      setQuizResult(resultData);
      setQuizCompleted(true);
    }
  }, [resultData]);

  const handleAnswerSelect = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    try {
      // Submit answers to the server
      await submitAnswersFn(quizData.id, answers);
      toast.success("Quiz completed successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to submit quiz");
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizCompleted(false);
    setQuizResult(null);
    // Call generateAssessment with appropriate parameters
    generateQuizFn({ topic: "General Knowledge", difficulty: "Medium", questionCount: 10 });
  };

  if (generatingQuiz) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <BarLoader className="mt-4" width={"100%"} color="gray" />
        <p className="text-center mt-4 text-muted-foreground">Generating your quiz questions...</p>
      </motion.div>
    );
  }

  // Show results if quiz is completed
  if (quizCompleted && quizResult) {
    return (
      <QuizResult 
        result={quizResult} 
        onStartNew={startNewQuiz} 
      />
    );
  }

  if (!quizData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mx-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Ready to test your knowledge?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This quiz contains 10 multiple choice questions specific to your industry and
              skills. Choose the best answer for each question.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => generateQuizFn({ topic: "General Knowledge", difficulty: "Medium", questionCount: 10 })} 
              className="w-full gap-2"
            >
              <Brain className="h-4 w-4" />
              Start Quiz
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  const question = quizData.questions[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="mx-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Question {currentQuestion + 1} of {quizData.questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.p 
            className="text-lg font-medium"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {question.question}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <RadioGroup
              onValueChange={handleAnswerSelect}
              value={answers[currentQuestion] || ""}
              className="space-y-3"
            >
              {question.options?.map((option, index) => {
                const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                // Check if option already starts with the letter and period to avoid duplication
                const displayOption = option.startsWith(`${optionLabel}.`) 
                  ? option.substring(optionLabel.length + 2).trim() // Remove the "A. " part
                  : option;
                return (
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    <RadioGroupItem 
                      value={optionLabel} 
                      id={`option-${currentQuestion}-${index}`} 
                      className="border-2 border-primary" 
                    />
                    <Label 
                      htmlFor={`option-${currentQuestion}-${index}`} 
                      className="flex-1 cursor-pointer text-base"
                    >
                      <span className="font-medium mr-2">{optionLabel}.</span> {displayOption}
                    </Label>
                  </motion.div>
                );
              })}
            </RadioGroup>
          </motion.div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion] || submittingAnswers}
              className="gap-2"
            >
              {submittingAnswers ? (
                <>
                  <BarLoader width={"20px"} color="white" />
                  Submitting...
                </>
              ) : currentQuestion < quizData.questions.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Next Question
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Finish Quiz
                </>
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}