export default function WebGLUnsupportedPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-bg">
      <div className="max-w-md text-center">
        <h2 className="mb-2 text-xl font-semibold text-text">
          您的浏览器不支持3D渲染
        </h2>
        <p className="mb-4 text-text-secondary">
          请使用 Chrome、Edge 或 Safari 最新版本浏览器
        </p>
        <a
          href="/items"
          className="inline-block rounded-button bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          返回物品管理
        </a>
      </div>
    </div>
  )
}
