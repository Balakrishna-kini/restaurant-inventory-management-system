import React from 'react';

export default function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  startIndex,
  endIndex,
  onPageChange
}) {
  if (totalRecords === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      fontSize: '0.875rem',
      color: 'var(--text-secondary)'
    }}>
      <div>
        Showing {startIndex}–{endIndex} of {totalRecords} records
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ padding: '4px 12px' }}
        >
          &lt; Previous
        </button>
        
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            // Simple pagination display: show first, last, current, and +/- 1 from current
            if (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => onPageChange(page)}
                  style={{ 
                    padding: '4px 10px', 
                    minWidth: '32px',
                    ...(currentPage === page ? {} : { color: 'var(--text)' })
                  }}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} style={{ padding: '4px 8px' }}>...</span>;
            }
            return null;
          })}
        </div>

        <button 
          className="btn btn-ghost btn-sm" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ padding: '4px 12px' }}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
}
