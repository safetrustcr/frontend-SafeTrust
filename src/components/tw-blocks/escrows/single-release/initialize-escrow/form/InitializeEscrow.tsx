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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useInitializeEscrow } from "./useInitializeEscrow";
import { Trash2, DollarSign, Percent, Loader2 } from "lucide-react";
import Link from "next/link";
import { trustlineOptions } from "@/components/tw-blocks/wallet-kit/trustlines";

export const InitializeEscrowForm = () => {
  const {
    form,
    isSubmitting,
    milestones,
    isAnyMilestoneEmpty,
    handleSubmit,
    handleAddMilestone,
    handleRemoveMilestone,
    fillTemplateForm,
  } = useInitializeEscrow();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;
    rawValue = rawValue.replace(/[^0-9.]/g, "");

    if (rawValue.split(".").length > 2) {
      rawValue = rawValue.slice(0, -1);
    }

    // Limit to 2 decimal places
    if (rawValue.includes(".")) {
      const parts = rawValue.split(".");
      if (parts[1] && parts[1].length > 2) {
        rawValue = parts[0] + "." + parts[1].slice(0, 2);
      }
    }

    // Always keep as string to allow partial input like "0." or "0.5"
    form.setValue("amount", rawValue);
  };

  const handlePlatformFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;
    rawValue = rawValue.replace(/[^0-9.]/g, "");

    if (rawValue.split(".").length > 2) {
      rawValue = rawValue.slice(0, -1);
    }

    // Limit to 2 decimal places
    if (rawValue.includes(".")) {
      const parts = rawValue.split(".");
      if (parts[1] && parts[1].length > 2) {
        rawValue = parts[0] + "." + parts[1].slice(0, 2);
      }
    }

    // Always keep as string to allow partial input like "0." or "0.5"
    form.setValue("platformFee", rawValue);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
          <Link
            className="flex-1"
            href="https://docs.trustlesswork.com/trustless-work/technology-overview/escrow-types"
            target="_blank"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <h2 className="text-xl font-semibold">Single Release Escrow</h2>
            </div>
            <p className="text-muted-foreground mt-1">
              Fill out the form to initialize a single release escrow milestones
            </p>
          </Link>
          {process.env.NODE_ENV !== "production" && (
            <Button
              type="button"
              variant="outline"
              onClick={fillTemplateForm}
              className="cursor-pointer"
            >
              Autofill
            </Button>
          )}
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Title<span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Escrow title"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="engagementId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Engagement<span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter identifier"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trustline.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Trustline<span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(e) => {
                      field.onChange(e);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select trustline" />
                    </SelectTrigger>
                    <SelectContent>
                      {trustlineOptions
                        .filter((option) => option.value)
                        .map((option, index) => (
                          <SelectItem
                            key={`${option.value}-${index}`}
                            value={option.value}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="roles.approver"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span className="flex items-center">
                    Approver<span className="text-destructive ml-1">*</span>
                  </span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter approver address"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roles.serviceProvider"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span className="flex items-center">
                    Service Provider
                    <span className="text-destructive ml-1">*</span>
                  </span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter service provider address"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="roles.releaseSigner"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span className="flex items-center">
                    Release Signer
                    <span className="text-destructive ml-1">*</span>
                  </span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter release signer address"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roles.disputeResolver"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span className="flex items-center">
                    Dispute Resolver
                    <span className="text-destructive ml-1">*</span>
                  </span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter dispute resolver address"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="roles.platformAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span className="flex items-center">
                    Platform Address
                    <span className="text-destructive ml-1">*</span>
                  </span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter platform address"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roles.receiver"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span className="flex items-center">
                    Receiver<span className="text-destructive ml-1">*</span>
                  </span>
                </FormLabel>

                <FormControl>
                  <Input
                    placeholder="Enter receiver address"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="platformFee"
            render={() => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Platform Fee<span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Percent
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <Input
                      placeholder="Enter platform fee"
                      className="pl-10"
                      value={form.watch("platformFee")?.toString() || ""}
                      onChange={handlePlatformFeeChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={() => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Amount<span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      size={18}
                    />
                    <Input
                      placeholder="Enter amount"
                      className="pl-10"
                      value={form.watch("amount")?.toString() || ""}
                      onChange={handleAmountChange}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="receiverMemo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  Receiver Memo (opcional)
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter the escrow receiver Memo"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Description<span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escrow description"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel className="flex items-center">
            Milestones<span className="text-destructive ml-1">*</span>
          </FormLabel>
          {milestones.map((milestone, index) => (
            <div key={index}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Input
                  placeholder="Milestone Description"
                  value={milestone.description}
                  className="w-full sm:flex-1"
                  onChange={(e) => {
                    const updatedMilestones = [...milestones];
                    updatedMilestones[index].description = e.target.value;
                    form.setValue("milestones", updatedMilestones);
                  }}
                />

                <Button
                  onClick={() => handleRemoveMilestone(index)}
                  className="p-2 bg-transparent text-destructive rounded-md border-none shadow-none hover:bg-transparent hover:shadow-none hover:text-destructive focus:ring-0 active:ring-0 self-start sm:self-center cursor-pointer"
                  disabled={milestones.length === 1}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              {index === milestones.length - 1 && (
                <div className="flex justify-end mt-4">
                  <Button
                    disabled={isAnyMilestoneEmpty}
                    className="w-full md:w-1/4 cursor-pointer"
                    variant="outline"
                    onClick={handleAddMilestone}
                    type="button"
                  >
                    Add Item
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-start">
          <Button
            className="w-full md:w-1/4 cursor-pointer"
            type="submit"
            disabled={isAnyMilestoneEmpty || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Deploying...</span>
              </div>
            ) : (
              "Deploy"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
