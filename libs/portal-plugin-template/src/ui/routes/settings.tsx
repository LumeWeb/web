import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@lumeweb/portal-framework-ui";

export default function Settings() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Template Settings</h1>
        <p className="text-muted-foreground">
          Configure settings for the template plugin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plugin Configuration</CardTitle>
          <CardDescription>
            Configure the template plugin behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This is a placeholder settings page. Implement your plugin's settings here.
            </p>
            
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Example Setting</label>
                <p className="text-sm text-muted-foreground">
                  Add your plugin settings here using form components from the framework.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}