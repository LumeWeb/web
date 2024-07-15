import { Cross2Icon } from "@radix-ui/react-icons";
import { useMemo } from "react";
//import type { PinningStatus } from "~/data/pinning";
//import { usePinning } from "~/hooks/usePinning";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const PinningNetworkBanner = () => {
  /*const { progressData: data } = usePinning();

  const itemsQueued = useMemo(
    () =>
      data?.items.filter((item: PinningStatus) =>
        item.status.includes("queued"),
      ) || [],
    [data],
  );

  const itemsProcessing = useMemo(
    () =>
      data?.items.filter((item: PinningStatus) =>
        item.status.includes("processing"),
      ) || [],
    [data],
  );

  const completedItems = useMemo(
    () =>
      data?.items.filter((item: PinningStatus) =>
        item.status.includes("completed"),
      ) || [],
    [data],
  );*/
  const itemsQueued = [];
  const itemsProcessing = [];
  const completedItems = [];
  const data = {
    items: [],
  };

  return (
    <div
      className={`bg-background border border-border rounded-lg absolute w-1/3 bottom-4 right-4 ${
        !data?.items.length ? "hidden" : "block"
      }`}>
      <Accordion type="single" defaultValue="item-1" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="font-bold bg-primary px-4 rounded-tr-lg rounded-tl-lg">
            {`${completedItems.length}/${data?.items.length} items completed`}
          </AccordionTrigger>
          <AccordionContent>
            <Tabs className="w-full" defaultValue="inProgress">
              <TabsList className="rounded-none">
                <TabsTrigger value="queued">Queued</TabsTrigger>
                <TabsTrigger value="inProgress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="queued">
                {itemsQueued.length ? (
                  itemsQueued.map((item /*: PinningStatus*/) => (
                    <PinCidItem key={item.id} item={item} />
                  ))
                ) : (
                  <div className="text-muted-foreground text-sm flex justify-center items-center h-10">
                    Nothing yet.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="inProgress">
                {itemsProcessing.length ? (
                  itemsProcessing.map((item /*: PinningStatus*/) => (
                    <PinCidItem key={item.id} item={item} />
                  ))
                ) : (
                  <div className="text-muted-foreground text-sm flex justify-center items-center h-10">
                    Nothing yet.
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed">
                {completedItems.length ? (
                  completedItems.map((item /*: PinningStatus*/) => (
                    <PinCidItem key={item.id} item={item} />
                  ))
                ) : (
                  <div className="text-muted-foreground text-sm flex justify-center items-center h-10">
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

const PinCidItem = ({ item }: { item /*: PinningStatus */ }) => {
  //const { unpin } = usePinning();

  return (
    <div className="px-4 mb-4">
      <div className="relative flex flex-col items-center rounded-lg py-2 px-4 hover:bg-primary/50 group">
        <div className="flex justify-between items-center w-full">
          <span className="font-semibold">{item.id}</span>
          <span className="group-hover:hidden">{item.progress}%</span>
          {item.status === "completed" ? (
            <Button
              variant="ghost"
              className="absolute top-2 right-2 hidden group-hover:flex rounded-full h-3"
              onClick={() => {
                /*unpin({
                  cid: item.id,
                })*/
              }}>
              <Cross2Icon />
            </Button>
          ) : null}
        </div>
        <Progress value={item.progress} className="h-2" />
      </div>
    </div>
  );
};
