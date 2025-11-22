import React from 'react';

export default function SuggestionsList({
    items = [],
    maxItems = 10,
    highlightIndex = -1,
    onHighlight = () => { },
    onSelect = () => { },
    renderItem,
    containerClass = 'sku-suggestions',
}) {
    if (!items || items.length === 0) return null;

    return (
        <div className={containerClass} role="listbox">
            {items.slice(0, maxItems).map((it, idx) => (
                <div
                    key={typeof it === 'string' ? it : it._id || idx}
                    className={`sku-suggestion-item ${idx === highlightIndex ? 'highlighted' : ''}`}
                    onMouseDown={(ev) => {
                        ev.preventDefault();
                        onSelect(it);
                    }}
                    onMouseEnter={() => onHighlight(idx)}
                    role="option"
                    aria-selected={idx === highlightIndex}
                >
                    {renderItem ? renderItem(it, idx === highlightIndex) : String(it)}
                </div>
            ))}
        </div>
    );
}
