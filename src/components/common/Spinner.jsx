export default function Spinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
}
