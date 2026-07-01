/** 20×20×3m 房间尺寸与边界常量 */
export const ROOM_WIDTH = 20
export const ROOM_DEPTH = 20
export const ROOM_HEIGHT = 3
export const ROOM_HALF_WIDTH = ROOM_WIDTH / 2
export const ROOM_HALF_DEPTH = ROOM_DEPTH / 2

/** WASD 移动边界（距墙 0.2m） */
export const ROOM_MARGIN = 0.2
export const ROOM_MOVE_BOUND_X = ROOM_HALF_WIDTH - ROOM_MARGIN
export const ROOM_MOVE_BOUND_Z = ROOM_HALF_DEPTH - ROOM_MARGIN

/** 旋转视角时允许轻微穿出墙面 */
export const ROOM_ROTATE_EXTRA = 0.15
export const ROOM_ROTATE_BOUND_X = ROOM_MOVE_BOUND_X + ROOM_ROTATE_EXTRA
export const ROOM_ROTATE_BOUND_Z = ROOM_MOVE_BOUND_Z + ROOM_ROTATE_EXTRA

export const ROOM_BOUND_Y_MIN = 0.5
export const ROOM_BOUND_Y_MAX = 2.8
export const DEFAULT_EYE_HEIGHT = 1.6

export const ROOM_WALL_FADE_DISTANCE = 0.3
export const ROOM_WALL_FADE_OPACITY = 0.35

export const ROOM_WALL_COLOR = '#F5F5DC'
export const ROOM_FLOOR_COLOR = '#D4A574'

/** 垂直视角限制（FPS pitch，弧度） */
export const FPS_PITCH_MIN = -0.45
export const FPS_PITCH_MAX = 0.45
export const FPS_LOOK_SENSITIVITY = 0.002
export const FPS_WHEEL_SENSITIVITY = 0.3

/** @deprecated OrbitControls polar angles — 已改用 FPS pitch */
export const ROOM_MIN_POLAR_ANGLE = Math.PI / 2 - 0.45
/** @deprecated OrbitControls polar angles — 已改用 FPS pitch */
export const ROOM_MAX_POLAR_ANGLE = Math.PI / 2 + 0.45

/** 模型自动适配目标水平宽度（米） */
export const MODEL_TARGET_WIDTH = 1
