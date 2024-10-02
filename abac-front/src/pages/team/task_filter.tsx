import React, { useState } from 'react';

interface TaskFilterProps {
  onFilterChange: (filters: { status?: string; startDate?: string; endDate?: string }) => void;
  onClearFilters: () => void;
}

const TaskFilter: React.FC<TaskFilterProps> = ({ onFilterChange, onClearFilters }) => {
  const [status, setStatus] = useState<string>(''); // Status filter
  const [startDate, setStartDate] = useState<string>(''); // Start date filter
  const [endDate, setEndDate] = useState<string>(''); // End date filter

  const handleFilterChange = () => {
    onFilterChange({ status, startDate, endDate });
  };

  const handleClearFilters = () => {
    setStatus('');
    setStartDate('');
    setEndDate('');
    onClearFilters();
  };

  return (
    <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {/* Status Filter */}
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={filterInputStyles}>
        <option value="">All Status</option>
        <option value="รอเริ่ม">รอเริ่ม</option>
        <option value="กำลังทำ">กำลังทำ</option>
        <option value="เสร็จ">เสร็จ</option>
        <option value="ล้มเหลว">ล้มเหลว</option>
      </select>

      {/* Due Date Range Filter */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
          style={filterInputStyles}
        />
        <span>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
          style={filterInputStyles}
        />
      </div>

      {/* Apply Filter Button */}
      <button onClick={handleFilterChange} style={filterButtonStyles}>Apply Filters</button>

      {/* Clear Filters Button */}
      <button onClick={handleClearFilters} style={clearButtonStyles}>Clear Filters</button>
    </div>
  );
};

export default TaskFilter;

const filterInputStyles = {
  padding: '0.5rem',
  borderRadius: '0.5rem',
  border: '1px solid #ccc',
};

const filterButtonStyles = {
  padding: '0.5rem 1rem',
  backgroundColor: '#3b82f6',
  color: '#fff',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};

const clearButtonStyles = {
  padding: '0.5rem 1rem',
  backgroundColor: '#ef4444',
  color: '#fff',
  borderRadius: '0.5rem',
  cursor: 'pointer',
};
