import { useEffect, useRef } from 'react';
import Icon from '../Icon/Icon';
import EmptyState from '../EmptyState/EmptyState';
import '../../../styles/common/table.css';

function Checkbox({ checked, indeterminate = false, onChange, label }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);

  return (
    <label className="tbl-checkbox">
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <span className="tbl-checkbox__box" aria-hidden="true">
        <Icon name="check" size={12} strokeWidth={3} className="tbl-checkbox__mark" />
        <span className="tbl-checkbox__dash" />
      </span>
    </label>
  );
}

/*
 * Generic data table.
 *  columns: [{ key, title, render?(row), align?, width?, sortable? }]
 *  selection: pass `selectable` + `selectedKeys` (array) + `onSelectionChange`
 *  sorting:   pass `sortKey`, `sortDir` ('asc'|'desc') + `onSort(key)`
 *  states:    `loading` renders shimmer rows, empty data renders `empty`
 *             (an <EmptyState/> by default)
 */
function Table({
  columns,
  data = [],
  rowKey = 'id',
  loading = false,
  skeletonRows = 6,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  sortKey,
  sortDir,
  onSort,
  empty,
  className = '',
}) {
  const getKey = (row) => (typeof rowKey === 'function' ? rowKey(row) : row[rowKey]);
  const selected = new Set(selectedKeys);
  const allSelected = data.length > 0 && data.every((row) => selected.has(getKey(row)));
  const someSelected = data.some((row) => selected.has(getKey(row)));
  const columnCount = columns.length + (selectable ? 1 : 0);

  const toggleAll = () => {
    onSelectionChange?.(allSelected ? [] : data.map(getKey));
  };

  const toggleRow = (key) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange?.([...next]);
  };

  return (
    <div className={`tbl-wrap ${className}`.trim()}>
      <table className="tbl">
        <thead>
          <tr>
            {selectable && (
              <th className="tbl__th tbl__th--check">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  label="Select all rows"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`tbl__th${column.align ? ` tbl__th--${column.align}` : ''}`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.sortable ? (
                  <button type="button" className="tbl__sort" onClick={() => onSort?.(column.key)}>
                    {column.title}
                    {sortKey === column.key && (
                      <Icon
                        name="arrowDown"
                        size={13}
                        strokeWidth={2.2}
                        className={`tbl__sort-arrow${sortDir === 'desc' ? ' is-flipped' : ''}`}
                      />
                    )}
                  </button>
                ) : (
                  column.title
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: skeletonRows }).map((row, index) => (
              <tr key={`skeleton-${index}`} className="tbl__row tbl__row--skeleton">
                {selectable && (
                  <td className="tbl__td tbl__td--check">
                    <span className="skeleton skeleton--box" />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key} className="tbl__td">
                    <span className="skeleton skeleton--text" style={{ width: '70%' }} />
                  </td>
                ))}
              </tr>
            ))}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columnCount} className="tbl__td tbl__td--empty">
                {empty || <EmptyState title="No records found" message="There is nothing to show here yet." />}
              </td>
            </tr>
          )}

          {!loading &&
            data.map((row) => {
              const key = getKey(row);
              const isSelected = selected.has(key);
              return (
                <tr key={key} className={`tbl__row${isSelected ? ' is-selected' : ''}`}>
                  {selectable && (
                    <td className="tbl__td tbl__td--check">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        label={`Select row ${key}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`tbl__td${column.align ? ` tbl__td--${column.align}` : ''}`}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
