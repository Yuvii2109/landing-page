import { useMemo, useState } from "react";
import { ArrowLeft, Copy, Mail, CircleCheckBig } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { readLatestRegistration, type RegistrationPayload } from "@/lib/registration";

type ContinuationLocationState = {
  registration?: RegistrationPayload;
};

const RegistrationContinuation = () => {
  const location = useLocation();
  const state = location.state as ContinuationLocationState | null;
  const [registration] = useState<RegistrationPayload | null>(() => state?.registration ?? readLatestRegistration());

  const formattedTimestamp = useMemo(() => {
    if (!registration?.createdAt) return "";
    return new Date(registration.createdAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [registration?.createdAt]);

  const copyLink = async () => {
    if (!registration?.registrationId) return;

    try {
      await navigator.clipboard.writeText(registration.registrationId);
      toast.success("Registration ID copied to clipboard.");
    } catch {
      toast.error("Could not copy Registration ID. Please copy it manually.");
    }
  };

  if (!registration) {
    return (
      <main className="min-h-screen bg-secondary/30 py-16">
        <div className="container px-4">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle>Registration details not found</CardTitle>
              <CardDescription>
                We could not find a recent registration record. Please submit the school form again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/#register">Back to Registration Form</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary/30 py-10 md:py-16">
      <div className="container max-w-4xl px-4 space-y-6">
        <Button asChild variant="ghost" className="-ml-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CircleCheckBig className="h-6 w-6 text-spark-green" />
              Registration Received
            </CardTitle>
            <CardDescription>
              {registration.schoolName} is successfully registered. Your registration ID is ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Registration ID</p>
              <p className="mt-2 break-all font-semibold text-primary">{registration.registrationId}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                  Copy ID
                </Button>
                <Button type="button" variant="outline" asChild>
                  <a href={`mailto:${registration.coordinatorEmail}?subject=SPARK Olympiad Registration ID&body=Hello ${registration.coordinatorName},%0D%0A%0D%0AYour SPARK Registration ID is:%0D%0A${encodeURIComponent(registration.registrationId)}`}>
                    <Mail className="h-4 w-4" />
                    Email Coordinator
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">School Snapshot</p>
                <p className="mt-2 font-semibold">{registration.schoolName}</p>
                <p className="text-sm text-muted-foreground">{registration.schoolAddress}</p>
                <p className="text-sm text-muted-foreground">
                  {registration.city}, {registration.state}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Board: {registration.board}</p>
                <p className="text-sm text-muted-foreground">Students: {registration.strength}</p>
                <p className="text-sm text-muted-foreground">
                  Computer Lab: {registration.labAvailable === "yes" ? `Available (${registration.computerCount})` : "Not available"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Expected Participants: {registration.expectedParticipants}</p>
                <p className="text-sm text-muted-foreground">Exam Window: {registration.examWindow}</p>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Primary Contacts</p>
                <p className="mt-2 text-sm">
                  Principal: <span className="font-medium">{registration.principalName}</span>
                </p>
                <p className="text-sm text-muted-foreground">{registration.principalEmail}</p>
                <p className="text-sm text-muted-foreground">{registration.principalMobile}</p>
                <p className="mt-3 text-sm">
                  Coordinator: <span className="font-medium">{registration.coordinatorName}</span>
                </p>
                <p className="text-xs text-muted-foreground">{registration.coordinatorDesignation}</p>
                <p className="text-sm text-muted-foreground">{registration.coordinatorEmail}</p>
                <p className="text-sm text-muted-foreground">{registration.coordinatorMobile}</p>
              </div>
            </div>

            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What happens next</p>
              <p className="mt-2">1. SPARK team reviews your registration and reaches out for onboarding.</p>
              <p>2. Keep this registration ID safe for support and onboarding communication.</p>
              <p>3. Keep principal and coordinator email inboxes active for confirmation mails.</p>
              <p className="mt-3 text-xs">Registered on: {formattedTimestamp}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default RegistrationContinuation;
