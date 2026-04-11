import { useState } from "react";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ReportsAnalytics = () => {
  const [openPdf, setOpenPdf] = useState<string | null>(null);

  const reports = [
    {
      id: "olympiad_analytics",
      title: "Olympiad Analytics",
      description: "Comprehensive data insights on SPARK Olympiad participation, performance trends, and institutional benchmarking.",
      file: "/olympiad_analytics.pdf",
    },
    {
      id: "student_report",
      title: "Student Report",
      description: "Detailed individual student performance reports including competency mapping and personalized feedback.",
      file: "/student_report.pdf",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/30" id="reports-analytics">
      <div className="container px-4">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-3">Reports & Analytics</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Access comprehensive data insights and performance reports to guide your academic strategy.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
          {reports.map((report) => (
            <div
              key={report.id}
              className="relative group rounded-lg border border-primary/20 bg-primary/5 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{report.description}</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-md font-semibold"
                onClick={() => setOpenPdf(report.file)}
              >
                View Report
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs md:text-sm text-muted-foreground">
          PDFs are view-only. Download functionality is disabled for document security.
        </p>
      </div>

      {/* PDF Viewer Modal */}
      <Dialog open={!!openPdf} onOpenChange={(open) => !open && setOpenPdf(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0">
            <DialogTitle>
              {openPdf?.includes("olympiad_analytics") ? "Olympiad Analytics" : "Student Report"}
            </DialogTitle>
            <button
              onClick={() => setOpenPdf(null)}
              className="rounded-md hover:bg-secondary transition-colors p-1"
            >
              <X size={20} />
              <span className="sr-only">Close</span>
            </button>
          </DialogHeader>

          {/* PDF Viewer with No Download */}
          {openPdf && (
            <div
              className="flex-1 overflow-hidden rounded-lg border border-border"
              onContextMenu={(e) => e.preventDefault()}
            >
              <iframe
                src={`${openPdf}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border-none"
                title="PDF Viewer"
                style={{
                  pointerEvents: "auto",
                }}
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">
            This document is protected for viewing only. Use your browser's print function if you need to save a copy.
          </p>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ReportsAnalytics;
