type Props = {
  id: string;
  name: string;
  label: string;
  hint?: string;
  error?: string | undefined;
  children: React.ReactNode;
};

export function Field({
  id,
  name,
  label,
  hint = "",
  error = "",
  children,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel id={id}> {label} </FieldLabel>
      {children}
      <FieldError hint={hint} error={error} name={name} />
    </div>
  );
}

export function FieldLabel({
  children,
  id,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="text-sm font-medium text-slate-800">
      {children}
    </label>
  );
}


function FieldError({
  name,
  hint,
  error,
}: {
  name: string;
  hint: string;
  error?: string;
}) {
  return (
    <>
      {error ? (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${name}-hint`} className="text-xs text-slate-500">
            {hint}
          </p>
        )
      )}
    </>
  );
}
