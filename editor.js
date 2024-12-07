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

// StampSelector コンポーネント
const StampSelector = React.memo(({ 
    onPreviewStamp, 
    onConfirmStamp, 
    onCancelStamp, 
    onDeleteStamp,
    isPreviewMode, 
    isEditing 
}) => {
    const presetStampFiles = [
        'stamp_01.png',
        'stamp_02.png',
        //'stamp3.png'
        // stamp ディレクトリに配置したファイル名を列挙
    ];
    const [uploadedStamps, setUploadedStamps] = React.useState([]);
    
    // presetStampsの宣言を一つにまとめる
    const presetStamps = React.useMemo(() => 
        presetStampFiles.map(file => ({
            id: file,
            src: `./stamp/${file}`
        }))
    , []);

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
        const img = new Image();
        img.onload = () => {
            const maxSize = 200;
            let width = img.width / 3;
            let height = img.height / 3;
            
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
            {/* プリセットスタンプ */}
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

            {/* カスタムスタンプアップロード */}
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

// SelectionArea コンポーネント - 画像の選択範囲を制御
const SelectionArea = ({ position, size, isVisible, onMove, onResize }) => {
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

        if (isResizing) {
            const dx = e.clientX - startPos.x;
            const dy = e.clientY - startPos.y;
            onResize({
                width: Math.max(100, startSize.width + dx),
                height: Math.max(100, startSize.height + dy)
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    // リサイズ処理
    const handleResizeStart = (e) => {
        e.stopPropagation();
        setIsResizing(true);
        setStartSize({ width: size.width, height: size.height });
        setStartPos({ x: e.clientX, y: e.clientY });
    };

    React.useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
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
            }}
            onMouseDown={handleMouseDown}
        >
            <div 
                className="resize-handle"
                style={{
                    position: 'absolute',
                    width: '10px',
                    height: '10px',
                    background: '#4a90e2',
                    border: '1px solid white',
                    borderRadius: '50%',
                    bottom: '-5px',
                    right: '-5px',
                    cursor: 'se-resize',
                }}
                onMouseDown={handleResizeStart}
            />
        </div>
    );
};

// 画像のダウンロード処理用のユーティリティ関数
const downloadImage = async (originalImage, elements, selectionArea = null, adjustments) => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // イメージとキャンバスの位置関係を計算
            const imageRect = originalImage.getBoundingClientRect();
            const parentRect = originalImage.parentElement.getBoundingClientRect();
            const displayWidth = imageRect.width;
            const displayHeight = imageRect.height;
            const scaleX = img.naturalWidth / displayWidth;
            const scaleY = img.naturalHeight / displayHeight;

            // キャンバスのサイズと描画範囲を設定
            let sx, sy, sWidth, sHeight;
            if (selectionArea) {
                // 選択範囲の位置を実際の画像サイズに変換
                const relativeX = selectionArea.position.x - (imageRect.left - parentRect.left);
                const relativeY = selectionArea.position.y - (imageRect.top - parentRect.top);
                
                sx = relativeX * scaleX;
                sy = relativeY * scaleY;
                sWidth = selectionArea.size.width * scaleX;
                sHeight = selectionArea.size.height * scaleY;
                
                canvas.width = sWidth;
                canvas.height = sHeight;
            } else {
                sx = 0;
                sy = 0;
                sWidth = img.naturalWidth;
                sHeight = img.naturalHeight;
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
            }

            // 画像調整を適用
            ctx.filter = `brightness(${adjustments.brightness}%) 
                         contrast(${adjustments.contrast}%) 
                         saturate(${adjustments.saturate}%)`;

            // 画像を描画
            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
            
            // フィルターをリセット
            ctx.filter = 'none';

            // 要素の描画用の変換スケール
            const scale = selectionArea ? 
                (canvas.width / selectionArea.size.width) : 
                scaleX;

            // テキストとスタンプを描画
            elements.forEach(element => {
                const elementX = selectionArea ?
                    (element.position.x - selectionArea.position.x) :
                    (element.position.x - (imageRect.left - parentRect.left));
                const elementY = selectionArea ?
                    (element.position.y - selectionArea.position.y) :
                    (element.position.y - (imageRect.top - parentRect.top));

                if (element.type === 'text') {
                    const fontSize = parseInt(element.style.fontSize) * scale;
                    ctx.font = `${fontSize}px ${element.style.fontFamily.replace(/[']/g, '')}`;
                    ctx.fillStyle = element.style.color;

                    if (element.style.writingMode === 'vertical-rl') {
                        const chars = element.text.split('');
                        let currentY = elementY * scale;
                        chars.forEach(char => {
                            ctx.fillText(char, elementX * scale, currentY);
                            currentY += fontSize;
                        });
                    } else {
                        ctx.fillText(element.text, elementX * scale, elementY * scale + fontSize);
                    }
                } else if (element.type === 'stamp') {
                    const stampImg = new Image();
                    stampImg.onload = () => {
                        const width = element.size.width * scale;
                        const height = element.size.height * scale;
                        ctx.drawImage(
                            stampImg,
                            elementX * scale,
                            elementY * scale,
                            width,
                            height
                        );
                    };
                    stampImg.src = element.src;
                }
            });

            // スタンプの読み込みを待ってからダウンロード
            setTimeout(() => {
                const link = document.createElement('a');
                link.download = 'newyear-card.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                resolve();
            }, 500);
        };

        img.src = originalImage.src;
    });
};

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
    const [previewStamp, setPreviewStamp] = React.useState(null);

    const [showLayoutControls, setShowLayoutControls] = React.useState(false);
    const [selectionArea, setSelectionArea] = React.useState(null);

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

    // ツールバーのトグル処理
    const handleToolbarClick = (tool) => {
        setShowAdjustments(tool === 'adjust');
        setShowTextControls(tool === 'text');
        setShowStampControls(tool === 'stamp');
        setShowLayoutControls(tool === 'layout');
        
        // ツール以外を選択した時は選択範囲を非表示
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
    
        // 全要素を配列にまとめる
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
            adjustments  // 画像調整の設定を追加
        );
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
    // レンダリング部分
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
                            {/* 選択範囲 */}
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

            {/* チュートリアル */}
            {showTutorial && (
                <div className="tutorial">
                    <h3>VRChatの年賀状を作成！</h3>
                    <ol>
                        <li>写真をアップロード</li>
                        <li>画像の明るさなどを調整</li>
                        <li>スタンプやテキスト入力で文字やアイコンで装飾！</li>
                        <li>レイアウトからダウンロードして完成！</li>
                    </ol>
                    <h4>こちらのサイトにスタンプとして使えそうな素材があるので良ければ！</h4>
                    <ul>
                        <li><a href="https://www.post.japanpost.jp/send/create/freeillust/downloads/">郵便局フリーイラスト</a></li>
                        <li><a href="https://online.brother.co.jp/ot/nengajo/stamp/?page=1">brother 年賀状素材</a></li>
                        <li><a href="https://pepero-nenga.com/illust/nengajoo_illust_index.html">年賀状スープ 無料イラスト</a></li>
                    </ul>
                </div>
            )}

        </div>
    );
};

// アプリケーションのレンダリング
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<NewYearCardEditor />);
