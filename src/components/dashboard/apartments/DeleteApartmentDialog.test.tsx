import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GraphQLError } from "@/lib/hasura/gql";
import { ApartmentActionsMenu } from "./ApartmentActionsMenu";
import { DeleteApartmentDialog } from "./DeleteApartmentDialog";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("DeleteApartmentDialog", () => {
  it("shows the confirmation copy", () => {
    render(
      <DeleteApartmentDialog
        open
        onOpenChange={jest.fn()}
        apartmentName="Los Yoses Apartment"
        onConfirm={jest.fn()}
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "Remove apartment" });
    expect(dialog).toHaveTextContent(
      "Remove Los Yoses Apartment? It will no longer be listed. Existing bookings and offers aren't affected.",
    );
    expect(screen.getByText("Los Yoses Apartment").tagName).toBe("STRONG");
  });

  it("closes after the backend confirms", async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    render(
      <DeleteApartmentDialog
        open
        onOpenChange={onOpenChange}
        apartmentName="Los Yoses Apartment"
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows the backend's message when it refuses, and stays open", async () => {
    const onOpenChange = jest.fn();
    const onConfirm = jest
      .fn()
      .mockRejectedValue(
        new GraphQLError(
          "Apartment has active reservations and can't be removed",
          "unexpected",
        ),
      );
    render(
      <DeleteApartmentDialog
        open
        onOpenChange={onOpenChange}
        apartmentName="Los Yoses Apartment"
        onConfirm={onConfirm}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Apartment has active reservations and can't be removed",
    );
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: "Remove" })).toBeEnabled();
  });
});

describe("ApartmentActionsMenu", () => {
  it("asks for confirmation in a dialog before removing", async () => {
    const onDelete = jest.fn().mockResolvedValue(undefined);
    render(
      <ApartmentActionsMenu
        apartmentId="2"
        apartmentName="Los Yoses Apartment"
        onDelete={onDelete}
      />,
    );
    const trigger = screen.getByRole("button", {
      name: "Apartment actions for Los Yoses Apartment",
    });
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(await screen.findByRole("menuitem", { name: "Delete" }));

    expect(
      await screen.findByRole("dialog", { name: "Remove apartment" }),
    ).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("2"));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});
