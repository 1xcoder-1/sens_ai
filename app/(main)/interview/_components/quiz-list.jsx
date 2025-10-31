"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import QuizResult from "./quiz-result";
import { motion } from "framer-motion";
import { Target, Trash2 } from "lucide-react";
import { deleteAssessment } from "@/actions/interview";
import { toast } from "sonner";

export default function QuizList({ assessments, onAssessmentsChange }) {
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [deleteQuizId, setDeleteQuizId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteQuiz = async (assessmentId) => {
    setIsDeleting(true);
    try {
      await deleteAssessment(assessmentId);
      // Notify parent component to refresh the assessments
      if (onAssessmentsChange) {
        onAssessmentsChange();
      }
      toast.success("Quiz deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete quiz");
    } finally {
      setIsDeleting(false);
      setDeleteQuizId(null);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="gradient-title text-3xl md:text-4xl flex items-center gap-2">
                  <Target className="h-6 w-6" />
                  Recent Quizzes
                </CardTitle>
                <CardDescription>
                  Review your past quiz performance
                </CardDescription>
              </div>
              <Button onClick={() => router.push("/interview/mock")}>
                Start New Quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessments?.map((assessment, i) => (
                <motion.div
                  key={assessment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <Card
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedQuiz(assessment)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="gradient-title text-2xl">
                            Quiz {i + 1}
                          </CardTitle>
                          <CardDescription className="flex justify-between w-full">
                            <div>Score: {assessment.quizScore.toFixed(1)}%</div>
                            <div>
                              {format(
                                new Date(assessment.createdAt),
                                "MMMM dd, yyyy HH:mm"
                              )}
                            </div>
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteQuizId(assessment.id);
                          }}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    {assessment.improvementTip && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {assessment.improvementTip}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle></DialogTitle>
          </DialogHeader>
          <QuizResult
            result={selectedQuiz}
            hideStartNew
            onStartNew={() => router.push("/interview/mock")}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteQuizId} onOpenChange={() => setDeleteQuizId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quiz
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteQuiz(deleteQuizId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}