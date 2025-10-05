import * as React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useApproveMilestone } from "./useApproveMilestone";
import { Loader2 } from "lucide-react";
import { useEscrowContext } from "@/components/tw-blocks/providers/EscrowProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ApproveMilestoneForm = () => {
  const { form, handleSubmit, isSubmitting } = useApproveMilestone();
  const { selectedEscrow } = useEscrowContext();

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6 w-full">
        <FormField
          control={form.control}
          name="milestoneIndex"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Milestone<span className="text-destructive ml-1">*</span>
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
                    {(selectedEscrow?.milestones || []).map((m, idx) => (
                      <SelectItem key={`ms-${idx}`} value={String(idx)}>
                        {m?.description || `Milestone ${idx + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <span className="ml-2">Approving...</span>
              </div>
            ) : (
              "Approve"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
