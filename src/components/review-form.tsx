"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { createReview } from "@/actions/products";
import { updateReview } from "@/actions/user";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: string;
  existingReview?: {
    id: string;
    rating: number;
    title?: string | null;
    content: string;
  } | null;
  onSuccess?: () => void;
}

const ReviewForm = ({
  productId,
  existingReview,
  onSuccess,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [content, setContent] = useState(existingReview?.content || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (content.trim().length < 5) {
      toast.error("Review content must be at least 5 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      if (existingReview) {
        await updateReview({
          reviewId: existingReview.id,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
        });
        toast.success("Review updated successfully!");
      } else {
        await createReview({
          productId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
        });
        toast.success("Review submitted successfully!");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? "Edit Your Review" : "Write a Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Rating *</Label>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    key={index}
                    type="button"
                    className="p-1 transition-colors"
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(starValue)}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        starValue <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  <>
                    {rating} star{rating !== 1 ? "s" : ""}
                  </>
                )}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title (Optional)
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Summarize your review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="content" className="text-sm font-medium">
              Review *
            </Label>
            <Textarea
              id="content"
              placeholder="Share your experience with this product..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              minLength={5}
              maxLength={1000}
              rows={4}
              className="mt-1"
              required
            />
            <div className="text-xs text-muted-foreground mt-1">
              {content.length}/1000 characters
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={
                isSubmitting || rating === 0 || content.trim().length < 5
              }
              className="flex-1"
            >
              {isSubmitting
                ? "Submitting..."
                : existingReview
                ? "Update Review"
                : "Submit Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
