import React, { ReactNode } from 'react';
import { SearchProvider } from './SearchContext';
import { FilterProvider } from './FilterContext';
import { SelectionProvider } from './SelectionContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * すべてのコンテキストプロバイダーをラップする統合プロバイダー
 * このコンポーネントで囲むことで、アプリケーション全体でコンテキストを利用可能にします
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <SearchProvider>
      <FilterProvider>
        <SelectionProvider>
          {children}
        </SelectionProvider>
      </FilterProvider>
    </SearchProvider>
  );
}; 