const tickerItems = Array.from({ length: 8 }, () => "School Registrations Open for 2026–27");

const TopBar = () => (
  <div className="top-ticker">
    <div className="top-ticker__track">
      {[...tickerItems, ...tickerItems].map((text, idx) => (
        <span key={`${text}-${idx}`} className="top-ticker__item">
          {text}
        </span>
      ))}
    </div>
  </div>
);

export default TopBar;
