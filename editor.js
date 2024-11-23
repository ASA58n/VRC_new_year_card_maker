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

// メインの NewYearCardEditor コンポーネント
const NewYearCardEditor = () => {
    // 状態管理
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [showTutorial, setShowTutorial] = React.useState(true);
    const [showAdjustments, setShowAdjustments] = React.useState(false);
    const [showTextControls, setShowTextControls] = React.useState(false);
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
            fontFamily: 'serif',
            fontSize: '24px',
            color: '#000000',
            writingMode: 'horizontal-tb'
        }
    }]);
    const [selectedTextIndex, setSelectedTextIndex] = React.useState(0);
    const [currentText, setCurrentText] = React.useState('');
    const [currentFont, setCurrentFont] = React.useState('serif');
    const [currentSize, setCurrentSize] = React.useState(24);
    const [currentColor, setCurrentColor] = React.useState('#000000');
    const [isVertical, setIsVertical] = React.useState(false);

    // フォントオプション
    const fonts = [
        { name: '明朝体', value: 'serif' },
        { name: 'ゴシック体', value: 'sans-serif' },
        { name: '楷書体', value: 'cursive' }
    ];

    // イメージ処理関連の関数
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setSelectedImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const getImageStyle = () => ({
        filter: `brightness(${adjustments.brightness}%) 
                contrast(${adjustments.contrast}%) 
                saturate(${adjustments.saturate}%)`
    });

    // テキスト処理関連の関数
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

        setTextElements([...textElements, newElement]);
        setSelectedTextIndex(textElements.length);
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

    // コンポーネントマウント時に最初のテキスト要素を選択
    React.useEffect(() => {
        if (textElements.length > 0) {
            handleTextSelect(0);
        }
    }, []);

    // 選択されたテキストの更新を監視
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
                                    onSelect={() => handleTextSelect(index)}
                                    onDragStart={() => {}}
                                    onDrag={(pos) => handleTextDrag(index, pos)}
                                    onDragEnd={() => {}}
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
                    onClick={() => {
                        setShowAdjustments(!showAdjustments);
                        setShowTextControls(false);
                    }}
                >
                    画像調整
                </button>
                <button 
                    className={`btn ${showTextControls ? 'btn-primary' : ''}`}
                    onClick={() => {
                        setShowTextControls(!showTextControls);
                        setShowAdjustments(false);
                    }}
                >
                    文字入力
                </button>
                <button className="btn">スタンプ</button>
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

                    <select 
                        className="font-select"
                        value={currentFont}
                        onChange={(e) => setCurrentFont(e.target.value)}
                    >
                        {fonts.map(font => (
                            <option key={font.value} value={font.value}>
                                {font.name}
                            </option>
                        ))}
                    </select>

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
                        onClick={handleAddText}
                        style={{width: '100%', marginTop: '10px'}}
                    >
                        新しいテキストを追加
                    </button>
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
