import { useState } from "react";
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
const participantExpectation = ["50-100", "100-150", "150-200", "More than 200"];
const examWindows = [
  { label: "October 26th – 31st", value: "october" },
  { label: "November 23rd – 30th", value: "november" },
  { label: "December 1st – 15th", value: "december" },
];
const computerCounts = ["5-10", "11-20", "21-50", "51-100", "100+"];

const readRequired = (formData: FormData, field: string) => {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
};

const RegistrationForm = () => {
  const navigate = useNavigate();

  const [principalMobile, setPrincipalMobile] = useState("");
  const [principalOtpInput, setPrincipalOtpInput] = useState("");
  const [principalOtpSent, setPrincipalOtpSent] = useState(false);
  const [principalVerified, setPrincipalVerified] = useState(false);
  const [principalOtpBusy, setPrincipalOtpBusy] = useState(false);
  const [principalVerifyBusy, setPrincipalVerifyBusy] = useState(false);

  const [coordMobile, setCoordMobile] = useState("");
  const [coordOtpInput, setCoordOtpInput] = useState("");
  const [coordOtpSent, setCoordOtpSent] = useState(false);
  const [coordVerified, setCoordVerified] = useState(false);
  const [coordOtpBusy, setCoordOtpBusy] = useState(false);
  const [coordVerifyBusy, setCoordVerifyBusy] = useState(false);
  const [labAvailable, setLabAvailable] = useState<"yes" | "no">("yes");
  const [examWindow, setExamWindow] = useState<string>("");
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendOtp = async (type: "principal" | "coordinator") => {
    const mobile = type === "principal" ? principalMobile : coordMobile;
    if (!mobile.trim()) {
      toast.error("Please enter the mobile number first.");
      return;
    }

    try {
      if (type === "principal") setPrincipalOtpBusy(true);
      else setCoordOtpBusy(true);

      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile, channel: type }),
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message || "Could not send OTP");
      }

      if (type === "principal") {
        setPrincipalOtpSent(true);
        setPrincipalVerified(false);
      } else {
        setCoordOtpSent(true);
        setCoordVerified(false);
      }

      toast.success("OTP sent successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not send OTP";
      toast.error(message);
    } finally {
      if (type === "principal") setPrincipalOtpBusy(false);
      else setCoordOtpBusy(false);
    }
  };

  const verifyOtp = async (type: "principal" | "coordinator") => {
    const mobile = type === "principal" ? principalMobile : coordMobile;
    const input = type === "principal" ? principalOtpInput : coordOtpInput;
    if (!mobile.trim()) {
      toast.error("Please enter mobile number first.");
      return;
    }
    if (!input.trim()) {
      toast.error("Please enter OTP first.");
      return;
    }

    try {
      if (type === "principal") setPrincipalVerifyBusy(true);
      else setCoordVerifyBusy(true);

      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile, otp: input, channel: type }),
      });

      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      if (type === "principal") setPrincipalVerified(true);
      else setCoordVerified(true);
      toast.success("OTP verified successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "OTP verification failed";
      toast.error(message);
    } finally {
      if (type === "principal") setPrincipalVerifyBusy(false);
      else setCoordVerifyBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!principalVerified || !coordVerified) {
      toast.error("Please verify both OTPs before submitting.");
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
      schoolAddress: readRequired(formData, "schoolAddress"),
      schoolEmail: readRequired(formData, "schoolEmail"),
      schoolPhone: readRequired(formData, "schoolPhone"),
      city: readRequired(formData, "city"),
      state: readRequired(formData, "state"),
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

      if (!response.ok) {
        throw new Error("Registration service failed");
      }

      const payload = (await response.json()) as RegistrationPayload;
      saveLatestRegistration(payload);
      toast.success("Registration submitted!", { description: `Your Registration ID is ${payload.registrationId}.` });
      navigate("/registration/continue", { state: { registration: payload } });
    } catch {
      toast.error("Could not submit registration. Please try again.");
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
                  <Input id="schoolName" name="schoolName" placeholder="e.g., Delhi Public School" required />
                </div>
                <div>
                  <Label htmlFor="schoolAddress">School Address</Label>
                  <Input id="schoolAddress" name="schoolAddress" placeholder="School address" required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" placeholder="City" required />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" placeholder="State" required />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schoolEmail">School Mail ID</Label>
                    <Input id="schoolEmail" name="schoolEmail" type="email" placeholder="school@example.com" required />
                  </div>
                  <div>
                    <Label htmlFor="schoolPhone">School Contact Number</Label>
                    <Input id="schoolPhone" name="schoolPhone" type="tel" placeholder="+91 XXXXX XXXXX" required />
                  </div>
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
                  <div className="flex gap-2">
                    <Input
                      id="principalMobile"
                      name="principalMobile"
                      type="tel"
                      placeholder="+91 98765 43210"
                      required
                      className="flex-1"
                      value={principalMobile}
                      onChange={(e) => {
                        setPrincipalMobile(e.target.value);
                        setPrincipalOtpSent(false);
                        setPrincipalOtpInput("");
                        setPrincipalVerified(false);
                      }}
                    />
                    {!principalOtpSent ? (
                      <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => sendOtp("principal")} disabled={principalOtpBusy}>
                        {principalOtpBusy ? "Sending..." : "Send OTP"}
                      </Button>
                    ) : principalVerified ? (
                      <span className="text-spark-green text-sm font-semibold flex items-center">✓ Verified</span>
                    ) : null}
                  </div>
                  {principalOtpSent && !principalVerified && (
                    <div className="flex gap-2 mt-2">
                      <Input placeholder="Enter OTP" value={principalOtpInput} onChange={(e) => setPrincipalOtpInput(e.target.value)} className="w-32" />
                      <Button type="button" size="sm" onClick={() => verifyOtp("principal")} disabled={principalVerifyBusy}>
                        {principalVerifyBusy ? "Verifying..." : "Verify"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Coordinator Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">Coordinator Details</h3>
                <div>
                  <Label htmlFor="coordName">Name</Label>
                  <Input id="coordName" name="coordName" placeholder="Coordinator's full name" required />
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
                      placeholder="+91 98765 43210"
                      required
                      className="flex-1"
                      value={coordMobile}
                      onChange={(e) => {
                        setCoordMobile(e.target.value);
                        setCoordOtpSent(false);
                        setCoordOtpInput("");
                        setCoordVerified(false);
                      }}
                    />
                    {!coordOtpSent ? (
                      <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => sendOtp("coordinator")} disabled={coordOtpBusy}>
                        {coordOtpBusy ? "Sending..." : "Send OTP"}
                      </Button>
                    ) : coordVerified ? (
                      <span className="text-spark-green text-sm font-semibold flex items-center">✓ Verified</span>
                    ) : null}
                  </div>
                  {coordOtpSent && !coordVerified && (
                    <div className="flex gap-2 mt-2">
                      <Input placeholder="Enter OTP" value={coordOtpInput} onChange={(e) => setCoordOtpInput(e.target.value)} className="w-32" />
                      <Button type="button" size="sm" onClick={() => verifyOtp("coordinator")} disabled={coordVerifyBusy}>
                        {coordVerifyBusy ? "Verifying..." : "Verify"}
                      </Button>
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
