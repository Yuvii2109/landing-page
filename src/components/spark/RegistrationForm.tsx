import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { saveLatestRegistration, type RegistrationCreateRequest, type RegistrationPayload } from "@/lib/registration";

const boards = ["CBSE", "ICSE", "Cambridge", "State Board", "IB"];
const strengths = ["Up to 200", "200–500", "500–1000", "1000–2000", "2000+"];
const participantExpectation = ["100-200", "200-300", "300-400", "400-500", "More than 500"];
const examWindows = [
  { label: "October 26th – 31st", value: "october" },
  { label: "November 23rd – 30th", value: "november" },
  { label: "December 1st – 15th", value: "december" },
];
const computerCounts = ["5-10", "11-20", "21-50", "51-100", "100+"];
const OTP_RESEND_COOLDOWN_SECONDS = 30;

const readRequired = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
};

const readApiMessage = async (response: Response, fallback: string) => {
  const raw = await response.text();
  if (!raw.trim()) return fallback;

  try {
    const parsed = JSON.parse(raw) as { message?: string };
    return parsed.message || fallback;
  } catch {
    return raw;
  }
};

const RegistrationForm = () => {
  const navigate = useNavigate();

  const [schoolName, setSchoolName] = useState("");
  const [coordinatorName, setCoordinatorName] = useState("");

  const [coordMobile, setCoordMobile] = useState("");
  const [coordOtpInput, setCoordOtpInput] = useState("");
  const [coordOtpSent, setCoordOtpSent] = useState(false);
  const [coordVerified, setCoordVerified] = useState(false);
  const [coordOtpBusy, setCoordOtpBusy] = useState(false);
  const [coordVerifyBusy, setCoordVerifyBusy] = useState(false);
  const [coordResendCooldown, setCoordResendCooldown] = useState(0);
  const [labAvailable, setLabAvailable] = useState<"yes" | "no">("yes");
  const [examWindow, setExamWindow] = useState<string>("");
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (coordResendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCoordResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [coordResendCooldown]);

  const sendOtp = async () => {
    const mobile = coordMobile;
    if (!mobile.trim()) {
      toast.error("Please enter the mobile number first.");
      return;
    }

    try {
      setCoordOtpBusy(true);

      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile,
          channel: "coordinator",
          schoolName: schoolName.trim(),
          recipientName: coordinatorName.trim(),
        }),
      });

      const message = await readApiMessage(response, "Could not send OTP");
      if (!response.ok) {
        throw new Error(message);
      }

      setCoordOtpSent(true);
      setCoordVerified(false);
      setCoordResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);

      toast.success(message || "OTP sent successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not send OTP";
      toast.error(message);
    } finally {
      setCoordOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    const mobile = coordMobile;
    const input = coordOtpInput;
    if (!mobile.trim()) {
      toast.error("Please enter mobile number first.");
      return;
    }
    if (!input.trim()) {
      toast.error("Please enter OTP first.");
      return;
    }

    try {
      setCoordVerifyBusy(true);

      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile, otp: input, channel: "coordinator" }),
      });

      const message = await readApiMessage(response, "OTP verification failed");
      if (!response.ok) {
        throw new Error(message);
      }

      setCoordVerified(true);
      toast.success(message || "OTP verified successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "OTP verification failed";
      toast.error(message);
    } finally {
      setCoordVerifyBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordVerified) {
      toast.error("Please verify the coordinator OTP before submitting.");
      return;
    }
    if (!examWindow) {
      toast.error("Please select a preferred exam window.");
      return;
    }
    if (!declarationChecked) {
      toast.error("Please confirm your interest in participating.");
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const requestBody: RegistrationCreateRequest = {
      schoolName: readRequired(formData, "schoolName"),
      schoolAddress: "",
      schoolEmail: "",
      schoolPhone: "",
      city: "",
      state: "",
      board: readRequired(formData, "board"),
      strength: readRequired(formData, "strength"),
      labAvailable,
      computerCount: readRequired(formData, "computerCount"),
      principalName: readRequired(formData, "principalName"),
      principalEmail: readRequired(formData, "principalEmail"),
      principalMobile: readRequired(formData, "principalMobile"),
      coordinatorName: readRequired(formData, "coordName"),
      coordinatorDesignation: readRequired(formData, "coordDesignation"),
      coordinatorEmail: readRequired(formData, "coordEmail"),
      coordinatorMobile: readRequired(formData, "coordMobile"),
      expectedParticipants: readRequired(formData, "expectedParticipants"),
      examWindow,
      declaration: declarationChecked,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      if (!response.ok) {
        let errorMessage = "Registration service failed";
        if (responseText.trim()) {
          try {
            const parsed = JSON.parse(responseText) as { message?: string };
            errorMessage = parsed.message || errorMessage;
          } catch {
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }

      const payload = JSON.parse(responseText) as RegistrationPayload;
      saveLatestRegistration(payload);
      toast.success("Registration submitted!", { description: `Your Registration ID is ${payload.registrationId}.` });
      navigate("/registration/continue", { state: { registration: payload } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit registration. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-secondary/30" id="register">
      <div className="container px-4">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-3">Register Your School</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Fill in the details below to get started with SPARK Olympiad 2026–27.</p>

        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>School Registration</CardTitle>
            <CardDescription>All fields are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* School Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">School Details</h3>
                <div>
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    name="schoolName"
                    placeholder="e.g., Delhi Public School"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="board">Board</Label>
                    <select id="board" name="board" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="">Select Board</option>
                      {boards.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="strength">Approx. Number of Students (Classes 1–10)</Label>
                    <select id="strength" name="strength" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="">Select Range</option>
                      {strengths.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Computer Lab Available?</Label>
                  <RadioGroup value={labAvailable} onValueChange={(value) => setLabAvailable(value as "yes" | "no")} className="flex gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="lab-yes" />
                      <Label htmlFor="lab-yes" className="font-normal">Yes</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="lab-no" />
                      <Label htmlFor="lab-no" className="font-normal">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                {labAvailable === "yes" && (
                  <div>
                    <Label htmlFor="computerCount">Number of Computers Available</Label>
                    <select id="computerCount" name="computerCount" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="">Select Range</option>
                      {computerCounts.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Principal Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Principal Details</h3>
                <div>
                  <Label htmlFor="principalName">Full Name</Label>
                  <Input id="principalName" name="principalName" placeholder="Principal's full name" required />
                </div>
                <div>
                  <Label htmlFor="principalEmail">Email</Label>
                  <Input id="principalEmail" name="principalEmail" type="email" placeholder="principal@school.edu" required />
                </div>
                <div>
                  <Label htmlFor="principalMobile">Mobile</Label>
                  <Input
                    id="principalMobile"
                    name="principalMobile"
                    type="tel"
                    placeholder="98XXX XXXXX"
                    required
                  />
                </div>
              </div>

              {/* Coordinator Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Coordinator Details</h3>
                <div>
                  <Label htmlFor="coordName">Name</Label>
                  <Input
                    id="coordName"
                    name="coordName"
                    placeholder="Coordinator's full name"
                    required
                    value={coordinatorName}
                    onChange={(e) => setCoordinatorName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="coordDesignation">Designation</Label>
                  <Input id="coordDesignation" name="coordDesignation" placeholder="e.g., Academic Coordinator" required />
                </div>
                <div>
                  <Label htmlFor="coordEmail">Email ID</Label>
                  <Input id="coordEmail" name="coordEmail" type="email" placeholder="coordinator@school.edu" required />
                </div>
                <div>
                  <Label htmlFor="coordMobile">Contact Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coordMobile"
                      name="coordMobile"
                      type="tel"
                      placeholder="98XXX XXXXX"
                      required
                      className="flex-1"
                      value={coordMobile}
                      onChange={(e) => {
                        setCoordMobile(e.target.value);
                        setCoordOtpSent(false);
                        setCoordOtpInput("");
                        setCoordVerified(false);
                        setCoordResendCooldown(0);
                      }}
                    />
                    {!coordOtpSent ? (
                      <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={sendOtp} disabled={coordOtpBusy}>
                        {coordOtpBusy ? "Sending..." : "Send OTP"}
                      </Button>
                    ) : coordVerified ? (
                      <span className="text-spark-green text-sm font-semibold flex items-center">✓ Verified</span>
                    ) : null}
                  </div>
                  {coordOtpSent && !coordVerified && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2">
                        <Input placeholder="Enter OTP" value={coordOtpInput} onChange={(e) => setCoordOtpInput(e.target.value)} className="w-32" />
                        <Button type="button" size="sm" onClick={verifyOtp} disabled={coordVerifyBusy}>
                          {coordVerifyBusy ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Didn&apos;t receive the code?{" "}
                        <button
                          type="button"
                          onClick={sendOtp}
                          disabled={coordOtpBusy || coordResendCooldown > 0}
                          className="font-medium text-primary underline-offset-4 transition hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                        >
                          {coordOtpBusy ? "Sending..." : coordResendCooldown > 0 ? `Resend in ${coordResendCooldown}s` : "Resend OTP"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Program Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Program Details</h3>
                <div>
                  <Label htmlFor="expectedParticipants">Expected Number of Participants</Label>
                  <select id="expectedParticipants" name="expectedParticipants" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select Range</option>
                    {participantExpectation.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Preferred Exam Window (Required)</Label>
                  <RadioGroup value={examWindow} onValueChange={setExamWindow} className="space-y-2 mt-2">
                    {examWindows.map((window) => (
                      <div key={window.value} className="flex items-center gap-2">
                        <RadioGroupItem value={window.value} id={`exam-${window.value}`} />
                        <Label htmlFor={`exam-${window.value}`} className="font-normal">{window.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Declaration */}
              <div className="space-y-3 rounded-md border p-4">
                <Label className="font-bold">Declaration (Required)</Label>
                <div className="flex items-start gap-3">
                  <Checkbox id="declaration" checked={declarationChecked} onCheckedChange={(checked) => setDeclarationChecked(checked as boolean)} />
                  <Label htmlFor="declaration" className="font-normal text-sm cursor-pointer">
                    We confirm our interest in participating in SPARK Olympiad 2026–27
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full rounded-md font-semibold" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Generate Registration ID & Register"} <ArrowUpRight size={18} />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RegistrationForm;
