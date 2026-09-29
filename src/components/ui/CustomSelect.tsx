'use client';

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  color?: string;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  name?: string;
  required?: boolean;
  allowClear?: boolean;
  allowCustomInput?: boolean;
  renderOption?: (option: SelectOption) => React.ReactNode;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  className = '',
  buttonClassName = '',
  name,
  required = false,
  allowClear = false,
  allowCustomInput = false,
  renderOption,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
    width: number;
    openUpwards: boolean;
  }>({ top: 0, left: 0, width: 200, openUpwards: false });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtered options based on search query
  const filteredOptions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    const directMatches = options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q)) ||
        opt.value.toLowerCase().includes(q)
    );

    // If custom input is allowed and search query doesn't match any option exactly, append custom option
    if (
      allowCustomInput &&
      q &&
      !options.some((opt) => opt.label.toLowerCase() === q || opt.value.toLowerCase() === q)
    ) {
      return [
        ...directMatches,
        {
          value: searchQuery.trim(),
          label: `Use "${searchQuery.trim()}"`,
          badge: 'Custom',
        },
      ];
    }

    return directMatches;
  }, [options, searchQuery, allowCustomInput]);

  // Selected option label
  const selectedOption = options.find((opt) => opt.value === value) || (
    value ? { value, label: value } : null
  );

  // Position calculation with Collision Detection (Up or Down)
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Estimated max dropdown height including search bar & options
    const dropdownHeight = Math.min(320, 60 + filteredOptions.length * 44);
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Decide if it should open upwards or downwards
    const openUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    // Compute left and width ensuring no horizontal overflow
    let left = rect.left;
    let width = Math.max(rect.width, 240);

    if (left + width > viewportWidth - 16) {
      left = Math.max(16, viewportWidth - width - 16);
    }

    const top = openUpwards
      ? rect.top - 6
      : rect.bottom + 6;

    setMenuPosition({
      top,
      left,
      width,
      openUpwards,
    });
  }, [filteredOptions.length]);

  // Reposition on scroll, resize, or open
  useEffect(() => {
    if (!isOpen) return;

    calculatePosition();

    const handleScroll = (e: Event) => {
      // If scrolling inside the dropdown list itself, do not close or recalculate
      if (listRef.current && listRef.current.contains(e.target as Node)) {
        return;
      }
      calculatePosition();
    };

    const handleResize = () => calculatePosition();

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, calculatePosition]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-select-item]');
    const activeItem = items[highlightedIndex] as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block w-full text-left ${className}`} onKeyDown={handleKeyDown}>
      {/* Hidden Native Input for standard Form submissions */}
      {name && <input type="hidden" name={name} value={value} required={required} />}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`select-menu-${instanceId}`}
        className={`w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 shadow-2xs hover:border-slate-300 focus:border-slate-800 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px] ${
          isOpen ? 'ring-2 ring-slate-800/10 border-slate-800' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate text-left">
          {selectedOption ? (
            <>
              {selectedOption.color && (
                <span
                  className="h-3 w-3 rounded-full shrink-0 border border-slate-200"
                  style={{ backgroundColor: selectedOption.color }}
                />
              )}
              {selectedOption.icon && <span className="shrink-0">{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {allowClear && value && !disabled && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleClear(e as any);
                }
              }}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </div>
          )}
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-slate-800' : ''
            }`}
          />
        </div>
      </button>

      {/* Portal-Rendered Dropdown Menu (Escapes Container Clipping) */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={listRef}
                id={`select-menu-${instanceId}`}
                role="listbox"
                initial={{
                  opacity: 0,
                  scale: 0.96,
                  y: menuPosition.openUpwards ? 4 : -4,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  y: menuPosition.openUpwards ? 4 : -4,
                }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  top: menuPosition.openUpwards ? undefined : `${menuPosition.top}px`,
                  bottom: menuPosition.openUpwards
                    ? `${window.innerHeight - menuPosition.top}px`
                    : undefined,
                  left: `${menuPosition.left}px`,
                  width: `${menuPosition.width}px`,
                  zIndex: 9999,
                }}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/98 backdrop-blur-xl shadow-2xl ring-1 ring-black/5"
              >
                {/* Search Bar */}
                <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setHighlightedIndex(0);
                      }}
                      placeholder={searchPlaceholder}
                      className="w-full pl-8 pr-7 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Options List */}
                <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain">
                  {filteredOptions.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs font-semibold text-slate-400">
                      No matching options found.
                    </div>
                  ) : (
                    filteredOptions.map((option, idx) => {
                      const isSelected = option.value === value;
                      const isHighlighted = idx === highlightedIndex;

                      return (
                        <div
                          key={option.value}
                          data-select-item
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          onClick={() => handleSelect(option.value)}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-colors cursor-pointer select-none ${
                            isSelected
                              ? 'bg-slate-900 text-white'
                              : isHighlighted
                              ? 'bg-slate-100 text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {renderOption ? (
                            renderOption(option)
                          ) : (
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                              {option.color && (
                                <span
                                  className="h-3 w-3 rounded-full shrink-0 border border-white/20"
                                  style={{ backgroundColor: option.color }}
                                />
                              )}
                              {option.icon && (
                                <span
                                  className={`shrink-0 ${
                                    isSelected ? 'text-white' : 'text-slate-500'
                                  }`}
                                >
                                  {option.icon}
                                </span>
                              )}
                              <div className="flex flex-col min-w-0">
                                <span className="truncate">{option.label}</span>
                                {option.description && (
                                  <span
                                    className={`text-[10px] font-medium truncate ${
                                      isSelected ? 'text-slate-300' : 'text-slate-400'
                                    }`}
                                  >
                                    {option.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 shrink-0">
                            {option.badge && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-200/80 text-slate-700'
                                }`}
                              >
                                {option.badge}
                              </span>
                            )}
                            {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
