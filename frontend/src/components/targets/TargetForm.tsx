import { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import { TargetType } from "@/types";
import { isValidTarget } from "@/utils/validators";

interface TargetFormProps {
  onSubmit: (payload: { name: string; type: TargetType; value: string; tags: string[] }) => void;
}

interface TargetFormFieldsProps {
  name: string;
  type: TargetType;
  value: string;
  tags: string;
  error: string;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTypeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onValueChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTagsChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

interface TargetFormState {
  name: string;
  type: TargetType;
  value: string;
  tags: string;
  error: string;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleTypeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  handleValueChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleTagsChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const targetTypes: TargetType[] = ["domain", "ip", "cidr", "url", "email", "username", "phone", "address"];

const TargetFormFields = ({
  name,
  type,
  value,
  tags,
  error,
  onNameChange,
  onTypeChange,
  onValueChange,
  onTagsChange,
}: TargetFormFieldsProps): ReactElement => (
  <>
    <input data-testid="target-name-input" value={name} onChange={onNameChange} placeholder="Target name" className="rounded-lg border border-white/10 bg-transparent px-3 py-2" required />
    <select data-testid="target-type-select" value={type} onChange={onTypeChange} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
      {targetTypes.map((targetType) => (
        <option key={targetType} value={targetType}>
          {targetType.toUpperCase()}
        </option>
      ))}
    </select>
    <input data-testid="target-value-input" value={value} onChange={onValueChange} placeholder="Target value" className="rounded-lg border border-white/10 bg-transparent px-3 py-2" required />
    <input data-testid="target-tags-input" value={tags} onChange={onTagsChange} placeholder="tags,comma,separated" className="rounded-lg border border-white/10 bg-transparent px-3 py-2" />
    {error && (
      <p className="text-sm text-red-400" data-testid="target-form-error">
        {error}
      </p>
    )}
  </>
);

const useTargetFormState = (onSubmit: TargetFormProps["onSubmit"]): TargetFormState => {
  const [name, setName] = useState("");
  const [type, setType] = useState<TargetType>("domain");
  const [value, setValue] = useState("");
  const [tags, setTags] = useState("redteam");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isValidTarget(type, value)) {
      setError("Invalid target value for selected type.");
      return;
    }
    onSubmit({ name, type, value, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) });
    setName("");
    setValue("");
    setError("");
  };

  return {
    name,
    type,
    value,
    tags,
    error,
    handleSubmit,
    handleNameChange: (event) => setName(event.target.value),
    handleTypeChange: (event) => setType(event.target.value as TargetType),
    handleValueChange: (event) => setValue(event.target.value),
    handleTagsChange: (event) => setTags(event.target.value),
  };
};

export const TargetForm = ({ onSubmit }: TargetFormProps): ReactElement => {
  const formState = useTargetFormState(onSubmit);

  return (
    <form onSubmit={formState.handleSubmit} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4" data-testid="target-form">
      <TargetFormFields
        name={formState.name}
        type={formState.type}
        value={formState.value}
        tags={formState.tags}
        error={formState.error}
        onNameChange={formState.handleNameChange}
        onTypeChange={formState.handleTypeChange}
        onValueChange={formState.handleValueChange}
        onTagsChange={formState.handleTagsChange}
      />
      <button data-testid="target-submit-button" type="submit" className="rounded-lg bg-neon/20 px-4 py-2 transition hover:bg-neon/30">
        Add Target
      </button>
    </form>
  );
};
