import { useRouter } from "next/router";
import { Timeline } from "../components/Timeline";

export default function UserPage({ userId }: { userId: string }) {
  const router = useRouter();

  const name = router.query.name as string;

  return (
    <div>
      <Timeline userId={userId} where={{ author: { name } }} />
    </div>
  );
}
