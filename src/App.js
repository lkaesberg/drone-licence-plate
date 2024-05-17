import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import {CSG} from 'three-csg-ts';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {OBJExporter} from "three/examples/jsm/exporters/OBJExporter";
import {mergeVertices} from "three/examples/jsm/utils/BufferGeometryUtils";
import {Vector3} from "three";

const App = () => {
    const [text, setText] = useState('Sample Text');
    const previewRef = useRef();

    useEffect(() => {
        let scene, camera, renderer, textMesh, plateMesh, resultMesh, controls;

        const init = () => {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(40, 2, 0.1, 1000);
            camera.position.z = 60;

            renderer = new THREE.WebGLRenderer({antialias: true});
            renderer.setSize(1000, 500);
            renderer.setClearColor(0x121212);
            if (previewRef.current.firstChild) {
                // If there's a first child, replace it with the renderer's DOM element
                previewRef.current.replaceChild(renderer.domElement, previewRef.current.firstChild);
            } else {
                // If there's no child, simply append the renderer's DOM element
                previewRef.current.appendChild(renderer.domElement);
            }

            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            // Add directional light
            const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
            directionalLight.position.set(5, 5, 5);
            directionalLight.castShadow = true;  // Enable shadows for the light
            directionalLight.shadow.mapSize.width = 1024;
            directionalLight.shadow.mapSize.height = 1024;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 500;
            scene.add(directionalLight);

            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.enableZoom = true;

            updateText();
        };

        const updateText = () => {
            const loader = new FontLoader();
            loader.load('/Arial_Bold.json', (font) => {
                if (textMesh) {
                    scene.remove(textMesh);
                }
                const geometry = new TextGeometry(text, {
                    font: font,
                    size: 3,
                    height: 10,
                    curveSegments: 12,
                });

                const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
                textMesh = new THREE.Mesh(geometry, material);

                const plateGeometry = new THREE.BoxGeometry(40, 10, 1);
                plateMesh = new THREE.Mesh(plateGeometry, new THREE.MeshBasicMaterial({color: 0xff0000}));

                scene.add(textMesh);

// Compute bounding boxes
                const plateBBox = new THREE.Box3().setFromObject(plateMesh);
                const textBBox = new THREE.Box3().setFromObject(textMesh);

// Calculate centers
                const plateCenter = new THREE.Vector3();
                const textCenter = new THREE.Vector3();
                plateBBox.getCenter(plateCenter);
                textBBox.getCenter(textCenter);

// Translate text mesh to center it on the plate
                const offset = plateCenter.clone().sub(textCenter);
                textMesh.position.add(offset);
                textMesh.position.add(new Vector3(0, 0, 1))

// Update the bounding box of the text mesh after positioning
                textMesh.updateMatrixWorld(true);

// Perform CSG subtraction
                const cubeCSG = CSG.fromMesh(plateMesh)
                const textCSG = CSG.fromMesh(textMesh)

                const subtractCSG = cubeCSG.subtract(textCSG)

                let finalGeo = CSG.toGeometry(
                    subtractCSG,
                    new THREE.Matrix4()
                )
                const finalMesh = new THREE.Mesh(finalGeo, new THREE.MeshNormalMaterial())
                scene.add(finalMesh)

                scene.remove(plateMesh);
                scene.remove(textMesh);

                render();
            });
        };

        const render = () => {
            requestAnimationFrame(render);
            renderer.render(scene, camera);
        };

        const downloadModel = () => {
            const exporter = new OBJExporter();
            const stlString = exporter.parse(scene);

            const blob = new Blob([stlString], {type: 'text/plain'});
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = URL.createObjectURL(blob);
            link.download = 'model.obj';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        init();

        document.getElementById('generate').addEventListener('click', updateText);
        document.getElementById('download').addEventListener('click', downloadModel);

        return () => {
            if (renderer) {
                renderer.dispose();
            }
        };
    }, [text]);

    return (
        <div style={styles.container}>
            <h1>3D Text Model Generator</h1>
            <label htmlFor="text">Enter Text:</label>
            <input
                type="text"
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={styles.input}
            />
            <button id="generate" style={styles.button}>Generate 3D Model</button>
            <div id="preview" ref={previewRef} style={styles.preview}></div>
            <button id="download" style={styles.button}>Download 3D Model</button>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#121212',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        margin: 0,
    },
    input: {
        padding: '8px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#333333',
        color: '#ffffff',
        margin: '10px 0',
        fontSize: '16px',
    },
    button: {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#6200ea',
        color: '#ffffff',
        cursor: 'pointer',
        margin: '10px 0',
        fontSize: '16px',
    },
    buttonHover: {
        backgroundColor: '#3700b3',
    },
    preview: {
        width: '1000px',
        height: '500px',
        backgroundColor: '#1e1e1e',
        marginTop: '20px',
    },
};

export default App;
