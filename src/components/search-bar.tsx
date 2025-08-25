import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InputWithButton() {
  return (
    <div className="flex w-full flex-col max-w-2xl items-center gap-2">
      <Input
        type="text"
        placeholder="Search products, services & categories"
        className="w-full"
      />
      <Button type="submit" size={"lg"}>
        Search
      </Button>
    </div>
  );
}
