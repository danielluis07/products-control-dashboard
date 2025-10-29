import { requireAuth } from "@/lib/auth-utils";

const MainPage = async () => {
  const { user } = await requireAuth();
  return (
    <div>
      <p>Welcome, {user.name}!</p>
    </div>
  );
};

export default MainPage;
