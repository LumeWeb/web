import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@lumeweb/portal-framework-ui";

export default function Dashboard() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Template Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the template plugin dashboard. This is a starting point for your plugin.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Learn how to customize this template plugin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This dashboard is a template. Replace this content with your plugin's specific functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plugin Features</CardTitle>
            <CardDescription>
              Available features in this plugin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Template dashboard</li>
              <li>• Settings page</li>
              <li>• Custom capabilities</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Development</CardTitle>
            <CardDescription>
              Development information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Plugin ID: core:template
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}