/*
    SlideCanvas — Konva-based canvas editor for individual slides.

    English developer notes:

    - Purpose: Provide a performant, interactive canvas for slide elements
        (text, images, shapes) using `react-konva`. Konva provides efficient
        Canvas rendering and transformation primitives which simplifies
        drag/resize/rotation behaviors compared to DOM-based approaches.

    - Design decisions:
        * Use an off-DOM textarea overlay for inline text editing because
            Konva does not provide native HTML input. This keeps editing
            lightweight and avoids coupling text editing to Konva internals.
        * `useImage` helper loads images with `crossOrigin='anonymous'` to
            enable exporting the canvas later if needed.

    - Difficulties & solutions:
        * Challenge: keeping transformer selection in sync during rapid
            re-renders. Solution: we explicitly find the selected node by id
            and call `transformer.nodes([node])` inside an effect that watches
            `selectedId` and `slide.elements`.
*/
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Circle, Arrow, Transformer } from 'react-konva';
import type Konva from 'konva';

// ── Types ─────────────────────────────────────────────────────────────

export interface SlideElement {
    id: string;
    type: 'text' | 'image' | 'shape';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    // Text
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontStyle?: string;
    fill?: string;
    align?: 'left' | 'center' | 'right' | 'justify';
    // Image
    src?: string;
    // Shape
    shapeType?: 'rect' | 'circle' | 'arrow' | 'line';
    stroke?: string;
    strokeWidth?: number;
}

export interface Slide {
    id: string;
    elements: SlideElement[];
    background: string;
    speakerNotes: string;
    layout?: string;
}

interface SlideCanvasProps {
    slide: Slide;
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onElementUpdate: (id: string, changes: Partial<SlideElement>) => void;
    onElementDelete: (id: string) => void;
    scale?: number;
    interactive?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

// ── Helpers ───────────────────────────────────────────────────────────

function useImage(src?: string): HTMLImageElement | undefined {
    const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
    useEffect(() => {
        if (!src) { 
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImage(undefined); 
            return; 
        }
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => setImage(img);
        img.src = src;
    }, [src]);
    return image;
}

// ── Sub-components ────────────────────────────────────────────────────

const ImageElement: React.FC<{
    el: SlideElement;
    onSelect: () => void;
    onChange: (changes: Partial<SlideElement>) => void;
}> = ({ el, onSelect, onChange }) => {
    const image = useImage(el.src);
    const shapeRef = useRef<Konva.Image>(null);

    if (!image) return null;
    return (
        <KonvaImage
            ref={shapeRef}
            id={el.id}
            image={image}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            rotation={el.rotation}
            draggable
            onClick={onSelect}
            onTap={onSelect}
            onDragEnd={(e) => {
                onChange({ x: e.target.x(), y: e.target.y() });
            }}
            onTransformEnd={() => {
                const node = shapeRef.current;
                if (!node) return;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                onChange({
                    x: node.x(), y: node.y(),
                    width: Math.max(20, node.width() * scaleX),
                    height: Math.max(20, node.height() * scaleY),
                    rotation: node.rotation(),
                });
            }}
        />
    );
};

// ── Main Component ────────────────────────────────────────────────────

const SlideCanvas: React.FC<SlideCanvasProps> = ({
    slide,
    selectedId,
    onSelect,
    onElementUpdate,
    onElementDelete,
    scale = 1,
    interactive = true,
}) => {
    const transformerRef = useRef<Konva.Transformer>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);

    // Sync transformer to selected node
    useEffect(() => {
        if (!transformerRef.current || !layerRef.current || !interactive) return;
        if (selectedId) {
            const node = layerRef.current.findOne('#' + selectedId);
            if (node) {
                transformerRef.current.nodes([node]);
                transformerRef.current.getLayer()?.batchDraw();
                return;
            }
        }
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
    }, [selectedId, slide.elements, interactive]);

    // Keyboard handler
    useEffect(() => {
        if (!interactive) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Delete' && selectedId && editingTextId !== selectedId) {
                onElementDelete(selectedId);
                onSelect(null);
            }
            if (e.key === 'Escape') {
                onSelect(null);
                setEditingTextId(null);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [selectedId, editingTextId, onElementDelete, onSelect, interactive]);

    // Stage click on empty area → deselect
    const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (e.target === e.target.getStage()) {
            onSelect(null);
            setEditingTextId(null);
        }
    }, [onSelect]);

    // Double-click on text → inline edit via textarea overlay
    const handleTextDblClick = useCallback((el: SlideElement, textNode: Konva.Text) => {
        if (!interactive) return;
        setEditingTextId(el.id);

        const stage = stageRef.current;
        if (!stage) return;
        const stageContainer = stage.container();
        const stageBox = stageContainer.getBoundingClientRect();

        const textPosition = textNode.absolutePosition();
        const areaPosition = {
            x: stageBox.left + textPosition.x * scale,
            y: stageBox.top + textPosition.y * scale,
        };

        const textarea = document.createElement('textarea');
        stageContainer.parentElement?.appendChild(textarea);

        textarea.value = el.text || '';
        textarea.style.position = 'fixed';
        textarea.style.top = `${areaPosition.y}px`;
        textarea.style.left = `${areaPosition.x}px`;
        textarea.style.width = `${el.width * scale}px`;
        textarea.style.height = `${el.height * scale}px`;
        textarea.style.fontSize = `${(el.fontSize || 20) * scale}px`;
        textarea.style.fontFamily = el.fontFamily || 'Inter, sans-serif';
        textarea.style.color = el.fill || '#fff';
        textarea.style.background = 'rgba(0,0,0,0.8)';
        textarea.style.border = '2px solid #38bdf8';
        textarea.style.borderRadius = '4px';
        textarea.style.padding = '4px';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.zIndex = '9999';
        textarea.style.lineHeight = '1.4';
        textarea.style.overflow = 'hidden';

        textarea.focus();

        const removeTextarea = () => {
            onElementUpdate(el.id, { text: textarea.value });
            textarea.remove();
            setEditingTextId(null);
        };

        textarea.addEventListener('blur', removeTextarea);
        textarea.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                removeTextarea();
            }
        });
    }, [scale, onElementUpdate, interactive]);

    // ── Render ──────────────────────────────────────────────────────────

    // Parse background
    const bgColor = slide.background.startsWith('linear') ? '#0f172a' : slide.background;

    return (
        <Stage
            ref={stageRef}
            width={CANVAS_WIDTH * scale}
            height={CANVAS_HEIGHT * scale}
            scaleX={scale}
            scaleY={scale}
            onClick={handleStageClick}
            onTap={handleStageClick}
            style={{ borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
            <Layer ref={layerRef}>
                {/* Folienhintergrund */}
                <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill={bgColor} cornerRadius={4} />

                {/* Elemente */}
                {slide.elements.map((el) => {

                    if (el.type === 'text') {
                        return (
                            <Text
                                key={el.id}
                                id={el.id}
                                x={el.x}
                                y={el.y}
                                width={el.width}
                                height={el.height}
                                text={el.text || ''}
                                fontSize={el.fontSize || 20}
                                fontFamily={el.fontFamily || 'Inter, sans-serif'}
                                fontStyle={el.fontStyle || 'normal'}
                                fill={el.fill || '#e2e8f0'}
                                align={el.align || 'left'}
                                verticalAlign="top"
                                rotation={el.rotation}
                                draggable={interactive}
                                visible={editingTextId !== el.id}
                                onClick={() => interactive && onSelect(el.id)}
                                onTap={() => interactive && onSelect(el.id)}
                                onDblClick={(e) => handleTextDblClick(el, e.target as Konva.Text)}
                                onDblTap={(e) => handleTextDblClick(el, e.target as Konva.Text)}
                                onDragEnd={(e) => {
                                    onElementUpdate(el.id, { x: e.target.x(), y: e.target.y() });
                                }}
                                onTransformEnd={(e) => {
                                    const node = e.target as Konva.Text;
                                    const scaleX = node.scaleX();
                                    const scaleY = node.scaleY();
                                    node.scaleX(1);
                                    node.scaleY(1);
                                    onElementUpdate(el.id, {
                                        x: node.x(), y: node.y(),
                                        width: Math.max(20, node.width() * scaleX),
                                        height: Math.max(20, node.height() * scaleY),
                                        rotation: node.rotation(),
                                    });
                                }}
                            />
                        );
                    }

                    if (el.type === 'image') {
                        return (
                            <ImageElement
                                key={el.id}
                                el={el}
                                onSelect={() => interactive && onSelect(el.id)}
                                onChange={(changes) => onElementUpdate(el.id, changes)}
                            />
                        );
                    }

                    if (el.type === 'shape') {
                        if (el.shapeType === 'circle') {
                            return (
                                <Circle
                                    key={el.id}
                                    id={el.id}
                                    x={el.x + el.width / 2}
                                    y={el.y + el.height / 2}
                                    radius={Math.min(el.width, el.height) / 2}
                                    fill={el.fill || '#38bdf8'}
                                    stroke={el.stroke}
                                    strokeWidth={el.strokeWidth || 0}
                                    rotation={el.rotation}
                                    draggable={interactive}
                                    onClick={() => interactive && onSelect(el.id)}
                                    onTap={() => interactive && onSelect(el.id)}
                                    onDragEnd={(e) => {
                                        onElementUpdate(el.id, {
                                            x: e.target.x() - el.width / 2,
                                            y: e.target.y() - el.height / 2,
                                        });
                                    }}
                                />
                            );
                        }

                        if (el.shapeType === 'arrow') {
                            return (
                                <Arrow
                                    key={el.id}
                                    id={el.id}
                                    points={[0, 0, el.width, 0]}
                                    x={el.x}
                                    y={el.y}
                                    fill={el.fill || '#38bdf8'}
                                    stroke={el.stroke || '#38bdf8'}
                                    strokeWidth={el.strokeWidth || 3}
                                    rotation={el.rotation}
                                    draggable={interactive}
                                    onClick={() => interactive && onSelect(el.id)}
                                    onTap={() => interactive && onSelect(el.id)}
                                    onDragEnd={(e) => {
                                        onElementUpdate(el.id, { x: e.target.x(), y: e.target.y() });
                                    }}
                                />
                            );
                        }

                        // Default: rect (also used for accent lines / placeholders)
                        return (
                            <Rect
                                key={el.id}
                                id={el.id}
                                x={el.x}
                                y={el.y}
                                width={el.width}
                                height={el.height}
                                fill={el.fill || '#1e293b'}
                                stroke={el.stroke}
                                strokeWidth={el.strokeWidth || 0}
                                cornerRadius={4}
                                rotation={el.rotation}
                                draggable={interactive}
                                onClick={() => interactive && onSelect(el.id)}
                                onTap={() => interactive && onSelect(el.id)}
                                onDragEnd={(e) => {
                                    onElementUpdate(el.id, { x: e.target.x(), y: e.target.y() });
                                }}
                                onTransformEnd={(e) => {
                                    const node = e.target as Konva.Rect;
                                    const sx = node.scaleX();
                                    const sy = node.scaleY();
                                    node.scaleX(1);
                                    node.scaleY(1);
                                    onElementUpdate(el.id, {
                                        x: node.x(), y: node.y(),
                                        width: Math.max(10, node.width() * sx),
                                        height: Math.max(10, node.height() * sy),
                                        rotation: node.rotation(),
                                    });
                                }}
                            />
                        );
                    }

                    return null;
                })}

                {/* Transformer for selected element */}
                {interactive && (
                    <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 10 || newBox.height < 10) return oldBox;
                            return newBox;
                        }}
                        anchorSize={8}
                        anchorCornerRadius={2}
                        borderStroke="#38bdf8"
                        anchorStroke="#38bdf8"
                        anchorFill="#0f172a"
                    />
                )}
            </Layer>
        </Stage>
    );
};

export default SlideCanvas;
