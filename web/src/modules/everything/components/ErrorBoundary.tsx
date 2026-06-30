import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class SceneErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-screen items-center justify-center bg-bg">
            <div className="max-w-md text-center">
              <h2 className="mb-2 text-xl font-semibold text-text">
                3D场景加载失败
              </h2>
              <p className="mb-4 text-text-secondary">
                {this.state.error?.message || '未知错误'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-button bg-primary px-4 py-2 text-white"
              >
                重新加载
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
