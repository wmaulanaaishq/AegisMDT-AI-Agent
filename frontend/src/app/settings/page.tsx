export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-[800px] px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8 border-b border-border/50 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Platform configuration and user preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-medium mb-4">API Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1">Featherless AI Key</label>
              <input type="password" value="rc_b8620f9cf755b45fc0e8236744bc75dc17..." disabled className="w-full bg-secondary/50 border border-border rounded p-2 text-sm text-muted-foreground cursor-not-allowed" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 block mb-1">Band App Credentials</label>
              <input type="password" value="band_u_1781795830_1vrPTGtqlBYjCppWElWC-4xCtly4JBs4" disabled className="w-full bg-secondary/50 border border-border rounded p-2 text-sm text-muted-foreground cursor-not-allowed" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">API Keys are securely managed via environment variables and cannot be edited in the browser.</p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-medium mb-4">Agent Configuration</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-foreground/80">Privacy Agent</span>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Qwen3-32B</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-foreground/80">Pathology Agent</span>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Qwen3-32B</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-foreground/80">Moderator Agent</span>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">Qwen3-32B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
