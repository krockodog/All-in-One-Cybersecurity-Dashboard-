import { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/utils/api";
import { User } from "@/types";

export default function UsersPage(): ReactElement {
  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch<{ data: User[] }>("/api/v1/users")
  });

  return (
    <section className="space-y-3" data-testid="users-page">
      <h2 className="text-2xl font-semibold">Users</h2>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm" data-testid="users-table">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2">Username</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {(users.data?.data ?? []).map((user) => (
              <tr key={user.id} className="border-t border-white/10" data-testid={`user-row-${user.id}`}>
                <td className="px-3 py-2">{user.username}</td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2 uppercase">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
