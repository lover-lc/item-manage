interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = '加载中...' }: LoadingScreenProps) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-bg">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-text-secondary">{message}</p>
      </div>
    </div>
  )
}
