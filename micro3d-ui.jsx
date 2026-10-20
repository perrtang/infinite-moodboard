import React from "react";
import { RotateCcw } from "lucide-react";

const MICRO_3D_CONTROLS = [
  { key: "tiltX", label: "X 軸傾斜", min: -30, max: 30, step: 1, unit: "°" },
  { key: "tiltY", label: "Y 軸傾斜", min: -30, max: 30, step: 1, unit: "°" },
  { key: "depth", label: "前後景深", min: -120, max: 120, step: 2, unit: "px" },
  { key: "perspective", label: "透視距離", min: 500, max: 2000, step: 50, unit: "px" },
];

const MICRO_3D_PRESETS = [
  { label: "左傾", values: { tiltX: 4, tiltY: -16, depth: 12, perspective: 1000 } },
  { label: "正面", values: { tiltX: 0, tiltY: 0, depth: 0, perspective: 1000 } },
  { label: "右傾", values: { tiltX: 4, tiltY: 16, depth: 12, perspective: 1000 } },
];

export function Micro3DActiveControls({ objects, onChange }) {
  const first = objects[0];
  if (!first) return null;
  const hasMixedValues = MICRO_3D_CONTROLS.some(({ key }) =>
    objects.some((object) => Number(object[key]) !== Number(first[key])),
  );
  const resetDisabled = objects.every((object) =>
    Math.abs(Number(object.tiltX) || 0) < 0.01
      && Math.abs(Number(object.tiltY) || 0) < 0.01
      && Math.abs(Number(object.depth) || 0) < 0.01
      && Math.abs((Number(object.perspective) || 1000) - 1000) < 0.01,
  );

  return (
    <>
      <div className="micro-3d-status">
        <span>物件軌道已啟用</span>
        {objects.length > 1 ? <strong>{hasMixedValues ? "混合值" : `${objects.length} 個同步`}</strong> : <strong>單一物件</strong>}
      </div>
      <div className="micro-3d-presets" role="group" aria-label="微 3D 預設">
        {MICRO_3D_PRESETS.map((preset) => (
          <button key={preset.label} type="button" onClick={() => onChange(preset.values)}>{preset.label}</button>
        ))}
      </div>
      <div className="micro-3d-controls">
        {MICRO_3D_CONTROLS.map((control) => {
          const fallback = control.key === "perspective" ? 1000 : 0;
          const value = Number.isFinite(Number(first[control.key])) ? Number(first[control.key]) : fallback;
          const mixed = objects.some((object) => (Number(object[control.key]) || fallback) !== value);
          const displayValue = Math.round(value * 10) / 10;
          return (
            <label key={control.key}>
              <span className="micro-3d-label">
                <span>{control.label}</span>
                <output>{mixed ? "混合" : `${displayValue}${control.unit}`}</output>
              </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={Math.min(control.max, Math.max(control.min, value))}
                aria-label={control.label}
                onChange={(event) => onChange({ [control.key]: Number(event.target.value) })}
              />
            </label>
          );
        })}
      </div>
      <button
        className="quiet-button micro-3d-reset"
        type="button"
        onClick={() => onChange({ tiltX: 0, tiltY: 0, depth: 0, perspective: 1000 })}
        disabled={resetDisabled}
      >
        <RotateCcw size={15} /> 3D 歸零
      </button>
      <p className="transform-helper">直接拖曳選取物件或軌道可像軌跡球一樣旋轉；X、Y、Z 可限制軸向，Shift 鎖定自由旋轉的主軸。</p>
    </>
  );
}

export function Rotation3DGizmo({
  inverseZoom,
  left = "50%",
  top = "50%",
  counterRotation = 0,
  activeAxis = null,
  onStart,
  onReset,
  group = false,
}) {
  const startAxis = (event, axis) => onStart(event, axis);
  const reset = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onReset();
  };
  return (
    <div
      className={`rotation-3d-gizmo ${group ? "is-group" : ""}`}
      role="group"
      aria-label={group ? "多選 3D 旋轉軌道" : "3D 旋轉軌道"}
      style={{
        left,
        top,
        "--gizmo-inverse-zoom": inverseZoom,
        "--gizmo-counter-rotation": `${counterRotation}deg`,
      }}
    >
      <button
        className={`gizmo-orbit ${activeAxis === "free" ? "is-active" : ""}`}
        type="button"
        aria-label="自由 3D 旋轉"
        title="拖曳自由旋轉；Shift 鎖定主軸；連按兩下 3D 歸零"
        onPointerDown={(event) => startAxis(event, "free")}
        onDoubleClick={reset}
      >
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <ellipse className="gizmo-ring gizmo-ring-x" cx="50" cy="50" rx="38" ry="13" />
          <ellipse className="gizmo-ring gizmo-ring-y" cx="50" cy="50" rx="13" ry="38" />
          <circle className="gizmo-ring gizmo-ring-z" cx="50" cy="50" r="31" />
          <circle className="gizmo-core" cx="50" cy="50" r="5" />
        </svg>
      </button>
      {[
        ["x", "X", "只沿 X 軸旋轉"],
        ["y", "Y", "只沿 Y 軸旋轉"],
        ["z", "Z", "只沿 Z 軸旋轉"],
      ].map(([axis, label, description]) => (
        <button
          key={axis}
          className={`gizmo-axis gizmo-axis-${axis} ${activeAxis === axis ? "is-active" : ""}`}
          type="button"
          aria-label={description}
          title={description}
          onPointerDown={(event) => startAxis(event, axis)}
        >
          {label}
        </button>
      ))}
      <span className="gizmo-caption" aria-hidden="true">3D 旋轉</span>
    </div>
  );
}
