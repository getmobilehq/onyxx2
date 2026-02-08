import { useState, useMemo } from 'react';
import { X, Layers, Search } from 'lucide-react';
import { useUniformatGroups, useUniformatElements } from '../../features/assessments/api/uniformat.api';
import LoadingSpinner from './LoadingSpinner';

interface UniformatPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedCodes: string[]) => void;
  isLoading?: boolean;
  existingCodes?: string[];
}

export default function UniformatPicker({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  existingCodes = [],
}: UniformatPickerProps) {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const { data: groups, isLoading: groupsLoading } = useUniformatGroups();
  const { data: elements, isLoading: elementsLoading } = useUniformatElements(
    selectedGroup ? { systemGroup: selectedGroup } : {},
  );

  const existingSet = useMemo(() => new Set(existingCodes), [existingCodes]);

  const filteredElements = useMemo(() => {
    if (!elements) return [];
    let result = elements;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (el) =>
          el.code.toLowerCase().includes(query) ||
          el.name.toLowerCase().includes(query) ||
          el.systemGroup.toLowerCase().includes(query),
      );
    }
    return result;
  }, [elements, searchQuery]);

  const handleToggle = (code: string) => {
    const next = new Set(selectedCodes);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    setSelectedCodes(next);
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedCodes));
    setSelectedCodes(new Set());
    setSelectedGroup('');
    setSearchQuery('');
  };

  const handleClose = () => {
    setSelectedCodes(new Set());
    setSelectedGroup('');
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-onyx-600" />
            <h3 className="text-lg font-semibold text-slate-900">Add Assessment Elements</h3>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* System Groups Sidebar */}
          <div className="w-56 border-r border-slate-200 p-4 overflow-y-auto shrink-0">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              System Groups
            </h4>
            {groupsLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedGroup('')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedGroup === ''
                      ? 'bg-onyx-50 text-onyx-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Groups
                </button>
                {groups?.map((group) => (
                  <button
                    key={group.systemGroup}
                    onClick={() => setSelectedGroup(group.systemGroup)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedGroup === group.systemGroup
                        ? 'bg-onyx-50 text-onyx-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block truncate">{group.systemGroup}</span>
                    <span className="text-xs text-slate-400">{group.count} elements</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Elements List */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by code or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Elements */}
            <div className="flex-1 overflow-y-auto p-4">
              {elementsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : filteredElements.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2" />
                  <p>No elements found</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredElements.map((element) => {
                    const alreadyAdded = existingSet.has(element.code);
                    return (
                      <label
                        key={element.id}
                        className={`flex items-start gap-3 p-3 rounded-md cursor-pointer ${
                          alreadyAdded
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCodes.has(element.code)}
                          onChange={() => handleToggle(element.code)}
                          disabled={alreadyAdded}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-medium text-slate-900">
                              {element.code}
                            </span>
                            {alreadyAdded && (
                              <span className="text-xs text-slate-400">(already added)</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-0.5">{element.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span>{element.systemGroup}</span>
                            {element.defaultLifetimeYears && (
                              <span>{element.defaultLifetimeYears}yr lifetime</span>
                            )}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            {selectedCodes.size} element{selectedCodes.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-3">
            <button onClick={handleClose} className="btn btn-md btn-outline" disabled={isLoading}>
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-md btn-primary"
              disabled={selectedCodes.size === 0 || isLoading}
            >
              {isLoading ? 'Adding...' : `Add Selected (${selectedCodes.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
