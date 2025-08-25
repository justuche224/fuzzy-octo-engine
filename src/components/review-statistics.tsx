"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface ReviewStatisticsProps {
  statistics: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Array<{
      rating: number;
      count: number;
      percentage: number;
    }>;
  };
}

const ReviewStatistics = ({ statistics }: ReviewStatisticsProps) => {
  if (statistics.totalReviews === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No reviews yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">
              {statistics.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${
                    index < Math.round(statistics.averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {statistics.totalReviews} review
              {statistics.totalReviews !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="space-y-3">
            {statistics.ratingDistribution.map((dist) => (
              <div key={dist.rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm">{dist.rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </div>
                <Progress value={dist.percentage} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-8">
                  {dist.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewStatistics;
