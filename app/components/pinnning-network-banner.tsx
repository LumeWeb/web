import { useEffect, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Progress } from "./ui/progress";
import { usePinning } from "~/hooks/usePinnning";
import { IPinningData } from "~/providers/PinningProvider";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";

export const PinningNetworkBanner = () => {
  const { cidList } = usePinning();

  const itemsLeft = useMemo(
    () => cidList.filter((item) => item.progress < 100),
    [cidList],
  );

  const completedItems = useMemo(
    () => cidList.filter((item) => item.progress === 100),
    [cidList],
  );

  return (
    <div
      className={`border border-border rounded-lg absolute w-1/3 bottom-4 right-4 ${
        !cidList.length ? "hidden" : "block"
      }`}>
      <Accordion type="single" defaultValue="item-1" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="font-bold bg-primary px-4 rounded-tr-lg rounded-tl-lg">
            {`${completedItems.length}/${cidList.length} items completed`}
          </AccordionTrigger>
          <AccordionContent>
            <Tabs className="w-full" defaultValue="inProgress">
              <TabsList className="rounded-none">
                <TabsTrigger value="inProgress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="inProgress">
                {itemsLeft.length ? (
                  itemsLeft.map((cid) => (
                    <PinCidItem key={cid.cid} item={cid} />
                  ))
                ) : (
                  <div className="text-primary-2 text-sm flex justify-center items-center h-10">
                    Nothing yet.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed">
                {completedItems.length ? (
                  completedItems.map((cid) => (
                    <PinCidItem key={cid.cid} item={cid} />
                  ))
                ) : (
                  <div className="text-muted text-sm flex justify-center items-center h-10">
                    Nothing yet.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const PinCidItem = ({ item }: { item: IPinningData }) => {
  const { getProgress, onRemoveCidFromList } = usePinning();

  useEffect(() => {
    if (item.progress < 100) {
      const intervalId = setInterval(() => {
        getProgress(item.cid);
      }, 1000); // Adjust the interval time (1000ms = 1 second) as needed

      return () => clearInterval(intervalId); // Clear interval on component unmount
    }
  }, [getProgress, item]); // Add dependencies to ensure the effect runs correctly

  return (
    <div className="px-4 mb-4">
      <div className="flex justify-between items-center rounded-lg h-10 py-2 px-4 hover:bg-primary/50 group">
        <span className="font-semibold">{item.cid}</span>
        <span className="group-hover:hidden">{item.progress}%</span>
        <div className="gap-x-2 hidden group-hover:flex">
          <Button
            variant="ghost"
            className="p-2 rounded-full h-6"
            onClick={() => onRemoveCidFromList(item.cid)}>
            <Cross2Icon />
          </Button>
        </div>
      </div>
      <Progress
        value={item.progress}
        className="h-2 w-[calc(100%-1rem)] ml-2"
      />
    </div>
  );
};
