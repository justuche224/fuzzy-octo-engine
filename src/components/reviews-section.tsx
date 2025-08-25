"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Star, User, ThumbsUp, Edit, Trash2, Plus } from "lucide-react";
import ReviewForm from "@/components/review-form";
import ReviewStatistics from "@/components/review-statistics";
import {
  canUserReview,
  getUserReviewForProduct,
  deleteReview,
  markReviewHelpful,
} from "@/actions/user";
import { getProductReviews, getReviewStatistics } from "@/actions/products";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  helpful: number | null;
  verified: boolean | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

interface UserReview {
  id: string;
  rating: number;
  title?: string | null;
  content: string;
  helpful: number | null;
  verified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewsSectionProps {
  productId: string;
  initialReviews: Review[];
  initialStatistics?: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Array<{
      rating: number;
      count: number;
      percentage: number;
    }>;
  };
  currentUserId?: string;
}

const ReviewsSection = ({
  productId,
  initialReviews,
  initialStatistics,
  currentUserId,
}: ReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [statistics, setStatistics] = useState(initialStatistics);
  const [userReview, setUserReview] = useState<UserReview | null>(null);
  const [reviewEligibility, setReviewEligibility] = useState<{
    canReview: boolean;
    reason?: string;
    hasReview?: boolean;
  }>({ canReview: false });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchUserReviewData = async () => {
      if (!currentUserId) return;

      try {
        const [eligibility, existingReview] = await Promise.all([
          canUserReview(productId),
          getUserReviewForProduct(productId),
        ]);

        setReviewEligibility(eligibility);
        setUserReview(existingReview);
      } catch (error) {
        console.error("Error fetching user review data:", error);
      }
    };

    fetchUserReviewData();
  }, [productId, currentUserId]);

  const handleReviewSuccess = async () => {
    setShowReviewForm(false);

    try {
      const [
        updatedReviews,
        updatedUserReview,
        updatedEligibility,
        updatedStatistics,
      ] = await Promise.all([
        getProductReviews({ productId, page: 1, limit: 10 }),
        getUserReviewForProduct(productId),
        canUserReview(productId),
        getReviewStatistics(productId),
      ]);

      setReviews(updatedReviews);
      setUserReview(updatedUserReview);
      setReviewEligibility(updatedEligibility);
      setStatistics(updatedStatistics);
    } catch (error) {
      console.error("Error refreshing reviews:", error);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    try {
      await deleteReview({ reviewId: userReview.id });
      toast.success("Review deleted successfully!");
      handleReviewSuccess();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await markReviewHelpful({ reviewId });

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { ...review, helpful: (review.helpful || 0) + 1 }
            : review
        )
      );

      toast.success("Marked as helpful!");
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      toast.error("Failed to mark as helpful");
    }
  };

  const canShowReviewForm =
    currentUserId && (reviewEligibility.canReview || userReview);

  return (
    <div className="space-y-6">
      {statistics && <ReviewStatistics statistics={statistics} />}

      {canShowReviewForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {userReview ? "Your Review" : "Write a Review"}
              </CardTitle>
              {userReview && !showReviewForm && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReviewForm(true)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete your review? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteReview}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showReviewForm ? (
              <ReviewForm
                productId={productId}
                existingReview={userReview}
                onSuccess={handleReviewSuccess}
              />
            ) : userReview ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`w-4 h-4 ${
                          index < userReview.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Verified Purchase
                  </Badge>
                </div>
                {userReview.title && (
                  <h4 className="font-medium">{userReview.title}</h4>
                )}
                <p className="text-muted-foreground">{userReview.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    Posted {new Date(userReview.createdAt).toLocaleDateString()}
                  </span>
                  {(userReview.helpful || 0) > 0 && (
                    <span>{userReview.helpful || 0} found helpful</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Button onClick={() => setShowReviewForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Write Your Review
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Share your experience with this product
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!currentUserId && (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">
              Sign in to write a review for this product
            </p>
          </CardContent>
        </Card>
      )}

      {currentUserId && !reviewEligibility.canReview && !userReview && (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">
              {reviewEligibility.reason ||
                "You are not eligible to review this product"}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={review.user?.image || ""} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">
                          {review.user?.name || "Anonymous"}
                        </p>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={`w-4 h-4 ${
                                starIndex < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-medium mb-1">{review.title}</h4>
                      )}
                      <p className="text-muted-foreground mb-3">
                        {review.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                          {(review.helpful || 0) > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {review.helpful || 0} found helpful
                            </span>
                          )}
                          {currentUserId &&
                            currentUserId !== review.user?.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkHelpful(review.id)}
                                className="text-xs"
                              >
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Helpful
                              </Button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsSection;
