import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InputWithButton() {
  return (
    <div className="flex w-full items-center gap-2">
      <Input
        type="text"
        placeholder="Search products, services & categories"
        className="w-full"
      />
      <Button type="submit" variant="outline">
        Search
      </Button>
    </div>
  );
}
