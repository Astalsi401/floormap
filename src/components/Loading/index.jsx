export const Loading = () => (
  <div className="fp-loading">
    <div className="loading">
      <div className="loading-block left">
        <div style={{ "--i": 0, "--t": 0 }}></div>
        <div style={{ "--i": 1, "--t": 1 }}></div>
        <div style={{ "--i": 2, "--t": 6 }}></div>
        <div style={{ "--i": 3, "--t": 7 }}></div>
      </div>
      <div className="loading-block right">
        <div style={{ "--i": 0, "--t": 2 }}></div>
        <div style={{ "--i": 1, "--t": 3 }}></div>
        <div style={{ "--i": 2, "--t": 4 }}></div>
        <div style={{ "--i": 3, "--t": 5 }}></div>
      </div>
    </div>
  </div>
);
