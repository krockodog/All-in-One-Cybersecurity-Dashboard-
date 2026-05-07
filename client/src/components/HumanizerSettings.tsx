/**
 * Humanizer Settings Component
 * Configure text humanization rules for reports
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface HumanizerConfig {
  language: 'de' | 'en';
  professionLevel: 'technical' | 'management' | 'mixed';
  sentenceVariation: boolean;
  activeVoicePreference: boolean;
  tonality: 'formal' | 'semi-formal' | 'direct';
  avoidAIPhrases: boolean;
  industryTerminology: boolean;
}

export function HumanizerSettings() {
  const [config, setConfig] = useState<HumanizerConfig>({
    language: 'de',
    professionLevel: 'mixed',
    sentenceVariation: true,
    activeVoicePreference: true,
    tonality: 'formal',
    avoidAIPhrases: true,
    industryTerminology: true,
  });

  const [testText, setTestText] = useState(
    'Es ist wichtig zu beachten, dass basierend auf den Daten, die wir gesammelt haben, ' +
    'es wurde festgestellt, dass es möglich ist, dass die Sicherheitslücke ausgenutzt werden könnte.'
  );

  const [preview, setPreview] = useState<{ original: string; humanized: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetPreview = async () => {
    setIsLoading(true);
    try {
      // Mock preview - in production, call API
      const humanized = testText
        .replace(/Es ist wichtig zu beachten, dass/gi, '')
        .replace(/basierend auf den Daten/gi, 'Die Analyse zeigt')
        .replace(/es wurde festgestellt, dass/gi, 'Wir haben festgestellt, dass')
        .replace(/es ist möglich, dass/gi, 'Es kann sein, dass')
        .replace(/Sicherheitslücke/gi, 'Schwachstelle');

      setPreview({
        original: testText,
        humanized,
      });
      toast.success('Preview generated');
    } catch (error) {
      toast.error('Failed to generate preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      // In production, call API to save config
      toast.success('Configuration saved');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  const handleCopyHumanized = () => {
    if (preview?.humanized) {
      navigator.clipboard.writeText(preview.humanized);
      toast.success('Copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎨 Humanizer Engine</span>
          </CardTitle>
          <CardDescription>
            Configure AI text humanization rules for professional report generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="settings" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select
                  value={config.language}
                  onValueChange={(value) =>
                    setConfig({ ...config, language: value as 'de' | 'en' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Professional Level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Professional Level</label>
                <Select
                  value={config.professionLevel}
                  onValueChange={(value) =>
                    setConfig({
                      ...config,
                      professionLevel: value as 'technical' | 'management' | 'mixed',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical (Experts)</SelectItem>
                    <SelectItem value="management">Management (C-Level)</SelectItem>
                    <SelectItem value="mixed">Mixed (Balanced)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tonality */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tonality</label>
                <Select
                  value={config.tonality}
                  onValueChange={(value) =>
                    setConfig({
                      ...config,
                      tonality: value as 'formal' | 'semi-formal' | 'direct',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="semi-formal">Semi-Formal</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sentence Variation</span>
                  <Switch
                    checked={config.sentenceVariation}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, sentenceVariation: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Voice Preference</span>
                  <Switch
                    checked={config.activeVoicePreference}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, activeVoicePreference: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avoid AI Phrases</span>
                  <Switch
                    checked={config.avoidAIPhrases}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, avoidAIPhrases: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Industry Terminology</span>
                  <Switch
                    checked={config.industryTerminology}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, industryTerminology: checked })
                    }
                  />
                </div>
              </div>

              {/* Save Button */}
              <Button onClick={handleSaveConfig} className="w-full">
                Save Configuration
              </Button>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Test Text</label>
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg bg-background text-foreground"
                  placeholder="Enter text to humanize..."
                />
              </div>

              <Button
                onClick={handleGetPreview}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>

              {preview && (
                <div className="space-y-4 pt-4 border-t">
                  {/* Original */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Original</h4>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                      {preview.original}
                    </div>
                  </div>

                  {/* Humanized */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Humanized</h4>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                      {preview.humanized}
                    </div>
                    <Button
                      onClick={handleCopyHumanized}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Humanized Text
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Humanizer Engine Benefits:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ Removes typical AI phrases and patterns</li>
                  <li>✓ Converts passive to active voice</li>
                  <li>✓ Varies sentence structure naturally</li>
                  <li>✓ Applies industry-specific terminology</li>
                  <li>✓ Adapts tone to audience (technical/management)</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
