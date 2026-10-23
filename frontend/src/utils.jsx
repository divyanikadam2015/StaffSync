export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '-');
export const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-');
export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

const colors = { pending: 'warning', approved: 'success', rejected: 'danger', present: 'success', 'half-day': 'warning', absent: 'danger', hr: 'danger', manager: 'primary', employee: 'secondary' };
export const Badge = ({ text }) => <span className={`badge bg-${colors[text] || 'secondary'} text-capitalize`}>{text}</span>;

export const Modal = ({ title, onClose, children }) => (
  <div className="modal-backdrop-custom" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="card w-100" style={{ maxWidth: 640 }}>
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{title}</h5>
        <button className="btn-close" onClick={onClose}></button>
      </div>
      <div className="card-body">{children}</div>
    </div>
  </div>
);

export const Empty = ({ text = 'No records found' }) => (
  <div className="text-center text-muted py-5"><i className="bi bi-inbox fs-1 d-block mb-2"></i>{text}</div>
);

export const Loader = () => <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
