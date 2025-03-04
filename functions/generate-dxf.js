import { useState } from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";
import { Button } from "@/components/ui/button";

export default function PartsBuilder() {
  const [shapes, setShapes] = useState([]);
  const [dxfUrl, setDxfUrl] = useState(null);

  const addShape = (type) => {
    const newShape = {
      id: shapes.length,
      type,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      radius: 50,
      holes: []
    };
    setShapes([...shapes, newShape]);
  };

  const addHole = (shapeId) => {
    setShapes(
      shapes.map((shape) =>
        shape.id === shapeId
          ? {
              ...shape,
              holes: [...shape.holes, { x: shape.width / 2, y: shape.height / 2, radius: 10 }],
            }
          : shape
      )
    );
  };

  const exportDXF = async () => {
    try {
      const response = await fetch("/.netlify/functions/generate-dxf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shapes }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate DXF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDxfUrl(url);
    } catch (error) {
      console.error("Error generating DXF:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-4">Parts Builder</h1>
      <div className="mb-4 flex gap-2">
        <Button onClick={() => addShape("rectangle")}>Add Rectangle</Button>
        <Button onClick={() => addShape("circle")}>Add Circle</Button>
        <Button onClick={exportDXF} className="bg-blue-500 text-white">Generate DXF</Button>
      </div>
      {dxfUrl && (
        <a href={dxfUrl} download="part.dxf" className="text-blue-600 mt-4">Download DXF</a>
      )}
      <Stage width={400} height={400} className="border border-gray-400">
        <Layer>
          {shapes.map((shape) =>
            shape.type === "rectangle" ? (
              <Rect
                key={shape.id}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                fill="gray"
                draggable
                onDblClick={() => addHole(shape.id)}
              />
            ) : (
              <Circle
                key={shape.id}
                x={shape.x + shape.radius}
                y={shape.y + shape.radius}
                radius={shape.radius}
                fill="gray"
                draggable
                onDblClick={() => addHole(shape.id)}
              />
            )
          )}
        </Layer>
      </Stage>
    </div>
  );
}
