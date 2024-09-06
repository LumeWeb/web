import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";

export default function Addons() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add-ons</CardTitle>
      </CardHeader>
      <CardContent>{/* ... (add-ons content) */}</CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Add-ons
        </Button>
      </CardFooter>
    </Card>
  );
}
