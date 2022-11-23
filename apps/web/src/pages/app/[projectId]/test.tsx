import { useState } from "react";
import { useLoccyURLData } from "~/utils/hooks/useLoccyURLData";
import { trpc } from "~/utils/trpc";

export default function TestPage() {
  const { branchName, projectId, locale } = useLoccyURLData();
  const [keyName, setKeyName] = useState("");
  const { mutateAsync } = trpc.project.getKeyTranslations.useMutation();
  return (
    <div>
      <input value={keyName} onChange={(e) => setKeyName(e.target.value)} />
      <button
        onClick={() =>
          mutateAsync({
            branchName,
            projectId,
            key: keyName,
            locale,
          })
        }
      >
        MMM
      </button>
    </div>
  );
}
