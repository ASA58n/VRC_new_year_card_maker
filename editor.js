// TextElement コンポーネント
const TextElement = ({ text, style, position, isSelected, onSelect, onDragStart, onDrag, onDragEnd }) => {
    const elementRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [currentPosition, setCurrentPosition] = React.useState(position);

    // ドラッグ開始時の処理
    const handleMouseDown = (e) => {
        e.preventDefault();
        const rect = elementRef.current.getBoundingClientRect();
        const parentRect = elementRef.current.parentElement.getBoundingClientRect();
        
        setDragOffset({
            x: e.clientX - (rect.left - parentRect.left),
            y: e.clientY - (rect.top - parentRect.top)
        });
        
        setIsDragging(true);
        onDragStart();
        onSelect();
    };

    // ドラッグ中の処理
    const handleMouseMove = React.useCallback((e) => {
        if (!isDragging) return;

        e.preventDefault();
        const parentRect = elementRef.current.parentElement.getBoundingClientRect();
        const x = e.clientX - parentRect.left - dragOffset.x;
        const y = e.clientY - parentRect.top - dragOffset.y;

        // 位置の制約（エディタ領域内に収める）
        const newX = Math.max(0, Math.min(x, parentRect.width - elementRef.current.offsetWidth));
        const newY = Math.max(0, Math.min(y, parentRect.height - elementRef.current.offsetHeight));

        setCurrentPosition({ x: newX, y: newY });
        onDrag({ x: newX, y: newY });
    }, [isDragging, dragOffset, onDrag]);

    // ドラッグ終了時の処理
    const handleMouseUp = React.useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            onDragEnd();
        }
    }, [isDragging, onDragEnd]);

    // イベントリスナーの設定
    React.useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            
            // カーソルスタイルを設定
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            
            // カーソルスタイルを元に戻す
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // 位置の更新を反映
    React.useEffect(() => {
        setCurrentPosition(position);
    }, [position]);

    return (
        <div
            ref={elementRef}
            className={`text-element ${isSelected ? 'selected' : ''}`}
            style={{
                ...style,
                left: `${currentPosition.x}px`,
                top: `${currentPosition.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab',
                position: 'absolute',
                transition: isDragging ? 'none' : 'all 0.05s ease',
                touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                handleMouseDown({
                    preventDefault: () => {},
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            }}
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
const StampElement = ({ src, style, position, size, isSelected, onSelect, onDragStart, onDrag, onDragEnd, onResize }) => {
    const elementRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = React.useState({ width: 0, height: 0 });
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

    // ドラッグ処理
    const handleMouseDown = (e) => {
        if (e.target.classList.contains('resize-handle')) {
            return;
        }
        setIsDragging(true);
        // 修正点1: 親要素に対する相対位置を取得
        setDragOffset({
            x: e.clientX - elementRef.current.offsetLeft,
            y: e.clientY - elementRef.current.offsetTop
        });
        onDragStart();
        onSelect();
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        // 修正点2: 親要素に対する相対座標を計算
        const parentRect = elementRef.current.parentElement.getBoundingClientRect();
        const x = e.clientX - parentRect.left - (elementRef.current.offsetLeft);
        const y = e.clientY - parentRect.top - (elementRef.current.offsetTop);

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
const StampSelector = React.memo(({ 
    onPreviewStamp, 
    onConfirmStamp, 
    onCancelStamp, 
    onDeleteStamp,
    isPreviewMode, 
    isEditing 
}) => {
    const [uploadedStamps, setUploadedStamps] = React.useState([]);

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

// レイアウトの設定
const LAYOUT_PRESETS = [
    { id: 'portrait', name: '縦型', ratio: 2 / 3, width: 800, height: 1200 },     // 2:3
    { id: 'landscape', name: '横型', ratio: 3 / 2, width: 1200, height: 800 },    // 3:2
    { id: 'square', name: '正方形', ratio: 1, width: 1000, height: 1000 },        // 1:1
    { id: 'postcard', name: 'はがき', ratio: 100 / 148, width: 1000, height: 1480 } // はがきサイズ比
];

// LayoutSelector コンポーネント
const LayoutSelector = React.memo(({ selectedLayout, onLayoutSelect }) => {
    return (
        <div className="layout-selector">
            <h4>レイアウト設定</h4>
            <div className="layout-options">
                {LAYOUT_PRESETS.map(layout => (
                    <div 
                        key={layout.id}
                        className={`layout-option ${selectedLayout?.id === layout.id ? 'selected' : ''}`}
                        onClick={() => onLayoutSelect(layout)}
                    >
                        <div 
                            className="layout-preview"
                            style={{
                                aspectRatio: layout.ratio
                            }}
                        />
                        <span className="layout-name">{layout.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
});

// メインの NewYearCardEditor コンポーネント
const NewYearCardEditor = () => {
    // 基本的な状態管理
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [showTutorial, setShowTutorial] = React.useState(true);
    const [showAdjustments, setShowAdjustments] = React.useState(false);
    const [showTextControls, setShowTextControls] = React.useState(false);
    const [showStampControls, setShowStampControls] = React.useState(false);
    const [showLayoutControls, setShowLayoutControls] = React.useState(false);

    // 画像調整関連の状態
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

    // レイアウト関連の状態
    const [selectedLayout, setSelectedLayout] = React.useState(LAYOUT_PRESETS[0]);
    const [editorScale, setEditorScale] = React.useState(1);

    // エディタのサイズを計算するヘルパー関数
    const calculateEditorSize = React.useCallback(() => {
        const containerWidth = 800; // エディタコンテナの最大幅
        const containerHeight = 600; // エディタコンテナの最大高さ
        
        let targetWidth = selectedLayout.width;
        let targetHeight = selectedLayout.height;
        
        // コンテナに合わせてスケールを計算
        const widthScale = containerWidth / targetWidth;
        const heightScale = containerHeight / targetHeight;
        const scale = Math.min(widthScale, heightScale);
        
        setEditorScale(scale);
        
        return {
            width: targetWidth * scale,
            height: targetHeight * scale
        };
    }, [selectedLayout]);

    // エディタスタイルの計算
    const editorStyle = React.useMemo(() => {
        const size = calculateEditorSize();
        return {
            width: `${size.width}px`,
            height: `${size.height}px`,
            position: 'relative',
            overflow: 'hidden',
            margin: '0 auto',
            backgroundColor: '#f5f5f5',
            border: '2px dashed #ccc'
        };
    }, [calculateEditorSize]);

    // 画像スタイルの計算
    const getImageStyle = () => ({
        filter: `brightness(${adjustments.brightness}%) 
                contrast(${adjustments.contrast}%) 
                saturate(${adjustments.saturate}%)`
    });

    // ツールバーのトグル処理
    const handleToolbarClick = (tool) => {
        setShowAdjustments(tool === 'adjust');
        setShowTextControls(tool === 'text');
        setShowStampControls(tool === 'stamp');
        setShowLayoutControls(tool === 'layout');
    };

    // 初期テキスト要素の選択
    React.useEffect(() => {
        if (textElements.length > 0) {
            handleTextSelect(0);
        }
    }, []);

    // 画像アップロード処理
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setSelectedImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    // テキスト関連のハンドラー
    const handleTextSelect = (index) => {
        setSelectedTextIndex(index);
        const element = textElements[index];
        setCurrentText(element.text || '');
        setCurrentFont(element.style.fontFamily);
        setCurrentSize(parseInt(element.style.fontSize));
        setCurrentColor(element.style.color);
        setIsVertical(element.style.writingMode === 'vertical-rl');
        setSelectedStampIndex(null); // スタンプの選択を解除
    };

    const handleTextDrag = (index, position) => {
        const updatedElements = [...textElements];
        // スケールを考慮した位置計算
        const scaledPosition = {
            x: position.x / editorScale,
            y: position.y / editorScale
        };
        updatedElements[index] = {
            ...updatedElements[index],
            position: scaledPosition
        };
        setTextElements(updatedElements);
    };

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

    const updateSelectedText = React.useCallback(() => {
        if (selectedTextIndex === null || !textElements[selectedTextIndex]) return;
        
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
    }, [selectedTextIndex, currentText, currentFont, currentSize, currentColor, isVertical, textElements]);

    // テキスト更新の監視
    React.useEffect(() => {
        updateSelectedText();
    }, [updateSelectedText]);

    // スタンプ関連のハンドラー
    const handlePreviewStamp = (src, size) => {
        const newStamp = {
            id: Date.now(),
            src,
            position: { x: 50, y: 50 },
            size: {
                width: size.width * editorScale,
                height: size.height * editorScale
            }
        };
        setPreviewStamp(newStamp);
        setSelectedStampIndex(null);
        setSelectedTextIndex(null);
    };

    const handleStampDrag = (index, position) => {
        if (previewStamp) {
            setPreviewStamp(prev => ({
                ...prev,
                position
            }));
        } else if (selectedStampIndex !== null) {
            const updatedElements = [...stampElements];
            const scaledPosition = {
                x: position.x / editorScale,
                y: position.y / editorScale
            };
            updatedElements[selectedStampIndex] = {
                ...updatedElements[selectedStampIndex],
                position: scaledPosition
            };
            setStampElements(updatedElements);
        }
    };

    const handleStampResize = (index, size) => {
        if (previewStamp) {
            setPreviewStamp(prev => ({
                ...prev,
                size: {
                    width: size.width * editorScale,
                    height: size.height * editorScale
                }
            }));
        } else if (selectedStampIndex !== null) {
            const updatedElements = [...stampElements];
            const scaledSize = {
                width: size.width * editorScale,
                height: size.height * editorScale
            };
            updatedElements[selectedStampIndex] = {
                ...updatedElements[selectedStampIndex],
                size: scaledSize
            };
            setStampElements(updatedElements);
        }
    };

    const handleConfirmStamp = () => {
        if (previewStamp) {
            setStampElements(prev => [...prev, {
                ...previewStamp,
                position: {
                    x: previewStamp.position.x / editorScale,
                    y: previewStamp.position.y / editorScale
                },
                size: {
                    width: previewStamp.size.width / editorScale,
                    height: previewStamp.size.height / editorScale
                }
            }]);
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

    // レイアウトの変更処理
    const handleLayoutChange = React.useCallback((newLayout) => {
        setSelectedLayout(newLayout);
        
        // 既存の要素の位置とサイズを新しいレイアウトに合わせて調整
        const scaleRatio = {
            x: newLayout.width / selectedLayout.width,
            y: newLayout.height / selectedLayout.height
        };

        // テキスト要素の位置を調整
        setTextElements(prev => prev.map(element => ({
            ...element,
            position: {
                x: element.position.x * scaleRatio.x,
                y: element.position.y * scaleRatio.y
            }
        })));

        // スタンプ要素の位置とサイズを調整
        setStampElements(prev => prev.map(element => ({
            ...element,
            position: {
                x: element.position.x * scaleRatio.x,
                y: element.position.y * scaleRatio.y
            },
            size: {
                width: element.size.width * scaleRatio.x,
                height: element.size.height * scaleRatio.y
            }
        })));
    }, [selectedLayout]);

    // ダウンロード処理
    const handleDownload = React.useCallback(async () => {
        const editorElement = document.querySelector('.editor-main');
        if (!editorElement) return;

        try {
            // エディタのサイズを実際の出力サイズに設定 (変更点1: 直接スタイルを変更)
            editorElement.style.width = `${selectedLayout.width}px`;
            editorElement.style.height = `${selectedLayout.height}px`;
            editorElement.style.transform = 'none'; // 既存のtransformを削除

            // テキスト要素とスタンプ要素のスケーリングを削除 (変更点2: これらの要素のスタイル変更を削除)
            // これらの要素は、エディタのサイズ変更に応じて既に適切にレンダリングされていると仮定します。

            // html2canvasの設定 (変更点3: scale を 1 に変更)
            const options = {
                backgroundColor: null,
                scale: 1, // 高解像度化は不要になりました。
                useCORS: true,
                allowTaint: true,
                logging: false
            };

            // 画像の生成
            const canvas = await html2canvas(editorElement, options);

            // 画像のダウンロード
            const link = document.createElement('a');
            link.download = `年賀状_${new Date().getTime()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            // 元のスタイルを復元
            editorElement.style.width = ''; // デフォルトの幅にリセット
            editorElement.style.height = ''; // デフォルトの高さをリセット
            editorElement.style.transform = ''; // デフォルトのtransformにリセット

        } catch (error) {
            console.error('Download failed:', error);
            alert('ダウンロードに失敗しました。\n画像の生成中にエラーが発生しました。');
        }
    }, [selectedLayout]);

    // エラー処理用の関数
    const handleError = (error, message) => {
        console.error(message, error);
        alert(`エラーが発生しました。\n${message}`);
    };

    // 画面サイズ変更時の処理
    React.useEffect(() => {
        const handleResize = () => {
            calculateEditorSize();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calculateEditorSize]);

    // レイアウト変更時の処理
    React.useEffect(() => {
        calculateEditorSize();
    }, [selectedLayout, calculateEditorSize]);

        // レンダリング部分
return (
        <div className="editor-container">
            {/* メインエディター領域 */}
            <div className="editor-main" style={editorStyle}>
                {selectedImage ? (
                    <>
                        <img 
                            src={selectedImage} 
                            alt="プレビュー" 
                            className="preview-image"
                            style={{
                                ...getImageStyle(),
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                        <div className="text-layer">
                            {/* テキスト要素 */}
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
                    </>
                ) : (
                    <div style={{textAlign: 'center', padding: '20px'}}>
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

            {/* ツールバー */}
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

            {/* テキストコントロールパネル */}
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

                    // テキストコントロールパネルのボタン部分
                    <button 
                        className="btn btn-primary"
                        onClick={handleAddText}
                        style={{width: '100%', marginTop: '10px'}}
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
                        style={{marginTop: '10px'}}
                    >
                        リセット
                    </button>
                </div>
            )}

            {/* レイアウトコントロールパネル */}
            {showLayoutControls && selectedImage && (
                <div className="control-panel">
                    <LayoutSelector
                        selectedLayout={selectedLayout}
                        onLayoutSelect={setSelectedLayout}
                    />
                </div>
            )}

            {/* チュートリアル */}
            {showTutorial && (
                <div className="tutorial">
                    <h3>簡単3ステップで年賀状を作成！</h3>
                    <ol>
                        <li>写真をアップロード</li>
                        <li>テンプレートとスタンプを選択</li>
                        <li>文字を入力して完成</li>
                    </ol>
                    <button 
                        onClick={() => setShowTutorial(false)}
                        className="btn"
                    >
                        閉じる
                    </button>
                </div>
            )}

            {/* アクションボタン */}
            <div className="action-buttons" style={{width: '100%', marginTop: '20px', display: 'flex', gap: '10px'}}>
                {selectedImage && (
                    <button 
                        className="btn btn-primary" 
                        onClick={handleDownload}
                        style={{flex: 1}}
                    >
                        画像をダウンロード
                    </button>
                )}
            </div>
        </div>
    );
};

// アプリケーションのレンダリング
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<NewYearCardEditor />);
