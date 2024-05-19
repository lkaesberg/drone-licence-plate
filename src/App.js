// src/App.js
import React, { useState } from 'react';
import BabylonViewer from './BabylonViewer';
import './App.css';

function App() {
    const [text, setText] = useState('');
    const [renderText, setRenderText] = useState('');
    const [download, setDownload] = useState(false);

    const handleRenderClick = () => {
        setRenderText(text);
        setDownload(false);
    };

    const handleDownloadClick = () => {
        setDownload(true);
    };

    return (
        <div className="App">
            <h1>Arbeit Renderer</h1>
            <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter text here"
            />
            <button onClick={handleRenderClick}>Render Text</button>
            <button onClick={handleDownloadClick}>Download as GLTF</button>
            <BabylonViewer text={renderText} download={download} />
        </div>
    );
}

export default App;
