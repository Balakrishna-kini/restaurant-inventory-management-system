import { useState, useMemo } from 'react';

export default function useTable(data, defaultSortField = '', defaultSortOrder = 'asc', itemsPerPage = 10) {
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      let aValue = getNestedValue(a, sortField);
      let bValue = getNestedValue(b, sortField);

      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  
  // Ensure current page is valid when data changes
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const currentData = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, validCurrentPage, itemsPerPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  // Reset to page 1 when data length changes drastically (like a filter)
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  return {
    currentData,
    sortField,
    sortOrder,
    handleSort,
    renderSortIcon,
    currentPage: validCurrentPage,
    totalPages,
    goToPage,
    totalRecords: data.length,
    startIndex: data.length === 0 ? 0 : (validCurrentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(validCurrentPage * itemsPerPage, data.length)
  };
}
