// TextElement コンポーネント - タッチ対応版
const TextElement = ({ text, style, position, isSelected, onSelect, onDragStart, onDrag, onDragEnd }) => {
    const elementRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

    const handleStart = (clientX, clientY) => {
        setIsDragging(true);
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
            x: clientX - rect.left,
            y: clientY - rect.top
        });
        onDragStart();
        onSelect();
    };

    const handleMove = (clientX, clientY) => {
        if (!isDragging) return;
        const parentRect = elementRef.current.parentElement.getBoundingClientRect();
        const x = clientX - parentRect.left - dragOffset.x;
        const y = clientY - parentRect.top - dragOffset.y;
        onDrag({ x, y });
    };

    const handleEnd = () => {
        if (isDragging) {
            setIsDragging(false);
            onDragEnd();
        }
    };

    // マウスイベントハンドラ
    const handleMouseDown = (e) => {
        handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e) => {
        handleMove(e.clientX, e.clientY);
    };

    // タッチイベントハンドラ
    const handleTouchStart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
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
                touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {text}
        </div>
    );
};

// RangeSlider コンポーネント - モバイル対応版
const RangeSlider = ({ label, value, onChange, min = 0, max = 200 }) => {
    return (
        <div className="adjustment-control">
            <label>{label}</label>
            <div className="slider-container">
                <input
                    type="range"
                    className="range-slider"
                    min={min}
                    max={max}
                    value={value}
                    onChange={e => onChange(parseInt(e.target.value))}
                    style={{ touchAction: 'none' }}
                />
                <div className="value-display">{value}%</div>
            </div>
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

    // 汎用的なドラッグ開始ハンドラ
    const handleDragStart = (clientX, clientY) => {
        setIsDragging(true);
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
            x: clientX - rect.left,
            y: clientY - rect.top
        });
        onDragStart();
        onSelect();
    };

    // 汎用的な移動ハンドラ
    const handleMove = (clientX, clientY) => {
        if (!isDragging && !isResizing) return;
        
        if (isDragging) {
            const parentRect = elementRef.current.parentElement.getBoundingClientRect();
            const x = clientX - parentRect.left - dragOffset.x;
            const y = clientY - parentRect.top - dragOffset.y;
            onDrag({ x, y });
        }

        if (isResizing) {
            const dx = clientX - startPos.x;
            const dy = clientY - startPos.y;
            const aspect = startSize.width / startSize.height;
            const newWidth = Math.max(30, startSize.width + dx);
            const newHeight = newWidth / aspect;
            onResize({ width: newWidth, height: newHeight });
        }
    };

    // マウスイベントハンドラ
    const handleMouseDown = (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        handleDragStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e) => {
        handleMove(e.clientX, e.clientY);
    };

    // タッチイベントハンドラ
    const handleTouchStart = (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        e.preventDefault();
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    };

    // リサイズハンドラ
    const handleResizeStart = (clientX, clientY) => {
        setIsResizing(true);
        setStartSize({ width: size.width, height: size.height });
        setStartPos({ x: clientX, y: clientY });
    };

    const handleResizeMouseDown = (e) => {
        e.stopPropagation();
        handleResizeStart(e.clientX, e.clientY);
    };

    const handleResizeTouchStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const touch = e.touches[0];
        handleResizeStart(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
        if (isDragging) {
            setIsDragging(false);
            onDragEnd();
        }
        setIsResizing(false);
    };

    React.useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
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
                    onMouseDown={handleResizeMouseDown}
                    onTouchStart={handleResizeTouchStart}
                />
            )}
        </div>
    );
};

// StampSelector コンポーネント - モバイル対応版
const StampSelector = React.memo(({ 
    onPreviewStamp, 
    onConfirmStamp, 
    onCancelStamp, 
    onDeleteStamp,
    isPreviewMode, 
    isEditing,
    uploadedStamps,
    onUploadStamp
}) => {
    const presetStampFiles = [
        'stamp_01.png',
        'stamp_02.png',
    ];
    
    const presetStamps = React.useMemo(() => 
        presetStampFiles.map(file => ({
            id: file,
            src: `./stamp/${file}`
        }))
    , []);

    const handleSelectStamp = (stamp) => {
        const img = new Image();
        img.onload = () => {
            const maxSize = 200;
            let width = stamp.originalSize ? stamp.originalSize.width / 3 : img.width / 3;
            let height = stamp.originalSize ? stamp.originalSize.height / 3 : img.height / 3;
            
            if (width > maxSize || height > maxSize) {
                const aspect = width / height;
                if (width > height) {
                    width = maxSize;
                    height = width / aspect;
                } else {
                    height = maxSize;
                    width = height * aspect;
                }
            }
            onPreviewStamp(stamp.src, { width, height });
        };
        img.src = stamp.src;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const stamp = {
                        id: Date.now(),
                        src: event.target.result,
                        originalSize: {
                            width: img.width,
                            height: img.height
                        }
                    };
                    onUploadStamp(stamp);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    if (isPreviewMode || isEditing) {
        return (
            <div className="stamp-selector">
                <h4>{isEditing ? 'スタンプの編集' : 'スタンプを配置'}</h4>
                <p>画像上の好きな位置にドラッグして配置し、サイズを調整してください</p>
                <div className="preview-actions">
                    <button 
                        className="btn btn-primary"
                        onClick={onConfirmStamp}
                        style={{marginRight: '10px'}}
                    >
                        確定
                    </button>
                    {isEditing && (
                        <button 
                            className="btn btn-danger"
                            onClick={onDeleteStamp}
                            style={{marginRight: '10px'}}
                        >
                            削除
                        </button>
                    )}
                    <button 
                        className="btn"
                        onClick={onCancelStamp}
                    >
                        キャンセル
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="stamp-selector">
            {presetStamps.length > 0 && (
                <div className="preset-stamps">
                    <h4>プリセットスタンプ</h4>
                    <div className="stamp-grid">
                        {presetStamps.map(stamp => (
                            <div 
                                key={stamp.id}
                                className="stamp-item"
                                onClick={() => handleSelectStamp(stamp)}
                            >
                                <img 
                                    src={stamp.src} 
                                    alt="プリセットスタンプ"
                                    className="stamp-preview"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="stamp-upload">
                <h4>カスタムスタンプ</h4>
                <label className="upload-button">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    画像をアップロード
                </label>
            </div>
            
            {uploadedStamps.length > 0 && (
                <div className="uploaded-stamps">
                    <h4>アップロードした画像</h4>
                    <div className="stamp-grid">
                        {uploadedStamps.map(stamp => (
                            <div 
                                key={stamp.id}
                                className="stamp-item"
                                onClick={() => handleSelectStamp(stamp)}
                            >
                                <img 
                                    src={stamp.src} 
                                    alt="アップロードした画像"
                                    className="stamp-preview"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
// SelectionArea コンポーネント - タッチ対応版
const SelectionArea = ({ position, size, isVisible, onMove, onResize }) => {
    const elementRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = React.useState({ width: 0, height: 0 });
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

    // 汎用的なドラッグ開始ハンドラ
    const handleStart = (clientX, clientY) => {
        setIsDragging(true);
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
            x: clientX - rect.left,
            y: clientY - rect.top
        });
    };

    // 汎用的な移動ハンドラ
    const handleMove = (clientX, clientY) => {
        if (!isDragging && !isResizing) return;
        
        if (isDragging) {
            const parentRect = elementRef.current.parentElement.getBoundingClientRect();
            const x = clientX - parentRect.left - dragOffset.x;
            const y = clientY - parentRect.top - dragOffset.y;
            onMove({ x, y });
        }

        if (isResizing) {
            const dx = clientX - startPos.x;
            const dy = clientY - startPos.y;
            onResize({
                width: Math.max(100, startSize.width + dx),
                height: Math.max(100, startSize.height + dy)
            });
        }
    };

    // マウスイベントハンドラ
    const handleMouseDown = (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e) => {
        handleMove(e.clientX, e.clientY);
    };

    // タッチイベントハンドラ
    const handleTouchStart = (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    };

    // リサイズハンドラ
    const handleResizeStart = (clientX, clientY) => {
        setIsResizing(true);
        setStartSize({ width: size.width, height: size.height });
        setStartPos({ x: clientX, y: clientY });
    };

    const handleResizeMouseDown = (e) => {
        e.stopPropagation();
        handleResizeStart(e.clientX, e.clientY);
    };

    const handleResizeTouchStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const touch = e.touches[0];
        handleResizeStart(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    React.useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
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
                onMouseDown={handleResizeMouseDown}
                onTouchStart={handleResizeTouchStart}
            />
        </div>
    );
};

// FontSelector コンポーネント - モバイル対応版
const FontSelector = React.memo(({ selectedFont, onFontSelect }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    
    const categories = [
        {
            id: 'japanese',
            name: '和文フォント',
            fonts: fonts.filter(f => 
                ['明朝体', 'ゴシック体', '毛筆体', '春の海明朝', '丸ゴシック', 'クレナイド']
                .includes(f.name)
            )
        },
        {
            id: 'design',
            name: 'デザインフォント',
            fonts: fonts.filter(f => 
                ['モノマニアック', 'ガムジャ']
                .includes(f.name)
            )
        }
    ];

    const selectedFontInfo = fonts.find(f => f.value === selectedFont);

    // タッチイベント用のハンドラ
    const handleTouchStart = (e) => {
        // モバイルでダブルタップによるズームを防止
        e.preventDefault();
    };

    return (
        <div className="font-selector">
            <div className="font-preview">
                <label>フォント</label>
                <div 
                    className="current-font-sample"
                    onClick={() => setIsExpanded(!isExpanded)}
                    onTouchStart={handleTouchStart}
                >
                    <span 
                        className="sample-text"
                        style={{ fontFamily: selectedFontInfo.value }}
                    >
                        {selectedFontInfo.sample}
                    </span>
                    <div className="preview-footer">
                        <span className="font-name">{selectedFontInfo.name}</span>
                        <span className="expand-icon">
                            {isExpanded ? '▼' : '▶'}
                        </span>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="font-selection-panel">
                    {categories.map(category => (
                        <div key={category.id} className="font-category">
                            <h4 className="category-title">{category.name}</h4>
                            <div className="font-samples">
                                {category.fonts.map(font => (
                                    <div 
                                        key={font.value}
                                        className={`font-sample ${selectedFont === font.value ? 'selected' : ''}`}
                                        onClick={() => {
                                            onFontSelect(font.value);
                                            setIsExpanded(false);
                                        }}
                                        onTouchStart={handleTouchStart}
                                    >
                                        <span 
                                            className="sample-text"
                                            style={{ fontFamily: font.value }}
                                        >
                                            {font.sample}
                                        </span>
                                        <span className="font-name">{font.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
// フォント設定（変更なし）
const fonts = [
    { 
        name: '明朝体',
        value: "'Noto Serif JP', serif",
        sample: 'あけましておめでとうございます'
    },
    { 
        name: 'ゴシック体',
        value: "'Noto Sans JP', sans-serif",
        sample: 'あけましておめでとうございます'
    },
    { 
        name: '毛筆体',
        value: "'Yuji Syuku', serif",
        sample: '謹賀新年'
    },
    { 
        name: '春の海明朝',
        value: "'Kaisei HarunoUmi', serif",
        sample: '迎春'
    },
    { 
        name: '丸ゴシック',
        value: "'Zen Maru Gothic', sans-serif",
        sample: 'あけましておめでとうございます'
    },
    { 
        name: 'クレナイド',
        value: "'Zen Kurenaido', sans-serif",
        sample: 'Happy New Year'
    },
    { 
        name: 'モノマニアック',
        value: "'Monomaniac One', sans-serif",
        sample: '2024'
    },
    { 
        name: 'ガムジャ',
        value: "'Gamja Flower', cursive",
        sample: '새해 복 많이 받으세요'
    }
];

// メインの NewYearCardEditor コンポーネント
const NewYearCardEditor = () => {
    // 既存の状態管理をそのまま維持
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [showTutorial, setShowTutorial] = React.useState(true);
    const [showAdjustments, setShowAdjustments] = React.useState(false);
    const [showTextControls, setShowTextControls] = React.useState(false);
    const [showStampControls, setShowStampControls] = React.useState(false);
    const [adjustments, setAdjustments] = React.useState({
        brightness: 100,
        contrast: 100,
        saturate: 100
    });

    // テキスト関連の状態
    const [textElements, setTextElements] = React.useState([{
        id: Date.now(),
        text: '',
        position: { x: 50, y: 50 },
        style: {
            fontFamily: "'Noto Serif JP', serif",
            fontSize: '24px',
            color: '#000000',
            writingMode: 'horizontal-tb'
        }
    }]);
    const [selectedTextIndex, setSelectedTextIndex] = React.useState(0);
    const [currentText, setCurrentText] = React.useState('');
    const [currentFont, setCurrentFont] = React.useState("'Noto Serif JP', serif");
    const [currentSize, setCurrentSize] = React.useState(24);
    const [currentColor, setCurrentColor] = React.useState('#000000');
    const [isVertical, setIsVertical] = React.useState(false);

    // スタンプ関連の状態
    const [stampElements, setStampElements] = React.useState([]);
    const [selectedStampIndex, setSelectedStampIndex] = React.useState(null);
    const [previewStamp, setPreviewStamp] = React.useState(null);
    const [showLayoutControls, setShowLayoutControls] = React.useState(false);
    const [selectionArea, setSelectionArea] = React.useState(null);
    const [uploadedStamps, setUploadedStamps] = React.useState([]);

    // モバイル対応: ファイルアップロードハンドラ
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // ファイルサイズチェックを追加（5MB制限の例）
            if (file.size > 5 * 1024 * 1024) {
                alert('ファイルサイズが大きすぎます（5MB以下にしてください）');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setSelectedImage(e.target.result);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    // モバイル対応: タッチイベントの処理
    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            e.preventDefault(); // シングルタッチの場合のみズームを防止
        }
    };

    React.useEffect(() => {
        // モバイルでのピンチズーム防止
        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
        };
    }, []);

    // その他の既存の関数はそのまま維持
    const getImageStyle = () => ({
        filter: `brightness(${adjustments.brightness}%) 
                contrast(${adjustments.contrast}%) 
                saturate(${adjustments.saturate}%)`
    });

    const handleTextDrag = (index, position) => {
        const updatedElements = [...textElements];
        updatedElements[index] = {
            ...updatedElements[index],
            position
        };
        setTextElements(updatedElements);
    };

    const handleTextSelect = (index) => {
        setSelectedTextIndex(index);
        const element = textElements[index];
        setCurrentText(element.text || '');
        setCurrentFont(element.style.fontFamily);
        setCurrentSize(parseInt(element.style.fontSize));
        setCurrentColor(element.style.color);
        setIsVertical(element.style.writingMode === 'vertical-rl');
    };

    const updateSelectedText = () => {
        if (selectedTextIndex === null) return;
        
        const updatedElements = [...textElements];
        updatedElements[selectedTextIndex] = {
            ...updatedElements[selectedTextIndex],
            text: currentText,
            style: {
                fontFamily: currentFont,
                fontSize: `${currentSize}px`,
                color: currentColor,
                writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb'
            }
        };
        setTextElements(updatedElements);
    };

    // スタンプ関連の処理
    const handlePreviewStamp = (src, size) => {
        const newStamp = {
            id: Date.now(),
            src,
            position: { x: 50, y: 50 },
            size
        };
        setPreviewStamp(newStamp);
        setSelectedStampIndex(null);
    };

    const handleConfirmStamp = () => {
        if (previewStamp) {
            setStampElements(prev => [...prev, previewStamp]);
            setPreviewStamp(null);
        } else if (selectedStampIndex !== null) {
            setSelectedStampIndex(null);
        }
    };

    const handleCancelStamp = () => {
        setPreviewStamp(null);
        setSelectedStampIndex(null);
    };

    const handleDeleteStamp = () => {
        if (selectedStampIndex !== null) {
            setStampElements(prev => prev.filter((_, i) => i !== selectedStampIndex));
            setSelectedStampIndex(null);
        }
    };

    const handleStampDrag = (index, position) => {
        if (previewStamp) {
            setPreviewStamp(prev => ({
                ...prev,
                position
            }));
        } else if (selectedStampIndex !== null) {
            const updatedElements = [...stampElements];
            updatedElements[selectedStampIndex] = {
                ...updatedElements[selectedStampIndex],
                position
            };
            setStampElements(updatedElements);
        }
    };

    const handleStampResize = (index, size) => {
        if (previewStamp) {
            setPreviewStamp(prev => ({
                ...prev,
                size
            }));
        } else if (selectedStampIndex !== null) {
            const updatedElements = [...stampElements];
            updatedElements[selectedStampIndex] = {
                ...updatedElements[selectedStampIndex],
                size
            };
            setStampElements(updatedElements);
        }
    };

    // モバイル対応: ツールバーのトグル処理を改善
    const handleToolbarClick = (tool) => {
        // 他のパネルを閉じる
        setShowAdjustments(false);
        setShowTextControls(false);
        setShowStampControls(false);
        setShowLayoutControls(false);
        
        // 選択したパネルを開く
        switch(tool) {
            case 'adjust':
                setShowAdjustments(true);
                break;
            case 'text':
                setShowTextControls(true);
                break;
            case 'stamp':
                setShowStampControls(true);
                break;
            case 'layout':
                setShowLayoutControls(true);
                break;
        }
        
        // レイアウトツール以外を選択した時は選択範囲を非表示
        if (tool !== 'layout') {
            setSelectionArea(null);
        }
    };

    const handleInitSelection = () => {
        if (!selectedImage) return;
        
        const imageElement = document.querySelector('.preview-image');
        if (!imageElement) return;
    
        const rect = imageElement.getBoundingClientRect();
        const parentRect = imageElement.parentElement.getBoundingClientRect();
    
        setSelectionArea({
            position: {
                x: (rect.left - parentRect.left) + 20,
                y: (rect.top - parentRect.top) + 20
            },
            size: {
                width: rect.width - 40,
                height: rect.height - 40
            }
        });
    };

    // 画像のダウンロード処理
    const handleDownload = async () => {
        if (!selectedImage) return;
    
        const imageElement = document.querySelector('.preview-image');
        if (!imageElement) return;
    
        const elements = [
            ...textElements.map(element => ({
                ...element,
                type: 'text'
            })),
            ...stampElements.map(element => ({
                ...element,
                type: 'stamp'
            }))
        ];
    
        await downloadImage(
            imageElement,
            elements,
            selectionArea,
            adjustments
        );
    };
    
    React.useEffect(() => {
        if (textElements.length > 0) {
            handleTextSelect(0);
        }
    }, []);

    React.useEffect(() => {
        updateSelectedText();
    }, [currentText, currentFont, currentSize, currentColor, isVertical]);

    // レンダリング部分（既存のまま）
    return (
        <div className="editor-container">
            <div className="editor-main">
                {selectedImage ? (
                    <>
                        <img 
                            src={selectedImage} 
                            alt="プレビュー" 
                            className="preview-image"
                            style={getImageStyle()}
                        />
                        <div className="text-layer">
                            {textElements.map((element, index) => (
                                <TextElement
                                    key={element.id}
                                    text={element.text}
                                    style={element.style}
                                    position={element.position}
                                    isSelected={index === selectedTextIndex}
                                    onSelect={() => {
                                        handleTextSelect(index);
                                        setSelectedStampIndex(null);
                                    }}
                                    onDragStart={() => {}}
                                    onDrag={(pos) => handleTextDrag(index, pos)}
                                    onDragEnd={() => {}}
                                />
                            ))}
                            {stampElements.map((element, index) => (
                                <StampElement
                                    key={element.id}
                                    src={element.src}
                                    position={element.position}
                                    size={element.size}
                                    isSelected={index === selectedStampIndex}
                                    onSelect={() => {
                                        setSelectedStampIndex(index);
                                        setSelectedTextIndex(null);
                                    }}
                                    onDragStart={() => {}}
                                    onDrag={(pos) => handleStampDrag(index, pos)}
                                    onDragEnd={() => {}}
                                    onResize={(size) => handleStampResize(index, size)}
                                />
                            ))}
                            {previewStamp && (
                                <StampElement
                                    key="preview"
                                    src={previewStamp.src}
                                    position={previewStamp.position}
                                    size={previewStamp.size}
                                    isSelected={true}
                                    onSelect={() => {}}
                                    onDragStart={() => {}}
                                    onDrag={(pos) => handleStampDrag(null, pos)}
                                    onDragEnd={() => {}}
                                    onResize={(size) => handleStampResize(null, size)}
                                />
                            )}
                            <SelectionArea
                                position={selectionArea?.position || { x: 0, y: 0 }}
                                size={selectionArea?.size || { width: 0, height: 0 }}
                                isVisible={!!selectionArea}
                                onMove={(newPosition) => setSelectionArea(prev => ({
                                    ...prev,
                                    position: newPosition
                                }))}
                                onResize={(newSize) => setSelectionArea(prev => ({
                                    ...prev,
                                    size: newSize
                                }))}
                            />
                        </div>
                    </>
                ) : (
                    <div style={{textAlign: 'center'}}>
                        <p>画像をアップロードしてください</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{marginTop: '10px'}}
                        />
                    </div>
                )}
            </div>

            <div className="toolbar">
                <button 
                    className={`btn ${showAdjustments ? 'btn-primary' : ''}`}
                    onClick={() => handleToolbarClick('adjust')}
                >
                    画像調整
                </button>
                <button 
                    className={`btn ${showTextControls ? 'btn-primary' : ''}`}
                    onClick={() => handleToolbarClick('text')}
                >
                    文字入力
                </button>
                <button 
                    className={`btn ${showStampControls ? 'btn-primary' : ''}`}
                    onClick={() => handleToolbarClick('stamp')}
                >
                    スタンプ
               </button>
                <button 
                    className={`btn ${showLayoutControls ? 'btn-primary' : ''}`}
                    onClick={() => handleToolbarClick('layout')}
                >
                    レイアウト
                </button>
            </div>

            {showTextControls && selectedImage && (
                <div className="control-panel">
                    <div className="writing-mode-toggle">
                        <button 
                            className={!isVertical ? 'active' : ''}
                            onClick={() => setIsVertical(false)}
                        >
                            横書き
                        </button>
                        <button 
                            className={isVertical ? 'active' : ''}
                            onClick={() => setIsVertical(true)}
                        >
                            縦書き
                        </button>
                    </div>

                    <FontSelector 
                        selectedFont={currentFont}
                        onFontSelect={setCurrentFont}
                    />

                    <input
                        type="text"
                        className="text-input"
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        placeholder={`テキスト ${selectedTextIndex + 1}`}
                    />

                    <div className="text-controls">
                        <div>
                            <label>文字サイズ</label>
                            <input
                                type="range"
                                className="range-slider"
                                min="12"
                                max="72"
                                value={currentSize}
                                onChange={(e) => setCurrentSize(parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label>文字色</label>
                            <input
                                type="color"
                                className="color-picker"
                                value={currentColor}
                                onChange={(e) => setCurrentColor(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            const newElement = {
                                id: Date.now(),
                                text: '',
                                position: { x: 50, y: 50 },
                                style: {
                                    fontFamily: currentFont,
                                    fontSize: `${currentSize}px`,
                                    color: currentColor,
                                    writingMode: isVertical ? 'vertical-rl' : 'horizontal-tb'
                                }
                            };
                            setTextElements([...textElements, newElement]);
                            setSelectedTextIndex(textElements.length);
                        }}
                        style={{width: '100%', marginTop: '10px'}}
                    >
                        新しいテキストを追加
                    </button>
                </div>
            )}

            {showStampControls && selectedImage && (
                <div className="control-panel">
                    <StampSelector 
                        onPreviewStamp={handlePreviewStamp}
                        onConfirmStamp={handleConfirmStamp}
                        onCancelStamp={handleCancelStamp}
                        onDeleteStamp={handleDeleteStamp}
                        isPreviewMode={!!previewStamp}
                        isEditing={selectedStampIndex !== null}
                        uploadedStamps={uploadedStamps}
                        onUploadStamp={setUploadedStamps}
                    />
                </div>
            )}

            {showAdjustments && selectedImage && (
                <div className="control-panel">
                    <h3>画像調整</h3>
                    <RangeSlider
                        label="明るさ"
                        value={adjustments.brightness}
                        onChange={(value) => setAdjustments(prev => ({...prev, brightness: value}))}
                    />
                    <RangeSlider
                        label="コントラスト"
                        value={adjustments.contrast}
                        onChange={(value) => setAdjustments(prev => ({...prev, contrast: value}))}
                    />
                    <RangeSlider
                        label="彩度"
                        value={adjustments.saturate}
                        onChange={(value) => setAdjustments(prev => ({...prev, saturate: value}))}
                    />
                    <button 
                        className="btn"
                        onClick={() => setAdjustments({
                            brightness: 100,
                            contrast: 100,
                            saturate: 100
                        })}
                        style={{marginTop: '10px'}}
                    >
                        リセット
                    </button>
                </div>
            )}

            {showLayoutControls && selectedImage && (
                <div className="control-panel">
                    <div className="layout-controls">
                        <button 
                            className="btn btn-primary"
                            onClick={handleInitSelection}
                            style={{marginRight: '10px'}}
                        >
                            範囲選択
                        </button>
                        <button 
                            className="btn"
                            onClick={handleDownload}
                        >
                            ダウンロード
                        </button>
                    </div>
                </div>
            )}

            {showTutorial && (
                <div className="tutorial">
                    <h2>VRChatの年賀状を作成！</h2>
                    <h3>作成した年賀状を上げる場合は <span className="hashtag">#VRC_HNY_Card_2025</span> を付けて頂けると嬉しいです！</h3>
                    <ol>
                        <li>写真をアップロード(アップロードしないと何も操作はできないです！)</li>
                        <li>画像の明るさなどを調整</li>
                        <li>スタンプやテキスト入力で文字やアイコンで装飾！</li>
                        <li>レイアウトからダウンロードして完成！</li>
                    </ol>
                    <h4>スタンプは既にあるもの以外にも画像をアップロードしてスタンプとして使用可能です！</h4>
                    <p>配置したスタンプは確定させないとダウンロード時に描画されないので注意してください～</p>
                    <p>スタンプや文字は追加した順に重なっていきます。なので、動かしたいけど選択できない場合は手前にあるものをどかせば操作できます。</p>
                    <p>レイアウトの範囲選択を使用すると選択した範囲のみダウンロードできます。枠を超えても選択できるのでうまいこと頑張ってください。</p>
                    <p>年賀状のフレーム素材を一つ目のスタンプで追加して作成した後に範囲調整でフレーム全体を選択すれば、それっぽくできます</p>

                    <h4>こちらのサイトにスタンプとして使えそうな素材があるので良ければ！</h4>
                    <ul>
                        <li><a href="https://www.post.japanpost.jp/send/create/freeillust/downloads/" target="_blank">郵便局フリーイラスト</a></li>
                        <li><a href="https://online.brother.co.jp/ot/nengajo/stamp/?page=1" target="_blank">brother 年賀状素材</a></li>
                        <li><a href="https://pepero-nenga.com/illust/nengajoo_illust_index.html" target="_blank">年賀状スープ 無料イラスト</a></li>
                    </ul>
                    <p>再配布が禁止されているので、ご自分でダウンロードしてからスタンプとしてアップロードして使ってください</p>
                    <a href="https://x.com/ASA58n_" target="_blank">Twitter（X）</a>
                    <p>何か要望とかあったら連絡ください～！何もないとは思いますが、使用は自己責任です。</p>
                </div>
            )}
        </div>
    );
};

// アプリケーションのレンダリング
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<NewYearCardEditor />);
