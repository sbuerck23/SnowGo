import "./NotesModal.css";

interface NotesModalProps {
  isOpen: boolean;
  notes: string;
  onClose: () => void;
}

function NotesModal({ isOpen, notes, onClose }: NotesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="notes-modal-overlay" onClick={onClose}>
      <div className="notes-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="notes-modal-header">
          <h3>Job Notes</h3>
          <button className="notes-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="notes-modal-body">
          <p>{notes}</p>
        </div>
        <div className="notes-modal-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotesModal;
