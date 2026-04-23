import * as React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useChangeMilestoneStatus } from "./useChangeMilestoneStatus";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ChangeMilestoneStatusDialog = ({
  showSelectMilestone = false,
  milestoneIndex,
}: {
  showSelectMilestone?: boolean;
  milestoneIndex?: number | string;
}) => {
  const { form, handleSubmit, isSubmitting } = useChangeMilestoneStatus();
  const { selectedEscrow } = useEscrowContext();

  React.useEffect(() => {
    if (
      !showSelectMilestone &&
      milestoneIndex !== undefined &&
      milestoneIndex !== null
    ) {
      form.setValue("milestoneIndex", String(milestoneIndex));
    }
  }, [showSelectMilestone, milestoneIndex, form]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" className="cursor-pointer w-full">
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Milestone Status</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-6 w-full"
          >
            <div
              className={`grid grid-cols-1 ${
                showSelectMilestone ? "lg:grid-cols-2" : "lg:grid-cols-1"
              } gap-4`}
            >
              {showSelectMilestone && (
                <FormField
                  control={form.control}
                  name="milestoneIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Milestone
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(e) => {
                            field.onChange(e);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select milestone" />
                          </SelectTrigger>
                          <SelectContent>
                            {(selectedEscrow?.milestones || []).map(
                              (m, idx) => (
                                <SelectItem
                                  key={`ms-${idx}`}
                                  value={String(idx)}
                                >
                                  {m?.description || `Milestone ${idx + 1}`}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Status<span className="text-destructive ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter new status" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="evidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter evidence (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="ml-2">Updating...</span>
                  </div>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
