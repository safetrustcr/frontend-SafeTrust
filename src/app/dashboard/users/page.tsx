import { UserProfileCard } from "@/components/dashboard/UserProfileCard";
import { WalletAddressTable } from "@/components/dashboard/WalletAddressTable";

const STUB_USER = {
  id: "firebase-uid-stub",
  firstName: "John",
  lastName: "Smith",
  email: "john_s@gmail.com",
  phoneNumber: "+506 6489 5321",
  wallets: [{ address: "GASK...XN32", isPrimary: true, network: "Stellar" }],
};
// TODO: replace with useQuery(GET_CURRENT_USER) in GraphQL wiring issue

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">User Management</h1>
      <UserProfileCard user={STUB_USER} />
      <WalletAddressTable wallets={STUB_USER.wallets} />
    </div>
  );
}
