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

export const TargetForm = ({ onSubmit }: TargetFormProps): ReactElement => {
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

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    setType(event.target.value as TargetType);
  };

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value);
  };

  const handleTagsChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setTags(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4" data-testid="target-form">
      <TargetFormFields
        name={name}
        type={type}
        value={value}
        tags={tags}
        error={error}
        onNameChange={handleNameChange}
        onTypeChange={handleTypeChange}
        onValueChange={handleValueChange}
        onTagsChange={handleTagsChange}
      />
      <button data-testid="target-submit-button" type="submit" className="rounded-lg bg-neon/20 px-4 py-2 transition hover:bg-neon/30">
        Add Target
      </button>
    </form>
  );
};
