// React の名前空間から必要な機能を取得
const { useState, useEffect, useRef, memo } = React;

// TextElement コンポーネント - ドラッグ可能なテキスト要素
const TextElement = ({ text, style, position, isSelected, onSelect, onDragStart, onDrag, onDragEnd }) => {
    const elementRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
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
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
        >
            {text}
        </div>
    );
};

// RangeSlider コンポーネント - 画像調整用スライダー
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
                />
                <div className="value-display">{value}%</div>
            </div>
        </div>
    );
};

// フォント設定
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

// StampElement コンポーネント - ドラッグ＆リサイズ可能なスタンプ要素
const StampElement = memo(({ src, style, position, size, isSelected, onSelect, onDragStart, onDrag, onDragEnd, onResize }) => {
    const elementRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = React.useState({ width: 0, height: 0 });
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

    // ドラッグ処理
    const handleMouseDown = (e) => {
        if (e.target.classList.contains('resize-handle')) {
            return;
        }
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

    // リサイズ処理
    const handleResizeStart = (e) => {
        e.stopPropagation();
        setIsResizing(true);
        setStartSize({ width: size.width, height: size.height });
        setStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleResizeMove = (e) => {
        if (!isResizing) return;

        const dx = e.clientX - startPos.x;
        const dy = e.clientY - startPos.y;
        const aspect = startSize.width / startSize.height;
        
        const newWidth = Math.max(30, startSize.width + dx);
        const newHeight = newWidth / aspect;

        onResize({ width: newWidth, height: newHeight });
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        if (isResizing) {
            window.addEventListener('mousemove', handleResizeMove);
            window.addEventListener('mouseup', handleResizeEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleResizeMove);
            window.removeEventListener('mouseup', handleResizeEnd);
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
                position: 'absolute'
            }}
            onMouseDown={handleMouseDown}
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
                    onMouseDown={handleResizeStart}
                />
            )}
        </div>
    );
};

// FontSelector コンポーネント - フォント選択UI
const FontSelector = memo(({ selectedFont, onFontSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
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

    // 現在選択されているフォントの情報を取得
    const selectedFontInfo = fonts.find(f => f.value === selectedFont);

    return (
        <div className="font-selector">
            <div className="font-preview">
                <label>フォント</label>
                <div 
                    className="current-font-sample"
                    onClick={() => setIsExpanded(!isExpanded)}
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

// StampSelector コンポーネント - スタンプ選択UI
const StampSelector = memo(({ 
    onPreviewStamp, 
    onConfirmStamp, 
    onCancelStamp, 
    onDeleteStamp,
    isPreviewMode, 
    isEditing 
}) => {
    const [uploadedStamps, setUploadedStamps] = useState([]);

    // 画像アップロード処理
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
                    setUploadedStamps(prev => [...prev, stamp]);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    // スタンプ選択処理
    const handleSelectStamp = (stamp) => {
        const maxSize = 200;
        let width = stamp.originalSize.width / 3;
        let height = stamp.originalSize.height / 3;
        
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

    // プレビューモードまたは編集モード時のUI
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

    // 通常モードのUI（アップロード・スタンプ選択）
    return (
        <div className="stamp-selector">
            <div className="stamp-upload">
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

// LayoutSelector コンポーネントの改良版
const LayoutSelector = memo(({ 
    imageSize,
    cropArea,
    onCropChange,
    onConfirm,
    onCancel,
    selectedImage
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragType, setDragType] = React.useState(null);
    const cropRef = React.useRef(null);
    const [aspectRatio, setAspectRatio] = React.useState('free');

    const aspectRatios = {
        free: null,
        square: 1,
        landscape: 16/9,
        portrait: 9/16
    };

    // アスペクト比に応じて切り抜き範囲を調整
    const adjustByAspectRatio = (crop, ratio = null) => {
        if (!ratio) return crop;

        const newCrop = { ...crop };
        const currentRatio = crop.width / crop.height;

        if (currentRatio > ratio) {
            newCrop.width = crop.height * ratio;
        } else {
            newCrop.height = crop.width / ratio;
        }

        return newCrop;
    };

    // ドラッグ開始
    const handleMouseDown = (e) => {
        const rect = cropRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 既存の選択範囲内でクリックされた場合
        if (isPointInCropArea(x, y)) {
            handleResizeOrMove(e, x, y);
        } else {
            // 新しい選択範囲の作成開始
            startNewSelection(e, x, y);
        }
    };

    // 選択範囲内のクリック判定
    const isPointInCropArea = (x, y) => {
        const scaleX = imageSize.width / cropRef.current.offsetWidth;
        const scaleY = imageSize.height / cropRef.current.offsetHeight;
        
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;

        return (
            scaledX >= cropArea.x &&
            scaledX <= cropArea.x + cropArea.width &&
            scaledY >= cropArea.y &&
            scaledY <= cropArea.y + cropArea.height
        );
    };

    // 新規選択の開始
    const startNewSelection = (e, startX, startY) => {
        const rect = cropRef.current.getBoundingClientRect();
        const scaleX = imageSize.width / rect.width;
        const scaleY = imageSize.height / rect.height;

        const newX = (startX) * scaleX;
        const newY = (startY) * scaleY;

        setDragType('newSelection');
        setIsDragging(true);
        setDragStart({ x: newX, y: newY });

        onCropChange({
            x: newX,
            y: newY,
            width: 0,
            height: 0
        });

        e.preventDefault();
    };

    // マウス移動処理
    const handleMouseMove = (e) => {
        if (!isDragging || !cropRef.current) return;

        const rect = cropRef.current.getBoundingClientRect();
        const scaleX = imageSize.width / rect.width;
        const scaleY = imageSize.height / rect.height;
        
        const currentX = (e.clientX - rect.left) * scaleX;
        const currentY = (e.clientY - rect.top) * scaleY;

        let newCrop;

        if (dragType === 'newSelection') {
            // 新規選択の場合
            const width = Math.abs(currentX - dragStart.x);
            const height = Math.abs(currentY - dragStart.y);
            const x = Math.min(currentX, dragStart.x);
            const y = Math.min(currentY, dragStart.y);

            newCrop = {
                x: Math.max(0, Math.min(x, imageSize.width)),
                y: Math.max(0, Math.min(y, imageSize.height)),
                width: Math.min(width, imageSize.width - x),
                height: Math.min(height, imageSize.height - y)
            };

            if (aspectRatio !== 'free') {
                newCrop = adjustByAspectRatio(newCrop, aspectRatios[aspectRatio]);
            }
        } else if (dragType === 'move') {
            // 既存の選択範囲の移動
            const dx = currentX - dragStart.x;
            const dy = currentY - dragStart.y;
            
            newCrop = {
                x: Math.max(0, Math.min(cropArea.x + dx, imageSize.width - cropArea.width)),
                y: Math.max(0, Math.min(cropArea.y + dy, imageSize.height - cropArea.height)),
                width: cropArea.width,
                height: cropArea.height
            };
        }

        if (newCrop) {
            onCropChange(newCrop);
            setDragStart({ x: currentX, y: currentY });
        }
    };

    // マウスアップ処理
    const handleMouseUp = () => {
        setIsDragging(false);
        setDragType(null);
    };

    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragType, cropArea]);

    return (
        <div className="layout-selector-container">
            <div className="layout-controls">
                <div className="aspect-ratio-controls">
                    <div className="aspect-ratio-buttons">
                        <button
                            className={`btn ${aspectRatio === 'free' ? 'btn-primary' : ''}`}
                            onClick={() => setAspectRatio('free')}
                        >
                            フリー
                        </button>
                        <button
                            className={`btn ${aspectRatio === 'square' ? 'btn-primary' : ''}`}
                            onClick={() => setAspectRatio('square')}
                        >
                            正方形
                        </button>
                        <button
                            className={`btn ${aspectRatio === 'landscape' ? 'btn-primary' : ''}`}
                            onClick={() => setAspectRatio('landscape')}
                        >
                            16:9
                        </button>
                        <button
                            className={`btn ${aspectRatio === 'portrait' ? 'btn-primary' : ''}`}
                            onClick={() => setAspectRatio('portrait')}
                        >
                            9:16
                        </button>
                    </div>
                </div>
            </div>

            <div className="layout-image-container">
                <div 
                    ref={cropRef}
                    className="layout-image-area"
                    onMouseDown={handleMouseDown}
                >
                    <img 
                        src={selectedImage} 
                        alt="レイアウト編集"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />
                    <div className="crop-overlay" />
                    {cropArea && (
                        <div
                            className="crop-rectangle"
                            style={{
                                position: 'absolute',
                                left: `${(cropArea.x / imageSize.width) * 100}%`,
                                top: `${(cropArea.y / imageSize.height) * 100}%`,
                                width: `${(cropArea.width / imageSize.width) * 100}%`,
                                height: `${(cropArea.height / imageSize.height) * 100}%`,
                                border: '2px solid white',
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                                cursor: isDragging ? 'grabbing' : 'grab'
                            }}
                        >
                            <div className="crop-grid">
                                <div className="grid-line vertical" style={{left: '33.33%'}} />
                                <div className="grid-line vertical" style={{left: '66.66%'}} />
                                <div className="grid-line horizontal" style={{top: '33.33%'}} />
                                <div className="grid-line horizontal" style={{top: '66.66%'}} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="layout-actions">
                <button className="btn" onClick={onCancel}>キャンセル</button>
                <button className="btn btn-primary" onClick={onConfirm}>確定</button>
            </div>
        </div>
    );
});

// メインの NewYearCardEditor コンポーネント
const NewYearCardEditor = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [showTutorial, setShowTutorial] = useState(true);
    const [showAdjustments, setShowAdjustments] = React.useState(false);
    const [showTextControls, setShowTextControls] = React.useState(false);
    const [showStampControls, setShowStampControls] = React.useState(false);
    const [showLayoutControls, setShowLayoutControls] = React.useState(false);
    const [imageSize, setImageSize] = React.useState(null);
    const [cropArea, setCropArea] = React.useState(null);
    const [adjustments, setAdjustments] = React.useState({
        brightness: 100,
        contrast: 100,
        saturate: 100
    });

    // エディタのメインコンテナref
    const editorRef = React.useRef(null);

    // テキスト関連の状態
    const [textElements, setTextElements] = React.useState([]);
    const [selectedTextIndex, setSelectedTextIndex] = React.useState(null);
    const [currentText, setCurrentText] = React.useState('');
    const [currentFont, setCurrentFont] = React.useState("'Noto Serif JP', serif");
    const [currentSize, setCurrentSize] = React.useState(24);
    const [currentColor, setCurrentColor] = React.useState('#000000');
    const [isVertical, setIsVertical] = React.useState(false);

    // スタンプ関連の状態
    const [stampElements, setStampElements] = React.useState([]);
    const [selectedStampIndex, setSelectedStampIndex] = React.useState(null);
    const [previewStamp, setPreviewStamp] = React.useState(null);

    // 画像アップロード処理
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
                setShowAdjustments(false);
                setShowTextControls(false);
                setShowStampControls(false);
                setShowLayoutControls(false);
            };
            reader.readAsDataURL(file);
        }
    };

    // 画像ロード時の処理
    const handleImageLoad = (e) => {
        const width = e.target.naturalWidth;
        const height = e.target.naturalHeight;
        
        setImageSize({ width, height });
        
        // 初期の切り抜き範囲を画像全体に設定
        setCropArea({
            x: 0,
            y: 0,
            width,
            height
        });
    };

    // ツールバーの処理
    const handleToolbarClick = (tool) => {
        setShowAdjustments(tool === 'adjust');
        setShowTextControls(tool === 'text');
        setShowStampControls(tool === 'stamp');
        setShowLayoutControls(tool === 'layout');

        // 選択状態のリセット
        if (tool !== 'text') setSelectedTextIndex(null);
        if (tool !== 'stamp') {
            setSelectedStampIndex(null);
            setPreviewStamp(null);
        }
    };

    // テキスト関連の処理
    const handleAddText = () => {
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
        setTextElements(prev => [...prev, newElement]);
        setSelectedTextIndex(textElements.length);
        setCurrentText('');
    };

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
        setShowTextControls(true);
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

    // レイアウト関連の処理
    const handleLayoutConfirm = () => {
        setShowLayoutControls(false);
    };

    const handleLayoutCancel = () => {
        if (imageSize) {
            setCropArea({
                x: 0,
                y: 0,
                width: imageSize.width,
                height: imageSize.height
            });
        }
        setShowLayoutControls(false);
    };

    // 画像スタイルの取得
    const getImageStyle = () => ({
        filter: `brightness(${adjustments.brightness}%) 
                contrast(${adjustments.contrast}%) 
                saturate(${adjustments.saturate}%)`
    });

    // エフェクト
    React.useEffect(() => {
        updateSelectedText();
    }, [currentText, currentFont, currentSize, currentColor, isVertical]);

    // メインのレンダリング
    return (
        <div className="editor-container" ref={editorRef}>
            {/* メインエディター領域 */}
            <div className={`editor-main ${showLayoutControls ? 'layout-mode' : ''}`}>
                {selectedImage ? (
                    <div className="editor-content">
                        {/* メイン画像 */}
                        <div className="image-container">
                            <img 
                                src={selectedImage} 
                                alt="プレビュー" 
                                className="preview-image"
                                style={getImageStyle()}
                                onLoad={handleImageLoad}
                            />
                        </div>

                        {/* レイアウトモード */}
                        {showLayoutControls && imageSize && (
                            <div className="layout-overlay">
                                <LayoutSelector
                                    imageSize={imageSize}
                                    cropArea={cropArea}
                                    onCropChange={setCropArea}
                                    onConfirm={handleLayoutConfirm}
                                    onCancel={handleLayoutCancel}
                                    selectedImage={selectedImage}
                                />
                            </div>
                        )}

                        {/* テキストとスタンプのレイヤー（レイアウトモード時は非表示） */}
                        {!showLayoutControls && (
                            <div className="text-layer">
                                {/* テキスト要素 */}
                                {textElements.map((element, index) => (
                                    <TextElement
                                        key={element.id}
                                        text={element.text}
                                        style={element.style}
                                        position={element.position}
                                        isSelected={index === selectedTextIndex}
                                        onSelect={() => handleTextSelect(index)}
                                        onDragStart={() => {}}
                                        onDrag={(pos) => handleTextDrag(index, pos)}
                                        onDragEnd={() => {}}
                                    />
                                ))}

                                {/* スタンプ要素 */}
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

                                {/* プレビュースタンプ */}
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
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <p>画像をアップロードしてください</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="file-input"
                        />
                    </div>
                )}
            </div>

            {/* ツールバー */}
            <div className="toolbar">
                <button 
                    className={`btn ${showAdjustments ? 'btn-primary' : ''}`}
                    onClick={() => handleToolbarClick('adjust')}
                    disabled={!selectedImage}
                >
                    画像調整
                </button>
                <button 
                    className={`btn ${showTextControls ? 'btn-primary' : ''}`}
                    onClick={() => handleToolbarClick('text')}
                    disabled={!selectedImage}
                >
                    文字入力
                </button>
                <button 
                    className={`btn ${showStampControls ? 'btn-primary' : ''}`}
                    onClick={() => handleToolbarClick('stamp')}
                    disabled={!selectedImage}
                >
                    スタンプ
                </button>
                <button 
                    className={`btn ${showLayoutControls ? 'btn-primary' : ''}`}
                    onClick={() => handleToolbarClick('layout')}
                    disabled={!selectedImage}
                >
                    レイアウト
                </button>
            </div>

            {/* 画像調整パネル */}
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
                    >
                        リセット
                    </button>
                </div>
            )}

            {/* テキストコントロールパネル */}
            {showTextControls && selectedImage && (
                <div className="control-panel">
                    <div className="writing-mode-toggle">
                        <button 
                            className={`btn ${!isVertical ? 'btn-primary' : ''}`}
                            onClick={() => setIsVertical(false)}
                        >
                            横書き
                        </button>
                        <button 
                            className={`btn ${isVertical ? 'btn-primary' : ''}`}
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
                        placeholder="テキストを入力"
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
                            <span className="size-value">{currentSize}px</span>
                        </div>
                        <div>
                            <label>文字色</label>
                            <input
                                type="color"
                                value={currentColor}
                                onChange={(e) => setCurrentColor(e.target.value)}
                                className="color-picker"
                            />
                        </div>
                    </div>

                    <button 
                        className="btn btn-primary"
                        onClick={handleAddText}
                        style={{marginTop: '10px'}}
                    >
                        新しいテキストを追加
                    </button>
                </div>
            )}

            {/* スタンプコントロールパネル */}
            {showStampControls && selectedImage && (
                <div className="control-panel">
                    <StampSelector 
                        onPreviewStamp={handlePreviewStamp}
                        onConfirmStamp={handleConfirmStamp}
                        onCancelStamp={handleCancelStamp}
                        onDeleteStamp={handleDeleteStamp}
                        isPreviewMode={!!previewStamp}
                        isEditing={selectedStampIndex !== null}
                    />
                </div>
            )}

            {/* チュートリアル */}
            {showTutorial && (
                <div className="tutorial">
                    <h3>簡単3ステップで年賀状を作成！</h3>
                    <ol>
                        <li>写真をアップロード</li>
                        <li>レイアウトを調整</li>
                        <li>文字やスタンプを追加</li>
                    </ol>
                    <button 
                        className="btn"
                        onClick={() => setShowTutorial(false)}
                    >
                        閉じる
                    </button>
                </div>
            )}

            {/* 下部のアクションボタン */}
            <div className="bottom-actions">
                <button 
                    className="btn btn-primary save-button"
                    disabled={!selectedImage}
                    onClick={() => {
                        // TODO: 保存処理を実装
                        console.log('Save functionality to be implemented');
                    }}
                >
                    保存する
                </button>
            </div>
        </div>
    );
};

// アプリケーションのレンダリング
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(NewYearCardEditor));
