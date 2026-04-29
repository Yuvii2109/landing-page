import { useLayoutEffect } from "react";
import TopBar from "@/components/spark/TopBar";
import Navbar from "@/components/spark/Navbar";
import RegistrationForm from "@/components/spark/RegistrationForm";
import Footer from "@/components/spark/Footer";

const Registration = () => {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar />
      <Navbar />
      <RegistrationForm />
      <Footer />
    </div>
  );
};

export default Registration;
