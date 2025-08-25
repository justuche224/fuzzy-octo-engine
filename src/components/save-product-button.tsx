"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { saveProduct, unsaveProduct } from "@/actions/user";
import { toast } from "sonner";

const SaveProductButton = ({
  productId,
  isSaved: initialIsSaved,
  onSaveChange,
}: {
  productId: string;
  isSaved: boolean;
  onSaveChange?: (isSaved: boolean) => void;
}) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggleSave = async () => {
    if (isPending) return;

    startTransition(async () => {
      try {
        if (isSaved) {
          await unsaveProduct(productId);
          setIsSaved(false);
          onSaveChange?.(false);
          toast.success("Product removed from saved items");
        } else {
          await saveProduct(productId);
          setIsSaved(true);
          onSaveChange?.(true);
          toast.success("Product saved to your list");
        }
      } catch (error) {
        console.error("Failed to toggle save status:", error);

        let errorMessage = "Failed to update saved status. Please try again.";

        if (error instanceof Error) {
          switch (error.message) {
            case "Product already saved":
              errorMessage = "Product is already in your saved items";
              break;
            case "Unauthorized":
              errorMessage = "Please sign in to save products";
              break;
            case "Failed to save product":
              errorMessage =
                "Unable to save product. Please check your connection and try again.";
              break;
            case "Failed to unsave product":
              errorMessage =
                "Unable to remove product from saved items. Please try again.";
              break;
            default:
              errorMessage = "An unexpected error occurred. Please try again.";
          }
        }

        toast.error(errorMessage);
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggleSave}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart
          className={`w-4 h-4 transition-colors ${
            isSaved
              ? "fill-red-500 text-red-500"
              : "text-muted-foreground hover:text-red-500"
          }`}
        />
      )}
    </Button>
  );
};

export default SaveProductButton;
