export const PageLoading: React.FC = () => (
  <div className="fp-loading">
    <div className="loading">
      <div className="loading-block left">
        <div style={{ "--i": 0, "--t": 0 } as React.CSSProperties}></div>
        <div style={{ "--i": 1, "--t": 1 } as React.CSSProperties}></div>
        <div style={{ "--i": 2, "--t": 6 } as React.CSSProperties}></div>
        <div style={{ "--i": 3, "--t": 7 } as React.CSSProperties}></div>
      </div>
      <div className="loading-block right">
        <div style={{ "--i": 0, "--t": 2 } as React.CSSProperties}></div>
        <div style={{ "--i": 1, "--t": 3 } as React.CSSProperties}></div>
        <div style={{ "--i": 2, "--t": 4 } as React.CSSProperties}></div>
        <div style={{ "--i": 3, "--t": 5 } as React.CSSProperties}></div>
      </div>
    </div>
  </div>
);

export const BtnLoading = ({ className, loading, onClick, text }: { className?: string; loading?: boolean; onClick?: () => void; text?: string }) => (
  <div className="fp-loading-btn p-2">
    <button className={`fp-btn fp-save-btn d-flex align-items-center justify-content-center mx-auto shadow text-bold ${loading ? "saving" : ""} ${className || ""}`} onClick={onClick}>
      {text}
      <span style={{ "--i": 0 } as React.CSSProperties}></span>
      <span style={{ "--i": 1 } as React.CSSProperties}></span>
      <span style={{ "--i": 2 } as React.CSSProperties}></span>
      <span style={{ "--i": 3 } as React.CSSProperties}></span>
    </button>
  </div>
);
