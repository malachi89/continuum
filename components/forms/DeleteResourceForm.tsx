import { Button } from "@/components/ui/Button";

type DeleteFormAction = (formData: FormData) => Promise<void>;

export function DeleteResourceForm({
  action,
  resourceIdName,
  resourceId,
  projectId,
  redirectTo,
  label,
}: {
  action: DeleteFormAction;
  resourceIdName: string;
  resourceId: string;
  projectId?: string;
  redirectTo: string;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name={resourceIdName} value={resourceId} />
      {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <Button type="submit" variant="danger">
        {label}
      </Button>
    </form>
  );
}
