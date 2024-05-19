// src/BabylonViewer.js
import React, {useEffect, useRef, useState} from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';
import '@babylonjs/materials';
import {GLTF2Export} from '@babylonjs/serializers';
import earcut from 'earcut';
import {AbstractMesh, Vector3} from "@babylonjs/core";

const fontData = await (await fetch("./Arial_Bold.json")).json();


const BabylonViewer = ({text, download}) => {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const sceneRef = useRef(null);
    const [textMesh, setTextMesh] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const engine = new BABYLON.Engine(canvas, true);
        engineRef.current = engine;

        const scene = new BABYLON.Scene(engine);
        sceneRef.current = scene;

        const camera = new BABYLON.ArcRotateCamera('camera1', -Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        engine.runRenderLoop(() => {
            scene.render();
        });

        return () => {
            engine.dispose();
        };
    }, []);

    useEffect(() => {
        if (sceneRef.current && text) {
            const scene = sceneRef.current;

            if (textMesh) {
                textMesh.dispose();
            }
            const txtMesh = BABYLON.MeshBuilder.CreateText("text", text, fontData, {size: 2, depth:2}, scene, earcut)
            const plateMesh = BABYLON.MeshBuilder.CreateBox("plate", {width: 15, height: 5, depth: 1})
            const aCSG = BABYLON.CSG.FromMesh(txtMesh);
            const bCSG = BABYLON.CSG.FromMesh(plateMesh);
            txtMesh.position = new Vector3(0,-1,0)
            plateMesh.visibility = 0
            txtMesh.visibility = 0

            // Set up a MultiMaterial
            const mat0 = new BABYLON.StandardMaterial("mat0", scene);
            bCSG.subtractInPlace(aCSG);
            const newMesh = bCSG.toMesh("test", mat0, scene, true)
            //const newMesh = subCSG.toMesh("csg2", mat0, scene);

        }
    }, [text]);

    useEffect(() => {
        if (download) {
            const scene = sceneRef.current;
            GLTF2Export.GLTFAsync(scene, 'text.gltf').then(gltf => {
                gltf.downloadFiles();
            });
        }
    }, [download]);

    return <canvas ref={canvasRef} style={{width: '100%', height: '400px'}}/>;
};

export default BabylonViewer;
