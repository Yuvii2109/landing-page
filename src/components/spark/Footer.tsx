const Footer = () => (
  <footer className="bg-spark-dark text-spark-slate py-10">
    <div className="container px-4 text-center">
      <img src="/spark.png" alt="Spark Olympiad" className="mx-auto h-12 w-auto mb-2" />
      <p className="text-xs mb-4">An Initiative of EDXSO & Prometric</p>
      <div className="flex flex-wrap justify-center gap-4 text-xs mb-6">
        <a href="/registration" className="hover:text-primary transition-colors">Register</a>
        <a href="/#why-spark" className="hover:text-primary transition-colors">Why SPARK</a>
        <a href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
        <a href="mailto:reachout@sparkolympiads.com" className="hover:text-primary transition-colors">Contact</a>
      </div>
      <p className="text-xs text-spark-slate/60">© {new Date().getFullYear()} SPARK Olympiad. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
