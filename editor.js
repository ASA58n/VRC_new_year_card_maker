// TextElement コンポーネント - ドラッグ可能なテキスト要素
const TextElement = ({ text, style, position, isSelected, onSelect, onDragStart, onDrag, onDragEnd }) => {
    const elementRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

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

// FontSelector コンポーネント
const FontSelector = React.memo(() => {
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
    const selectedFont = fonts.find(f => f.value === currentFont);

    // フォント選択ハンドラー
    const handleFontSelect = React.useCallback((fontValue) => {
        setCurrentFont(fontValue);
        setIsExpanded(false);
    }, []);

    return (
        <div className="font-selector">
            {/* 現在選択中のフォントプレビュー */}
            <div className="font-preview">
                <label>フォント</label>
                <div 
                    className="current-font-sample"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span 
                        className="sample-text"
                        style={{ fontFamily: selectedFont.value }}
                    >
                        {selectedFont.sample}
                    </span>
                    <div className="preview-footer">
                        <span className="font-name">{selectedFont.name}</span>
                        <span className="expand-icon">
                            {isExpanded ? '▼' : '▶'}
                        </span>
                    </div>
                </div>
            </div>

            {/* フォント選択パネル */}
            {isExpanded && (
                <div className="font-selection-panel">
                    {categories.map(category => (
                        <div key={category.id} className="font-category">
                            <h4 className="category-title">{category.name}</h4>
                            <div className="font-samples">
                                {category.fonts.map(font => (
                                    <div 
                                        key={font.value}
                                        className={`font-sample ${currentFont === font.value ? 'selected' : ''}`}
                                        onClick={() => handleFontSelect(font.value)}
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

// StampElement コンポーネント
const StampElement = ({ src, style, position, size, isSelected, onSelect, onDragStart, onDrag, onDragEnd, onResize }) => {
    const elementRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = React.useState({ width: 0, height: 0 });
    const [startPos, setStartPos] = React.useState({ x: 0, y: 0 });

    // ドラッグ処理
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

// StampSelector コンポーネント
const StampSelector = React.memo(({ onAddStamp }) => {
    const [uploadedStamps, setUploadedStamps] = React.useState([]);
    const [previewStamp, setPreviewStamp] = React.useState(null);

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

    const handlePreviewStamp = (stamp) => {
        // 適切な初期サイズを計算（元のサイズの1/3）
        const maxSize = 200;
        let width = stamp.originalSize.width / 3;
        let height = stamp.originalSize.height / 3;
        
        // サイズが大きすぎる場合は調整
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

        setPreviewStamp({
            ...stamp,
            size: { width, height }
        });
    };

    const handleConfirm = () => {
        if (previewStamp) {
            onAddStamp(previewStamp.src, previewStamp.size);
            setPreviewStamp(null);
        }
    };

    const handleCancel = () => {
        setPreviewStamp(null);
    };

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
            
            {uploadedStamps.length > 0 && !previewStamp && (
                <div className="uploaded-stamps">
                    <h4>アップロードした画像</h4>
                    <div className="stamp-grid">
                        {uploadedStamps.map(stamp => (
                            <div 
                                key={stamp.id}
                                className="stamp-item"
                                onClick={() => handlePreviewStamp(stamp)}
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

            {previewStamp && (
                <div className="stamp-preview-container">
                    <h4>スタンプを配置</h4>
                    <p>画像上の好きな位置にドラッグして配置し、サイズを調整してください</p>
                    <div className="preview-actions">
                        <button 
                            className="btn btn-primary"
                            onClick={handleConfirm}
                        >
                            確定
                        </button>
                        <button 
                            className="btn"
                            onClick={handleCancel}
                        >
                            キャンセル
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

// メインの NewYearCardEditor コンポーネント
const NewYearCardEditor = () => {
    // 状態管理
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

    // 画像アップロード処理
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setSelectedImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    // 画像スタイル
    const getImageStyle = () => ({
        filter: `brightness(${adjustments.brightness}%) 
                contrast(${adjustments.contrast}%) 
                saturate(${adjustments.saturate}%)`
    });

    // スタンプ関連の処理
    const handleAddStamp = (src, size) => {
        const newStamp = {
            id: Date.now(),
            src,
            position: { x: 50, y: 50 },
            size
        };
        setStampElements(prev => [...prev, newStamp]);
        setSelectedStampIndex(stampElements.length);
        setSelectedTextIndex(null);
    };

    const handleStampDrag = (index, position) => {
        const updatedElements = [...stampElements];
        updatedElements[index] = {
            ...updatedElements[index],
            position
        };
        setStampElements(updatedElements);
    };

    const handleStampResize = (index, size) => {
        const updatedElements = [...stampElements];
        updatedElements[index] = {
            ...updatedElements[index],
            size
        };
        setStampElements(updatedElements);
    };

    // テキスト関連の処理
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

    // ツールバーのトグル処理
    const handleToolbarClick = (tool) => {
        setShowAdjustments(tool === 'adjust');
        setShowTextControls(tool === 'text');
        setShowStampControls(tool === 'stamp');
    };

    // 初期テキスト要素の選択
    React.useEffect(() => {
        if (textElements.length > 0) {
            handleTextSelect(0);
        }
    }, []);

    // テキスト更新の監視
    React.useEffect(() => {
        updateSelectedText();
    }, [currentText, currentFont, currentSize, currentColor, isVertical]);
    
    // UI レンダリング
    return (
        <div className="editor-container">
            {/* メインエディター領域 */}
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
                <button className="btn">レイアウト</button>
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

                    <FontSelector />

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

            {/* スタンプコントロールパネル */}
            {showStampControls && selectedImage && (
                <div className="control-panel">
                    <StampSelector onAddStamp={handleAddStamp} />
                    {selectedStampIndex !== null && (
                        <button 
                            className="btn btn-danger"
                            onClick={() => {
                                setStampElements(prev => prev.filter((_, i) => i !== selectedStampIndex));
                                setSelectedStampIndex(null);
                            }}
                            style={{width: '100%', marginTop: '10px'}}
                        >
                            選択中のスタンプを削除
                        </button>
                    )}
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

            {/* 保存ボタン */}
            <button className="btn btn-primary" style={{width: '100%', marginTop: '20px'}}>
                保存する
            </button>
        </div>
    );
};

// アプリケーションのレンダリング
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<NewYearCardEditor />);
