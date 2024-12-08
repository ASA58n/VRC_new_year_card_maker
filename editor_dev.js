// TextElement コンポーネント - タッチ対応版
const TextElement = ({ text, style, position, isSelected, onSelect, onDragStart, onDrag, onDragEnd }) => {
    const elementRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

    // タッチイベントハンドラ
    const handleTouchStart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        });
        onDragStart();
        onSelect();
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        
        const parentRect = elementRef.current.parentElement.getBoundingClientRect();
        const x = touch.clientX - parentRect.left - dragOffset.x;
        const y = touch.clientY - parentRect.top - dragOffset.y;
        
        onDrag({ x, y });
    };

    const handleTouchEnd = () => {
        if (isDragging) {
            setIsDragging(false);
            onDragEnd();
        }
    };

    // マウスイベントハンドラは既存のまま維持
    const handleMouseDown = (e) => {
        setIsDragging(true);
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        onDragStart();
        onSelect();
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const parentRect = elementRef.current.parentElement.getBoundingClientRect();
        const x = e.clientX - parentRect.left - dragOffset.x;
        const y = e.clientY - parentRect.top - dragOffset.y;
        
        onDrag({ x, y });
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            onDragEnd();
        }
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging]);

    return (
        <div
            ref={elementRef}
            className={`text-element ${isSelected ? 'selected' : ''}`}
            style={{
                ...style,
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none' // タッチデバイスでのスクロールを防止
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {text}
        </div>
    );
};
// StampElement コンポーネント - タッチ対応版
const StampElement = ({ src, style, position, size, isSelected, onSelect, onDragStart, onDrag, onDragEnd, onResize }) => {
    const elementRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = React.useState({ width: 0, height: 0 });
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

    // タッチ用ドラッグハンドラ
    const handleTouchStart = (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        });
        onDragStart();
        onSelect();
    };

    const handleTouchMove = (e) => {
        if (!isDragging && !isResizing) return;
        const touch = e.touches[0];
        
        if (isDragging) {
            const parentRect = elementRef.current.parentElement.getBoundingClientRect();
            const x = touch.clientX - parentRect.left - dragOffset.x;
            const y = touch.clientY - parentRect.top - dragOffset.y;
            onDrag({ x, y });
        }

        if (isResizing) {
            const dx = touch.clientX - startPos.x;
            const dy = touch.clientY - startPos.y;
            const aspect = startSize.width / startSize.height;
            
            const newWidth = Math.max(30, startSize.width + dx);
            const newHeight = newWidth / aspect;

            onResize({ width: newWidth, height: newHeight });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
        if (isDragging) {
            onDragEnd();
        }
    };

    // タッチ用リサイズハンドラ
    const handleResizeTouchStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const touch = e.touches[0];
        setIsResizing(true);
        setStartSize({ width: size.width, height: size.height });
        setStartPos({ x: touch.clientX, y: touch.clientY });
    };

    // マウスイベントハンドラ（既存のまま）
    const handleMouseDown = (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        setIsDragging(true);
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        onDragStart();
        onSelect();
    };

    const handleMouseMove = (e) => {
        if (!isDragging && !isResizing) return;
        
        if (isDragging) {
            const parentRect = elementRef.current.parentElement.getBoundingClientRect();
            const x = e.clientX - parentRect.left - dragOffset.x;
            const y = e.clientY - parentRect.top - dragOffset.y;
            onDrag({ x, y });
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            onDragEnd();
        }
        setIsResizing(false);
    };

    React.useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, isResizing]);

    return (
        <div
            ref={elementRef}
            className={`stamp-element ${isSelected ? 'selected' : ''}`}
            style={{
                ...style,
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
                position: 'absolute',
                touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <img 
                src={src} 
                alt="スタンプ"
                style={{ 
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    userSelect: 'none'
                }}
            />
            {isSelected && (
                <div 
                    className="resize-handle"
                    style={{
                        width: '24px',
                        height: '24px',
                        bottom: '-12px',
                        right: '-12px'
                    }}
                    onMouseDown={handleResizeStart}
                    onTouchStart={handleResizeTouchStart}
                />
            )}
        </div>
    );
};
// SelectionArea コンポーネント - タッチ対応版
const SelectionArea = ({ position, size, isVisible, onMove, onResize }) => {
    const elementRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = React.useState({ width: 0, height: 0 });
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

    // タッチイベントハンドラ
    const handleTouchStart = (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        });
    };

    const handleTouchMove = (e) => {
        if (!isDragging && !isResizing) return;
        e.preventDefault();
        const touch = e.touches[0];
        
        if (isDragging) {
            const parentRect = elementRef.current.parentElement.getBoundingClientRect();
            const x = touch.clientX - parentRect.left - dragOffset.x;
            const y = touch.clientY - parentRect.top - dragOffset.y;
            onMove({ x, y });
        }

        if (isResizing) {
            const dx = touch.clientX - startPos.x;
            const dy = touch.clientY - startPos.y;
            onResize({
                width: Math.max(100, startSize.width + dx),
                height: Math.max(100, startSize.height + dy)
            });
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    // リサイズ用タッチハンドラ
    const handleResizeTouchStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const touch = e.touches[0];
        setIsResizing(true);
        setStartSize({ width: size.width, height: size.height });
        setStartPos({ x: touch.clientX, y: touch.clientY });
    };

    // マウスイベントハンドラ（既存のまま）
    const handleMouseDown = (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        setIsDragging(true);
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging && !isResizing) return;
        
        if (isDragging) {
            const parentRect = elementRef.current.parentElement.getBoundingClientRect();
            const x = e.clientX - parentRect.left - dragOffset.x;
            const y = e.clientY - parentRect.top - dragOffset.y;
            onMove({ x, y });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    React.useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, isResizing]);

    if (!isVisible) return null;

    return (
        <div
            ref={elementRef}
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${size.width}px`,
                height: `${size.height}px`,
                border: '2px solid #4a90e2',
                cursor: isDragging ? 'grabbing' : 'grab',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div 
                className="resize-handle"
                style={{
                    position: 'absolute',
                    width: '24px',
                    height: '24px',
                    background: '#4a90e2',
                    border: '2px solid white',
                    borderRadius: '50%',
                    bottom: '-12px',
                    right: '-12px',
                    cursor: 'se-resize',
                    touchAction: 'none'
                }}
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeTouchStart}
            />
        </div>
    );
};
/* モバイル対応のためのスタイル */
const mobileStyles = `
/* メタビューポートの設定 */
@viewport {
    width: device-width;
    initial-scale: 1.0;
    maximum-scale: 1.0;
    user-scalable: no;
}

/* レスポンシブレイアウト */
@media (max-width: 768px) {
    .editor-container {
        flex-direction: column;
        height: auto;
        min-height: 100vh;
    }

    .editor-main {
        width: 100%;
        height: auto;
        min-height: 300px;
        padding: 10px;
    }

    .preview-image {
        max-width: 100%;
        height: auto;
        object-fit: contain;
    }

    .control-panel {
        width: 100%;
        max-height: 40vh;
        overflow-y: auto;
        padding: 10px;
        position: relative;
        bottom: 0;
    }

    /* ツールバーのレスポンシブ対応 */
    .toolbar {
        flex-wrap: wrap;
        gap: 5px;
        padding: 8px;
    }

    .toolbar button {
        flex: 1;
        min-width: calc(50% - 5px);
        padding: 12px 8px;
        font-size: 14px;
        min-height: 44px;  /* タップターゲットサイズの確保 */
    }

    /* テキストコントロールのレスポンシブ対応 */
    .text-controls {
        flex-direction: column;
        gap: 10px;
    }

    .text-input {
        width: 100%;
        padding: 12px;
        font-size: 16px;  /* iOSでズームを防ぐ */
    }

    .writing-mode-toggle {
        display: flex;
        gap: 5px;
    }

    .writing-mode-toggle button {
        flex: 1;
        padding: 12px;
        font-size: 14px;
    }

    /* フォント選択パネルのモバイル対応 */
    .font-selector {
        width: 100%;
    }

    .font-selection-panel {
        max-height: 200px;
        overflow-y: auto;
    }

    .font-samples {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 8px;
    }

    /* スタンプグリッドのモバイル対応 */
    .stamp-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 8px;
    }

    .stamp-item {
        aspect-ratio: 1;
    }

    /* スライダーのモバイル対応 */
    .range-slider {
        width: 100%;
        height: 30px;  /* タッチ操作用に大きく */
    }

    /* チュートリアルのモバイル対応 */
    .tutorial {
        padding: 15px;
        font-size: 14px;
        max-height: 60vh;
        overflow-y: auto;
    }
}

/* タッチデバイス特有の調整 */
@media (hover: none) {
    /* タッチターゲットサイズの最適化 */
    .resize-handle {
        width: 32px;
        height: 32px;
        border-width: 2px;
    }

    /* スクロール防止 */
    .text-element,
    .stamp-element,
    .selection-area {
        touch-action: none;
    }

    /* タッチ操作のための余白調整 */
    .font-sample,
    .current-font-sample {
        padding: 15px;
    }

    /* コントロール要素の操作性向上 */
    input[type="range"] {
        height: 36px;
    }

    input[type="color"] {
        min-height: 44px;
        min-width: 44px;
    }

    /* ボタンのタッチ操作性向上 */
    button {
        min-height: 44px;
        padding: 12px;
    }
}

/* iOSでの特別な対応 */
@supports (-webkit-touch-callout: none) {
    /* iOSでのスクロールバウンス防止 */
    .editor-container {
        position: fixed;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    /* iOSでのフォーム要素のデフォルトスタイル抑制 */
    input,
    textarea,
    select {
        -webkit-appearance: none;
        border-radius: 0;
    }
}
`;

// スタイルの適用
const injectStyles = () => {
    const style = document.createElement('style');
    style.textContent = mobileStyles;
    document.head.appendChild(style);

    // ビューポートメタタグの追加
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
};

// スタイルの注入を実行
injectStyles();
