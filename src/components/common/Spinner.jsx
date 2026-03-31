import ShuffleText from '../animations/ShuffleText';

export default function Spinner({ text = 'MULLONKAL SAND' }) {
  return (
    <div className="spinner-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
      <div className="spinner" style={{ width: 32, height: 32, borderTopColor: 'var(--color-primary)' }}></div>
      <ShuffleText text={text} className="spinner-text" style={{ padding: '0 var(--space-2)', fontSize: 'var(--font-size-md)' }} />
    </div>
  );
}
