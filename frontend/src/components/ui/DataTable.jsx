import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { Button } from './Button';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';

export function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  searchKey = '',
  loading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  actions,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Handles sorting trigger
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    return data.filter(item => {
      const val = item[searchKey];
      if (!val) return false;
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchKey]);

  // Sort based on config
  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === undefined || bVal === undefined) return 0;

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // Pagination calculations
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // CSV export helper
  const exportToCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map(col => col.header).join(',');
    const rows = data.map(item => 
      columns.map(col => {
        const cell = item[col.accessor];
        return typeof cell === 'object' ? '' : `"${String(cell || '').replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exported_dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {searchKey && (
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="input-antigravity pl-9 py-2 text-xs"
            />
            <span className="absolute inset-y-0 left-3 flex items-center text-muted">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
            </span>
          </div>
        )}
        <div className="flex gap-2 ml-auto w-full sm:w-auto justify-end items-center">
          {actions}
          <Button variant="secondary" size="sm" onClick={exportToCSV} disabled={data.length === 0} className="gap-1.5 flex items-center">
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#111113] rounded-md overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#09090b]/40 border-b border-white/5">
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    onClick={() => col.sortable !== false && requestSort(col.accessor)}
                    className={clsx(
                      'px-5 py-3 text-[10px] font-mono uppercase tracking-wider text-muted font-semibold select-none',
                      col.sortable !== false && 'cursor-pointer hover:text-secondary transition-colors'
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable !== false && sortConfig.key === col.accessor && (
                        <span className="text-[#c5a880]">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Shimmer Skeleton Loader
                Array.from({ length: 4 }).map((_, rIdx) => (
                  <tr key={rIdx} className="border-b border-white/5">
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="px-5 py-4">
                        <div className="h-3 bg-white/5 rounded skeleton w-full max-w-[100px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // Empty state row
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-muted font-mono text-[10px] uppercase tracking-wider">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                // Data Rows
                paginatedData.map((row, rIdx) => (
                  <tr
                    key={row.id || rIdx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={clsx(
                      'border-b border-white/5 transition-colors',
                      onRowClick ? 'cursor-pointer hover:bg-white/[0.02]' : 'hover:bg-white/[0.01]'
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.accessor} className="px-5 py-3.5 text-xs text-secondary font-medium">
                        {col.render ? col.render(row) : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center px-2 py-1 font-mono text-[10px] text-muted">
          <span className="tracking-wider">
            PAGE {currentPage} OF {totalPages} ({filteredData.length} TOTAL)
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="py-1 px-2.5 gap-1 flex items-center"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
              <span>Prev</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="py-1 px-2.5 gap-1 flex items-center"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
