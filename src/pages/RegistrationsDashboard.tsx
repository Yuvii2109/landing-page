import { useEffect, useState } from "react";
import { ShieldCheck, LogOut, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DashboardRegistration = {
  registrationId: string;
  createdAt: string;
  schoolName: string;
  city: string;
  state: string;
  board: string;
  strength: string;
  principalName: string;
  principalEmail: string;
  principalMobile: string;
  coordinatorName: string;
  coordinatorDesignation: string;
  coordinatorEmail: string;
  coordinatorMobile: string;
  expectedParticipants: string;
  examWindow: string;
};

const STORAGE_KEY = "spark.dashboard.basicAuth";

const encodeBasicAuth = (username: string, password: string) => window.btoa(`${username}:${password}`);

const readStoredAuth = () => {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(STORAGE_KEY) || "";
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const RegistrationsDashboard = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [registrations, setRegistrations] = useState<DashboardRegistration[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const totalRegistrations = registrations.length;

  const loadRegistrations = async (tokenOverride?: string) => {
    const token = tokenOverride || authToken || readStoredAuth();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setBusy(true);
      const response = await fetch("/api/dashboard/registrations", {
        headers: {
          Authorization: `Basic ${token}`,
        },
      });

      if (response.status === 401) {
        window.sessionStorage.removeItem(STORAGE_KEY);
        setAuthToken("");
        setRegistrations([]);
        setLoading(false);
        toast.error("Dashboard login expired or is invalid.");
        return;
      }

      const payload = (await response.json()) as {
        message?: string;
        registrations?: DashboardRegistration[];
      };

      if (!response.ok) {
        throw new Error(payload.message || "Could not load registrations.");
      }

      setRegistrations(payload.registrations || []);
      setAuthToken(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load registrations.";
      toast.error(message);
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRegistrations(readStoredAuth());
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = encodeBasicAuth(username.trim(), password);
    window.sessionStorage.setItem(STORAGE_KEY, token);
    await loadRegistrations(token);
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setAuthToken("");
    setRegistrations([]);
    setUsername("");
    setPassword("");
    toast.success("Signed out of the registrations dashboard.");
  };

  if (!authToken) {
    return (
      <main className="min-h-screen bg-secondary/30 px-4 py-10 md:py-16">
        <div className="mx-auto max-w-md">
          <Card className="border-primary/15 shadow-lg">
            <CardHeader className="space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle>Registrations Dashboard</CardTitle>
              <CardDescription>
                Sign in with your internal dashboard credentials to view all school registrations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <Label htmlFor="dashboard-username">Username</Label>
                  <Input
                    id="dashboard-username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Dashboard username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dashboard-password">Password</Label>
                  <Input
                    id="dashboard-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Dashboard password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary/30 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Internal Dashboard</p>
            <h1 className="mt-2 text-3xl font-extrabold text-foreground">School Registrations</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review the latest school signups, contact details, and participation preferences.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => void loadRegistrations()} disabled={busy}>
              <RefreshCcw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button type="button" variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Registrations</CardDescription>
              <CardTitle className="text-3xl">{totalRegistrations}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Latest Update</CardDescription>
              <CardTitle className="text-lg">
                {registrations[0] ? formatDateTime(registrations[0].createdAt) : "No registrations yet"}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">All Registered Schools</CardTitle>
            <CardDescription>
              {loading ? "Loading registrations..." : `${totalRegistrations} registration${totalRegistrations === 1 ? "" : "s"} found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No registrations found yet. Submit a school form first and refresh this dashboard.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registered On</TableHead>
                    <TableHead>Registration ID</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Board</TableHead>
                    <TableHead>Coordinator</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Exam Window</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.registrationId}>
                      <TableCell className="whitespace-nowrap">{formatDateTime(registration.createdAt)}</TableCell>
                      <TableCell className="font-medium">{registration.registrationId}</TableCell>
                      <TableCell>
                        <div className="min-w-[220px]">
                          <p className="font-medium">{registration.schoolName}</p>
                          <p className="text-xs text-muted-foreground">Strength: {registration.strength}</p>
                        </div>
                      </TableCell>
                      <TableCell>{registration.city}, {registration.state}</TableCell>
                      <TableCell>{registration.board}</TableCell>
                      <TableCell>
                        <div className="min-w-[210px]">
                          <p className="font-medium">{registration.coordinatorName}</p>
                          <p className="text-xs text-muted-foreground">{registration.coordinatorDesignation}</p>
                          <p className="text-xs text-muted-foreground">{registration.coordinatorEmail}</p>
                          <p className="text-xs text-muted-foreground">{registration.coordinatorMobile}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-[210px]">
                          <p className="font-medium">{registration.principalName}</p>
                          <p className="text-xs text-muted-foreground">{registration.principalEmail}</p>
                          <p className="text-xs text-muted-foreground">{registration.principalMobile}</p>
                        </div>
                      </TableCell>
                      <TableCell>{registration.expectedParticipants}</TableCell>
                      <TableCell className="capitalize">{registration.examWindow}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default RegistrationsDashboard;
