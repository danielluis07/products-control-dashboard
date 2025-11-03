import { UpdateUserData } from "@/components/admin/settings/update-data";
import { UpdateUserPassword } from "@/components/admin/settings/update-password";
import { requireAuth } from "@/lib/auth-utils";

const SettingsPage = async () => {
  const { user } = await requireAuth();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Configurações</h2>
      <div className="flex flex-col md:flex-row gap-3">
        <UpdateUserPassword id={user.id} />
        <UpdateUserData id={user.id} name={user.name} email={user.email} />
      </div>
    </div>
  );
};

export default SettingsPage;
