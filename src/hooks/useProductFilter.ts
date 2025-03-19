import { useState, useMemo } from 'react';
import { AuctionItem, FilterOptions, ProductTag } from '../types';

interface UseProductFilterReturn {
  filterKeyword: string;
  setFilterKeyword: (keyword: string) => void;
  selectedTags: Set<string>;
  setSelectedTags: React.Dispatch<React.SetStateAction<Set<string>>>;
  showSelectedOnly: boolean;
  setShowSelectedOnly: (show: boolean) => void;
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  newFilterKeyword: string;
  setNewFilterKeyword: (keyword: string) => void;
  newExcludeKeyword: string;
  setNewExcludeKeyword: (keyword: string) => void;
  sortOrder: 'none' | 'asc' | 'desc';
  setSortOrder: React.Dispatch<React.SetStateAction<'none' | 'asc' | 'desc'>>;
  filteredResults: AuctionItem[];
  toggleTagFilter: (keyword: string) => void;
  addFilterKeyword: () => void;
  addExcludeKeyword: () => void;
  resetAllFilters: () => void;
}

export const useProductFilter = (
  results: AuctionItem[],
  selectedItems: Set<string>,
  getProductTags: (title: string) => ProductTag[]
): UseProductFilterReturn => {
  const [filterKeyword, setFilterKeyword] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    selectedTags: [],
    excludeMultipleBids: false,
    excludeJunk: false,
    excludeKeywords: [],
    excludeSets: false,
    excludeNew: false,
    filterKeywords: []
  });
  const [newFilterKeyword, setNewFilterKeyword] = useState('');
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');

  const toggleTagFilter = (keyword: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  };

  const addFilterKeyword = () => {
    if (newFilterKeyword.trim()) {
      setFilterOptions(prev => ({
        ...prev,
        filterKeywords: [...prev.filterKeywords, newFilterKeyword.trim()]
      }));
      setNewFilterKeyword('');
    }
  };

  const addExcludeKeyword = () => {
    if (newExcludeKeyword.trim()) {
      setFilterOptions(prev => ({
        ...prev,
        excludeKeywords: [...prev.excludeKeywords, newExcludeKeyword.trim()]
      }));
      setNewExcludeKeyword('');
    }
  };

  const resetAllFilters = () => {
    setSelectedTags(new Set());
    setFilterKeyword('');
    setNewFilterKeyword('');
    setNewExcludeKeyword('');
    setFilterOptions({
      selectedTags: [],
      excludeMultipleBids: false,
      excludeJunk: false,
      excludeKeywords: [],
      excludeSets: false,
      excludeNew: false,
      filterKeywords: []
    });
  };

  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Apply selected items filter
    if (showSelectedOnly) {
      filtered = filtered.filter(item => selectedItems.has(item.オークションID));
    }

    // Apply tag filters
    if (selectedTags.size > 0) {
      filtered = filtered.filter(item => {
        const itemTags = getProductTags(item.商品名);
        return itemTags.some(tag => selectedTags.has(tag.keyword));
      });
    }

    // Apply keyword filter
    if (filterOptions.filterKeywords.length > 0) {
      filtered = filtered.filter(item => 
        filterOptions.filterKeywords.every(keyword => 
          item.商品名.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Apply exclude keyword filter
    if (filterOptions.excludeKeywords.length > 0) {
      filtered = filtered.filter(item => 
        !filterOptions.excludeKeywords.some(keyword => 
          item.商品名.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Apply multiple bids filter
    if (filterOptions.excludeMultipleBids) {
      filtered = filtered.filter(item => item.入札数 >= 2);
    }

    // Apply no junk filter
    if (filterOptions.excludeJunk) {
      filtered = filtered.filter(item => 
        !item.商品名.includes('ジャンク') && !item.商品名.includes('現状品')
      );
    }

    // Apply no sets filter
    if (filterOptions.excludeSets) {
      filtered = filtered.filter(item => 
        !item.商品名.includes('まとめ') && !item.商品名.includes('セット')
      );
    }

    // Apply no new items filter
    if (filterOptions.excludeNew) {
      filtered = filtered.filter(item => 
        !item.商品名.includes('新品') && 
        !item.商品名.includes('未使用') && 
        !item.商品名.includes('未開封')
      );
    }

    if (sortOrder !== 'none') {
      filtered.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.落札金額 - b.落札金額;
        } else {
          return b.落札金額 - a.落札金額;
        }
      });
    }

    return filtered;
  }, [results, filterOptions, sortOrder, selectedItems, showSelectedOnly, selectedTags, getProductTags]);

  return {
    filterKeyword,
    setFilterKeyword,
    selectedTags,
    setSelectedTags,
    showSelectedOnly,
    setShowSelectedOnly,
    filterOptions,
    setFilterOptions,
    newFilterKeyword,
    setNewFilterKeyword,
    newExcludeKeyword,
    setNewExcludeKeyword,
    sortOrder,
    setSortOrder,
    filteredResults,
    toggleTagFilter,
    addFilterKeyword,
    addExcludeKeyword,
    resetAllFilters
  };
};

export default useProductFilter; 