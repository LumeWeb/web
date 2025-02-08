import { ReportButton } from "@/ui/components/ReportButton";
import { Card } from "@lumeweb/portal-framework-ui-core";
import {
  AlertCircle,
  Asterisk,
  Clock,
  Copyright,
  LinkIcon,
  Server,
  UserRound,
} from "lucide-react";
import React from "react";
import { Link } from "react-router";

interface HomeProps {
  children?: React.ReactNode;
}

export function Home({ children }: HomeProps) {
  return (
    <div className="container py-8">
      <main>
        {/* Getting Started Section */}
        <section className="mb-12">
          <h1 className="mb-2 text-3xl font-medium tracking-tight text-foreground">
            Getting started
          </h1>
          <p className="mb-6 text-sm leading-relaxed tracking-wide text-foreground">
            Please gather the following information to help us investigate
            effectively.
          </p>
          <div className="border-t border-border"></div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <Card className="flex items-center gap-6 border-none bg-card p-6 w-full md:w-auto">
              <LinkIcon className="h-11 w-11 text-primary" />
              <p className="text-sm leading-relaxed tracking-wide text-card-foreground">
                Specific URLs, IPs, or identifiers where the abuse is occurring.
              </p>
            </Card>
            <div className="flex justify-center items-center">
              <div className="text-primary text-4xl font-light">+</div>
            </div>
            <Card className="flex items-center gap-6 border-none bg-card p-6 w-full md:w-auto">
              <Server className="h-11 w-11 text-primary" />
              <p className="text-sm leading-relaxed tracking-wide text-card-foreground">
                Screenshots or other evidence if available.
              </p>
            </Card>
            <div className="flex justify-center items-center">
              <div className="text-primary text-4xl font-light">+</div>
            </div>
            <Card className="flex items-center gap-6 border-none bg-card p-6 w-full md:w-auto">
              <Clock className="h-11 w-11 text-primary" />
              <p className="text-sm leading-relaxed tracking-wide text-card-foreground">
                Timestamped evidence showing the most recent occurrence
              </p>
            </Card>
          </div>
        </section>

        {/* What to Report Section */}
        <section>
          <h2 className="mb-2 text-2xl font-medium tracking-tight text-foreground">
            What type of things should be reported?
          </h2>
          <p className="mb-6 text-sm leading-relaxed tracking-wide text-foreground">
            See the list below for instances where a report may be warranted.
          </p>
          <div className="border-t border-border"></div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="flex flex-col gap-4 border-none bg-card p-6">
              <AlertCircle className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-medium text-primary">
                Malicious Content
              </h3>
              <p className="text-sm leading-relaxed tracking-wide text-card-foreground">
                Harmful code, malware, or suspicious executables.
              </p>
            </Card>
            <Card className="flex flex-col gap-4 border-none bg-card p-6">
              <Server className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-medium text-primary">
                Resource Abuse
              </h3>
              <p className="text-sm leading-relaxed tracking-wide text-card-foreground">
                Unauthorized mining or excessive resource usage.
              </p>
            </Card>
            <Card className="flex flex-col gap-4 border-none bg-card p-6">
              <Asterisk className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-medium text-primary">More/Other</h3>
              <p className="text-sm leading-relaxed tracking-wide text-card-foreground">
                This list is non-exhaustive, if you spot something that you
                think may warrant a report please feel free to send it along.
              </p>
            </Card>
            <Card className="flex flex-col gap-4 border-none bg-card p-6">
              <Copyright className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-medium text-primary">
                Copyright Violations
              </h3>
              <p className="text-sm leading-relaxed tracking-wide text-card-foreground">
                Unauthorized distribution of protected content.
              </p>
            </Card>
            <Card className="flex flex-col gap-4 border-none bg-card p-6">
              <UserRound className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-medium text-primary">
                Phishing/Scams
              </h3>
              <p className="text-sm leading-relaxed tracking-wide text-card-foreground">
                Fraudulent activities or impersonation attempts.
              </p>
            </Card>
            <Card className="flex flex-col gap-4 border-none bg-card p-6">
              <UserRound className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-medium text-primary">Other</h3>
              <p className="text-sm leading-relaxed tracking-wide text-card-foreground">
                Fraudulent activities or impersonation attempts.
              </p>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16 flex flex-col items-center gap-4 border-y border-border py-14">
          <h2 className="text-xl font-medium leading-relaxed text-center text-foreground">
            Suspect abuse?
            <br />
            File a report and we&apos;ll follow up.
          </h2>
          <Link
            to={{
              pathname: "/report",
            }}>
            <ReportButton className="text-lg">Report an abuse</ReportButton>
          </Link>
        </section>
        {children}
      </main>
    </div>
  );
}
