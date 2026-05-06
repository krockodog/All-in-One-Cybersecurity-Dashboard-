import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw } from 'lucide-react';

export type ToolParameterValue = string | number | boolean | string[] | File | null;

export type ToolParameterOption = {
  label: string;
  value: string;
};

export type ToolParameterField = {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'string' | 'number' | 'boolean' | 'multiselect' | 'file';
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<string | ToolParameterOption>;
  default?: string | number | boolean;
};

interface ToolParameterEditorProps {
  parameters: ToolParameterField[];
  values: Record<string, ToolParameterValue>;
  errors?: Record<string, string>;
  disabled?: boolean;
  title?: string;
  description?: string;
  showSummary?: boolean;
  onChange: (name: string, value: ToolParameterValue) => void;
  onReset?: () => void;
}

const normalizeOptions = (options?: Array<string | ToolParameterOption>): ToolParameterOption[] => {
  if (!options?.length) return [];

  return options.map(option =>
    typeof option === 'string'
      ? {
          label: option,
          value: option,
        }
      : option
  );
};

const isEmptyValue = (value: ToolParameterValue) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (typeof value === 'number') return Number.isNaN(value);
  if (typeof value === 'boolean') return false;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof File) return value.size === 0;
  return false;
};

export const validateToolParameters = (
  parameters: ToolParameterField[],
  values: Record<string, ToolParameterValue>
) => {
  const errors: Record<string, string> = {};

  parameters.forEach(parameter => {
    const value = values[parameter.name];

    if (parameter.required && isEmptyValue(value)) {
      errors[parameter.name] = `${parameter.label} ist erforderlich.`;
      return;
    }

    if (parameter.type === 'number' && !isEmptyValue(value)) {
      const numericValue = typeof value === 'number' ? value : Number(value);
      if (Number.isNaN(numericValue)) {
        errors[parameter.name] = `${parameter.label} muss eine gültige Zahl sein.`;
      }
    }
  });

  return errors;
};

export const ToolParameterEditor: React.FC<ToolParameterEditorProps> = ({
  parameters,
  values,
  errors = {},
  disabled = false,
  title = 'Parameter Editor',
  description = 'Konfiguriere die Eingabeparameter für das ausgewählte Tool.',
  showSummary = true,
  onChange,
  onReset,
}) => {
  const requiredCount = parameters.filter(parameter => parameter.required).length;
  const optionalCount = parameters.length - requiredCount;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onReset ? (
            <Button type="button" variant="outline" size="sm" onClick={onReset} disabled={disabled}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Standardwerte
            </Button>
          ) : null}
        </div>

        {showSummary ? (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{parameters.length} Felder</Badge>
            <Badge variant="outline">{requiredCount} Pflichtfelder</Badge>
            <Badge variant="outline">{optionalCount} optional</Badge>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-5">
        {parameters.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Für dieses Tool sind aktuell keine editierbaren Parameter hinterlegt.
          </div>
        ) : null}

        {parameters.map(parameter => {
          const fieldId = `tool-parameter-${parameter.name}`;
          const fieldError = errors[parameter.name];
          const options = normalizeOptions(parameter.options);
          const value = values[parameter.name];

          return (
            <div key={parameter.name} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={fieldId} className="text-sm font-medium">
                  {parameter.label}
                  {parameter.required ? <span className="ml-1 text-destructive">*</span> : null}
                </Label>
                <Badge variant={parameter.required ? 'default' : 'secondary'}>
                  {parameter.required ? 'Pflicht' : 'Optional'}
                </Badge>
              </div>

              {parameter.description ? (
                <p className="text-xs text-muted-foreground">{parameter.description}</p>
              ) : null}

              {(parameter.type === 'text' || parameter.type === 'string') && (
                <Input
                  id={fieldId}
                  value={typeof value === 'string' ? value : ''}
                  placeholder={parameter.placeholder}
                  disabled={disabled}
                  onChange={event => onChange(parameter.name, event.target.value)}
                  aria-invalid={Boolean(fieldError)}
                />
              )}

              {parameter.type === 'number' && (
                <Input
                  id={fieldId}
                  type="number"
                  value={typeof value === 'number' || typeof value === 'string' ? value : ''}
                  placeholder={parameter.placeholder}
                  disabled={disabled}
                  onChange={event => onChange(parameter.name, event.target.value)}
                  aria-invalid={Boolean(fieldError)}
                />
              )}

              {parameter.type === 'textarea' && (
                <Textarea
                  id={fieldId}
                  value={typeof value === 'string' ? value : ''}
                  placeholder={parameter.placeholder}
                  disabled={disabled}
                  onChange={event => onChange(parameter.name, event.target.value)}
                  aria-invalid={Boolean(fieldError)}
                  rows={4}
                />
              )}

              {parameter.type === 'select' && (
                <Select
                  value={typeof value === 'string' ? value : ''}
                  onValueChange={nextValue => onChange(parameter.name, nextValue)}
                  disabled={disabled}
                >
                  <SelectTrigger id={fieldId} aria-invalid={Boolean(fieldError)}>
                    <SelectValue placeholder={parameter.placeholder ?? 'Option auswählen'} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem key={`${parameter.name}-${option.value}`} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {parameter.type === 'boolean' && (
                <div className="flex items-center justify-between rounded-lg border px-3 py-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{parameter.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Aktiviert oder deaktiviert die Option für diesen Lauf.
                    </p>
                  </div>
                  <Switch
                    checked={Boolean(value)}
                    onCheckedChange={checked => onChange(parameter.name, checked)}
                    disabled={disabled}
                    aria-invalid={Boolean(fieldError)}
                  />
                </div>
              )}

              {parameter.type === 'multiselect' && (
                <Textarea
                  id={fieldId}
                  value={Array.isArray(value) ? value.join('\n') : ''}
                  placeholder={parameter.placeholder ?? 'Je Wert eine Zeile'}
                  disabled={disabled}
                  onChange={event =>
                    onChange(
                      parameter.name,
                      event.target.value
                        .split('\n')
                        .map(entry => entry.trim())
                        .filter(Boolean)
                    )
                  }
                  aria-invalid={Boolean(fieldError)}
                  rows={4}
                />
              )}

              {parameter.type === 'file' && (
                <div className="space-y-2">
                  <Input
                    id={fieldId}
                    type="file"
                    disabled={disabled}
                    onChange={event => onChange(parameter.name, event.target.files?.[0] ?? null)}
                    aria-invalid={Boolean(fieldError)}
                  />
                  {value instanceof File ? (
                    <p className="text-xs text-muted-foreground">Ausgewählt: {value.name}</p>
                  ) : null}
                </div>
              )}

              {fieldError ? <p className="text-xs text-destructive">{fieldError}</p> : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
