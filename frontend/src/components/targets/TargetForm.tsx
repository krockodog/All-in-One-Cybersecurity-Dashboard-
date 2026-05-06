import { FormEvent, useState } from "react";
import { TargetType } from "@/types";
import { isValidTarget } from "@/utils/validators";

interface TargetFormProps {
  onSubmit: (payload: { name: string; type: TargetType; value: string; tags: string[] }) => void;
}

const targetTypes: TargetType[] = ["domain", "ip", "cidr", "url", "email", "username", "phone", "address"];

export const TargetForm = ({ onSubmit }: TargetFormProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<TargetType>("domain");
  const [value, setValue] = useState("");
  const [tags, setTags] = useState("redteam");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
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

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4" data-testid="target-form">
      <input data-testid="target-name-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Target name" className="rounded-lg border border-white/10 bg-transparent px-3 py-2" required />
      <select data-testid="target-type-select" value={type} onChange={(event) => setType(event.target.value as TargetType)} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
        {targetTypes.map((targetType) => (
          <option key={targetType} value={targetType}>
            {targetType.toUpperCase()}
          </option>
        ))}
      </select>
      <input data-testid="target-value-input" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Target value" className="rounded-lg border border-white/10 bg-transparent px-3 py-2" required />
      <input data-testid="target-tags-input" value={tags} onChange={(event) => setTags(event.target.value)} placeholder="tags,comma,separated" className="rounded-lg border border-white/10 bg-transparent px-3 py-2" />
      {error && <p className="text-sm text-red-400" data-testid="target-form-error">{error}</p>}
      <button data-testid="target-submit-button" type="submit" className="rounded-lg bg-neon/20 px-4 py-2 transition hover:bg-neon/30">
        Add Target
      </button>
    </form>
  );
};
