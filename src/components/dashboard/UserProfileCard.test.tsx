import { render, screen } from "@testing-library/react";
import { UserProfileCard } from "./UserProfileCard";

const user = {
  id: "1",
  firstName: "Ana",
  lastName: "Mora",
  email: "ana@example.com",
  phoneNumber: "",
};

describe("UserProfileCard", () => {
  it("links Edit Profile to the profile page instead of editing inline", () => {
    render(<UserProfileCard user={user} />);

    expect(screen.getByRole("link", { name: /edit profile/i })).toHaveAttribute(
      "href",
      "/dashboard/profile",
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /save/i }),
    ).not.toBeInTheDocument();
  });

  it("hides the phone line when it is empty", () => {
    const { rerender } = render(<UserProfileCard user={user} />);
    expect(screen.queryByText("+506 1234")).not.toBeInTheDocument();
    rerender(<UserProfileCard user={{ ...user, phoneNumber: "+506 1234" }} />);
    expect(screen.getByText("+506 1234")).toBeInTheDocument();
  });
});
